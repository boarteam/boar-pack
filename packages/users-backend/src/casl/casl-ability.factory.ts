import { AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects, PureAbility, RawRule, } from '@casl/ability';
import { Roles, User } from '../users/entities/user.entity';
import { Action } from './action.enum';
import { Injectable } from '@nestjs/common';
import { PackRule, packRules } from '@casl/ability/extra';
import { AnyObject } from '@casl/ability/dist/types/types';
import { Permission } from '../users/entities/permissions';
import { EventLog } from '../event-logs';

export interface TSubjects {
  User: typeof User;
  EventLog: typeof EventLog;
}

export type TTextSubjects = 'all';

export type TSubjectsNames =
  | keyof TSubjects
  | TTextSubjects;
type Subjects =
  | InferSubjects<TSubjects[keyof TSubjects]>
  | TTextSubjects;

export type AppAbility = PureAbility<[Action, Subjects], AnyObject>;

type TAbilityDefiner = (
  user: Pick<User, 'id' | 'role' | 'permissions'>,
  can: AbilityBuilder<AppAbility>['can'],
  cannot: AbilityBuilder<AppAbility>['cannot'],
) => Promise<void>;

@Injectable()
export class CaslAbilityFactory {
  private static permissionsToActionsMap: {
    [key in Permission]?: {
      action: Action;
      subject: Subjects | Subjects[];
    }
  } = {};

  private static abilitiesDefiners: Set<TAbilityDefiner> = new Set();

  public static addPermissionToAction({
    permission, action, subject,
  }: {
    permission: Permission,
    action: Action,
    subject: Subjects | Subjects[],
  }) {
    CaslAbilityFactory.permissionsToActionsMap[permission] = {
      action,
      subject
    };
  }

  public static addAbilitiesDefiner(definer: TAbilityDefiner) {
    CaslAbilityFactory.abilitiesDefiners.add(definer);
  }

  public async createForUser(user: Pick<User, 'id' | 'role' | 'permissions'>) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(PureAbility as AbilityClass<AppAbility>);

    switch (user.role) {
      case Roles.ADMIN:
        can(Action.Manage, 'all');
        break;

      case Roles.USER:
        user.permissions.forEach((permission) => {
          const actionAndSubject = CaslAbilityFactory.permissionsToActionsMap[permission];
          if (!actionAndSubject) {
            throw new Error(`Unknown permission: ${permission}`);
          }

          const { action, subject } = actionAndSubject;
          // @ts-ignore
          can(action, subject);
        });
        break;
    }

    await Promise.all(
      Array.from(CaslAbilityFactory.abilitiesDefiners).map((definer) => definer(user, can, cannot)),
    );

    return build({
      // Read https://casl.js.org/v5/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
      conditionsMatcher: (conditions) => {
        return (obj) => {
          return Object.keys(conditions).every(
            (prop) => conditions[prop] === obj[prop],
          );
        };
      },
    });
  }

  packAbility(ability: AppAbility): PackRule<RawRule>[] {
    return packRules(
      ability.rules.map((rule) => ({
        action: rule.action,
        subject: rule.subject,
        inverted: rule.inverted,
        conditions: rule.conditions,
      })),
      (item) => {
        if (typeof item === 'string') {
          return item;
        }

        if (Array.isArray(item)) {
          throw new Error('Cannot serialize ability');
        }

        return item.name;
      },
    );
  }
}
