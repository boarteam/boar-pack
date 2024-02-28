import { AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects, PureAbility, RawRule, } from '@casl/ability';
import { Permissions, Roles, User } from '../users/entities/user.entity';
import { Action } from './action.enum';
import { Injectable } from '@nestjs/common';
import { PackRule, packRules } from '@casl/ability/extra';
import { AnyObject } from '@casl/ability/dist/types/types';
import { Platform } from "../platforms/entities/platform.entity";
import { InstrumentsGroup } from "../instruments-groups/entities/instruments-group.entity";
import { EcnModule } from "../liquidity-management/ecn-modules/entities/ecn-module.entity";
import { StoredFilter } from '../stored-filters/entities/stored-filter.entity';
import { EcnInstrument } from '../liquidity-management/ecn-instruments/entities/ecn-instrument.entity';
import { EcnInstrumentsGroup } from '../liquidity-management/ecn-instruments-groups/entities/ecn-instruments-group.entity';
import { UsersGroupsInst } from '../liquidity-management/users-groups-inst/entities/users-groups-inst.entity';
import { UsersInst } from '../liquidity-management/users-inst/entities/users-inst.entity';
import { EcnModuleType } from '../liquidity-management/ecn-module-types/entities/ecn-module-type.entity';
import { ConfigService } from '@nestjs/config';
import { Setting } from "../settings/entities/setting.entity";
import { EcnConnectSchema } from '../liquidity-management/ecn-connect-schema/entities/ecn-connect-schema.entity';
import { EcnSubscrSchema } from '../liquidity-management/ecn-subscr-schema/entities/ecn-subscr-schema.entity';
import { EcnConnectSchemaSetupLabel } from '../liquidity-management/ecn-connect-schema-setup-labels/entities/ecn-connect-schema-setup-label.entity';
import {
  UsersSubAccountInst
} from "../liquidity-management/users-sub-accounts-inst/entities/users-sub-account-inst.entity";
import {
  SubloginSettings
} from "../liquidity-management/sublogin-settings/entities/sublogin-settings.entity";

type TSubjects = {
  User: typeof User;
  Platform: typeof Platform;
  InstrumentsGroup: typeof InstrumentsGroup;
  EcnModule: typeof EcnModule;
  StoredFilter: typeof StoredFilter;
  EcnModuleType: typeof EcnModuleType;
  EcnConnectShema: typeof EcnConnectSchema;
  EcnConnectSchemaSetupLabel: typeof EcnConnectSchemaSetupLabel;
  EcnSubscrSchema: typeof EcnSubscrSchema,
  EcnInstrument: typeof EcnInstrument;
  EcnInstrumentsGroup: typeof EcnInstrumentsGroup;
  UsersGroupsInst: typeof UsersGroupsInst;
  UsersInst: typeof UsersInst;
  UsersSubAccountInst: typeof UsersSubAccountInst;
  SubloginSettings: typeof SubloginSettings;
  Setting: typeof Setting;
};

type TTextSubjects = 'QuotesMonitor' | 'Notifications' | 'Liquidity' | 'all';

export type TSubjectsNames =
  | keyof TSubjects
  | TTextSubjects;
type Subjects =
  | InferSubjects<TSubjects[keyof TSubjects]>
  | TTextSubjects;

export type AppAbility = PureAbility<[Action, Subjects], AnyObject>;

const permissionToActionMap: {
  [key in Permissions]: {
    action: Action;
    subject: Subjects | Subjects[];
  }
} = {
  [Permissions.VIEW_QUOTES_MONITOR]: {
    action: Action.Read,
    subject: 'QuotesMonitor',
  },
  [Permissions.VIEW_INSTRUMENTS_GROUPS]: {
    action: Action.Read,
    subject: InstrumentsGroup,
  },
  [Permissions.MANAGE_INSTRUMENTS_GROUPS]: {
    action: Action.Manage,
    subject: InstrumentsGroup,
  },
  [Permissions.VIEW_STORED_FILTERS]: {
    action: Action.Read,
    subject: StoredFilter,
  },
  [Permissions.MANAGE_STORED_FILTERS]: {
    action: Action.Manage,
    subject: StoredFilter,
  },
  [Permissions.VIEW_USERS]: {
    action: Action.Read,
    subject: User,
  },
  [Permissions.VIEW_TRADING_PLATFORMS]: {
    action: Action.Read,
    subject: Platform,
  },
  [Permissions.MANAGE_TRADING_PLATFORMS]: {
    action: Action.Manage,
    subject: Platform,
  },
  [Permissions.MANAGE_SETTINGS]: {
    action: Action.Manage,
    subject: Setting,
  },
  [Permissions.VIEW_LIQUIDITY]: {
    action: Action.Read,
    subject: [
      EcnModule,
      EcnModuleType,
      EcnConnectSchema,
      EcnConnectSchemaSetupLabel,
      EcnSubscrSchema,
      EcnInstrument,
      EcnInstrumentsGroup,
      UsersGroupsInst,
      UsersInst,
      UsersSubAccountInst,
      'Liquidity'
    ],
  },
  [Permissions.MANAGE_LIQUIDITY]: {
    action: Action.Manage,
    subject: [
      EcnModule,
      EcnModuleType,
      EcnConnectSchema,
      EcnConnectSchemaSetupLabel,
      EcnSubscrSchema,
      EcnInstrument,
      EcnInstrumentsGroup,
      UsersGroupsInst,
      UsersInst,
      UsersSubAccountInst,
      'Liquidity'
    ],
  },
}

@Injectable()
export class CaslAbilityFactory {
  constructor(
    private readonly configService: ConfigService,
  ) {
  }

  createForUser(user: Pick<User, 'id' | 'role' | 'permissions'>) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(PureAbility as AbilityClass<AppAbility>);

    switch (user.role) {
      case Roles.ADMIN:
        can(Action.Manage, 'all');
        break;

      case Roles.USER:
        user.permissions.forEach((permission) => {
          const { action, subject } = permissionToActionMap[permission];
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
