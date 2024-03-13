import { AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects, PureAbility, RawRule, } from '@casl/ability';
import { Roles, User } from '../users/entities/user.entity';
import { Action } from './action.enum';
import { Injectable } from '@nestjs/common';
import { PackRule, packRules } from '@casl/ability/extra';
import { AnyObject } from '@casl/ability/dist/types/types';
import { Permission } from '../users/entities/permissions';

export interface TSubjects {
  User: typeof User;
}

export type TTextSubjects = 'all';

export type TSubjectsNames =
  | keyof TSubjects
  | TTextSubjects;
type Subjects =
  | InferSubjects<TSubjects[keyof TSubjects]>
  | TTextSubjects;

export type AppAbility = PureAbility<[Action, Subjects], AnyObject>;

@Injectable()
export class CaslAbilityFactory {
  private static permissionsToActionsMap: {
    [key in Permission]?: {
      action: Action;
      subject: Subjects | Subjects[];
    }
  } = {};

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

  createForUser(user: Pick<User, 'id' | 'role' | 'permissions'>) {
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
