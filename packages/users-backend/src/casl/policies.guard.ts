import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppAbility, CaslAbilityFactory } from './casl-ability.factory';

export interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

export type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;

export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);

export const SKIP_POLICIES_GUARD = 'skip_policies_guard';
export const SkipPoliciesGuard = () => SetMetadata(SKIP_POLICIES_GUARD, true);

@Injectable()
export class PoliciesGuard implements CanActivate {
  private readonly logger = new Logger(PoliciesGuard.name);

  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipGuard = this.reflector.getAllAndOverride<boolean>(
      SKIP_POLICIES_GUARD,
      [context.getHandler(), context.getClass()],
    );
    if (skipGuard) {
      return true;
    }

    const policyHandlers = this.reflector.getAllAndOverride<
      PolicyHandler[] | undefined
    >(CHECK_POLICIES_KEY, [context.getHandler(), context.getClass()]);

    if (!policyHandlers) {
      this.logger.warn(
        'Policies for action are not found. Endpoints are closed by default',
      );
      return false;
    }

    let user;
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      user = request.user;
    } else if (context.getType() === 'ws') {
      const client = context.switchToWs().getClient();
      user = client.user;
    } else {
      throw new Error('Unknown context type');
    }

    const ability = await this.caslAbilityFactory.createForUser(user);
    user.ability = ability;

    return policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
