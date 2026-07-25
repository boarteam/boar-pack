import { ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from './casl-ability.factory';
import {
  CHECK_POLICIES_KEY,
  IPolicyHandler,
  PoliciesGuard,
  PolicyHandler,
  SKIP_POLICIES_GUARD,
} from './policies.guard';

describe('PoliciesGuard', () => {
  const ability = { spec: 'ability-stub' } as any;
  let caslAbilityFactory: { createForUser: jest.Mock };
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    caslAbilityFactory = {
      createForUser: jest.fn().mockResolvedValue(ability),
    };
    warnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  function createGuard(metadata: {
    skip?: boolean;
    handlers?: PolicyHandler[];
  }): PoliciesGuard {
    const reflector = {
      getAllAndOverride: jest.fn((key: string) => {
        if (key === SKIP_POLICIES_GUARD) {
          return metadata.skip;
        }
        if (key === CHECK_POLICIES_KEY) {
          return metadata.handlers;
        }
        return undefined;
      }),
    } as unknown as Reflector;

    return new PoliciesGuard(
      reflector,
      caslAbilityFactory as unknown as CaslAbilityFactory,
    );
  }

  function createContext(opts: { type?: string; user?: any } = {}) {
    const request: any = { user: opts.user ?? { id: 'user-1' } };
    const context = {
      getHandler: () => function testHandler() {},
      getClass: () => class TestController {},
      getType: () => opts.type ?? 'http',
      switchToHttp: () => ({ getRequest: () => request }),
      switchToWs: () => ({ getClient: () => request }),
    } as unknown as ExecutionContext;
    return { context, request };
  }

  it('denies access and warns when no policy metadata is present (closed by default)', async () => {
    const guard = createGuard({});
    const { context } = createContext();

    await expect(guard.canActivate(context)).resolves.toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(
      'Policies for action are not found. Endpoints are closed by default',
    );
    expect(caslAbilityFactory.createForUser).not.toHaveBeenCalled();
  });

  it('bypasses policy checks when SkipPoliciesGuard metadata is set', async () => {
    const guard = createGuard({ skip: true, handlers: [() => false] });
    const { context } = createContext();

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(caslAbilityFactory.createForUser).not.toHaveBeenCalled();
  });

  it('allows access when every callback handler approves', async () => {
    const handlerA = jest.fn().mockReturnValue(true);
    const handlerB = jest.fn().mockReturnValue(true);
    const guard = createGuard({ handlers: [handlerA, handlerB] });
    const { context, request } = createContext();

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(handlerA).toHaveBeenCalledWith(ability);
    expect(handlerB).toHaveBeenCalledWith(ability);
    expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(request.user);
  });

  it('denies access when any handler rejects', async () => {
    const guard = createGuard({ handlers: [() => true, () => false] });
    const { context } = createContext();

    await expect(guard.canActivate(context)).resolves.toBe(false);
  });

  it('supports class-based policy handlers via handle()', async () => {
    const policy: IPolicyHandler = { handle: jest.fn().mockReturnValue(true) };
    const guard = createGuard({ handlers: [policy] });
    const { context } = createContext();

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(policy.handle).toHaveBeenCalledWith(ability);
  });

  it('builds the ability for the request user and attaches it to the user', async () => {
    const user = { id: 'attach-me' };
    const guard = createGuard({ handlers: [() => true] });
    const { context, request } = createContext({ user });

    await guard.canActivate(context);

    expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(user);
    expect(request.user.ability).toBe(ability);
  });

  it('takes the user from the ws client for ws contexts', async () => {
    const handler = jest.fn().mockReturnValue(true);
    const guard = createGuard({ handlers: [handler] });
    const { context, request } = createContext({ type: 'ws' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(request.user);
    expect(request.user.ability).toBe(ability);
  });

  it('throws for unknown context types', async () => {
    const guard = createGuard({ handlers: [() => true] });
    const { context } = createContext({ type: 'rpc' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      'Unknown context type',
    );
  });
});
