import { Logger } from '@nestjs/common';
import { createMongoAbility } from '@casl/ability';
import { unpackRules } from '@casl/ability/extra';
import { CaslAbilityFactory } from './casl-ability.factory';
import { Action } from './action.enum';
import { Roles, User } from '../users/entities/user.entity';
import { Token } from '../tokens/entities/token.entity';
import { Setting } from '../settings/entities/setting.entity';

// The permission/definer registries on CaslAbilityFactory are static (global
// for the process), so every name registered here is prefixed to avoid
// clashing with registrations made by imported modules.
const VIEW_USERS_PERMISSION = 'spec:casl-factory:view-users';
const VIEW_USERS_AND_TOKENS_PERMISSION = 'spec:casl-factory:view-users-and-tokens';
const DEFINER_USER_ID = 'spec-casl-factory-definer-user';

describe('CaslAbilityFactory', () => {
  const factory = new CaslAbilityFactory();

  beforeAll(() => {
    CaslAbilityFactory.addPermissionToAction({
      permission: VIEW_USERS_PERMISSION,
      action: Action.Read,
      subject: User,
    });
    CaslAbilityFactory.addPermissionToAction({
      permission: VIEW_USERS_AND_TOKENS_PERMISSION,
      action: Action.Read,
      subject: [User, Token],
    });
    // Definer is keyed to a unique user id so it stays inert for the other
    // tests in this file (the definers registry is global too).
    CaslAbilityFactory.addAbilitiesDefiner(async (user, can) => {
      if (user.id === DEFINER_USER_ID) {
        can(Action.Update, Setting);
      }
    });
  });

  it('grants admins manage on all', async () => {
    const ability = await factory.createForUser({
      id: 'admin-id',
      role: Roles.ADMIN,
      permissions: [],
    });

    expect(ability.can(Action.Manage, 'all')).toBe(true);
    // "manage all" covers any action on any subject
    expect(ability.can(Action.Delete, User)).toBe(true);
    expect(ability.can(Action.Read, Token)).toBe(true);
  });

  it('maps registered permissions to abilities for regular users', async () => {
    const ability = await factory.createForUser({
      id: 'user-id',
      role: Roles.USER,
      permissions: [VIEW_USERS_PERMISSION],
    });

    expect(ability.can(Action.Read, User)).toBe(true);
    expect(ability.can(Action.Update, User)).toBe(false);
    expect(ability.can(Action.Read, Setting)).toBe(false);
    expect(ability.can(Action.Manage, 'all')).toBe(false);
  });

  it('supports permissions registered with an array of subjects', async () => {
    const ability = await factory.createForUser({
      id: 'user-id',
      role: Roles.USER,
      permissions: [VIEW_USERS_AND_TOKENS_PERMISSION],
    });

    expect(ability.can(Action.Read, User)).toBe(true);
    expect(ability.can(Action.Read, Token)).toBe(true);
    expect(ability.can(Action.Read, Setting)).toBe(false);
  });

  it('ignores unregistered permissions and logs a warning', async () => {
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

    try {
      const ability = await factory.createForUser({
        id: 'user-id',
        role: Roles.USER,
        permissions: ['spec:casl-factory:never-registered'],
      });

      expect(ability.rules).toHaveLength(0);
      expect(warnSpy).toHaveBeenCalledWith(
        'Unknown permission: spec:casl-factory:never-registered',
      );
    } finally {
      warnSpy.mockRestore();
    }
  });

  it('runs registered ability definers', async () => {
    const withDefiner = await factory.createForUser({
      id: DEFINER_USER_ID,
      role: Roles.USER,
      permissions: [],
    });
    expect(withDefiner.can(Action.Update, Setting)).toBe(true);

    const otherUser = await factory.createForUser({
      id: 'someone-else',
      role: Roles.USER,
      permissions: [],
    });
    expect(otherUser.can(Action.Update, Setting)).toBe(false);
  });

  it('detects subject types from entity instances', async () => {
    const ability = await factory.createForUser({
      id: 'user-id',
      role: Roles.USER,
      permissions: [VIEW_USERS_PERMISSION],
    });

    const user = new User();
    const setting = new Setting();
    expect(ability.can(Action.Read, user)).toBe(true);
    expect(ability.can(Action.Read, setting)).toBe(false);
  });

  describe('packAbility', () => {
    it('serializes text subjects as-is', async () => {
      const ability = await factory.createForUser({
        id: 'admin-id',
        role: Roles.ADMIN,
        permissions: [],
      });

      expect(factory.packAbility(ability)).toEqual([['manage', 'all']]);
    });

    it('serializes class subjects by name and stays usable by @casl/ability', async () => {
      const ability = await factory.createForUser({
        id: 'user-id',
        role: Roles.USER,
        permissions: [VIEW_USERS_PERMISSION],
      });

      const packed = factory.packAbility(ability);
      expect(packed).toEqual([['read', 'User']]);

      // Round-trip: the packed rules can rebuild a working ability on a client.
      const rebuilt = createMongoAbility(unpackRules(packed));
      expect(rebuilt.can(Action.Read, 'User')).toBe(true);
      expect(rebuilt.can(Action.Update, 'User')).toBe(false);
    });
  });
});
