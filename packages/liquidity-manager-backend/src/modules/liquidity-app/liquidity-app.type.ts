import { EcnConnectSchemaSetupLabel } from "../ecn-connect-schema-setup-labels/entities/ecn-connect-schema-setup-label.entity";
import { EcnConnectSchema } from "../ecn-connect-schema/entities/ecn-connect-schema.entity";
import { EcnInstrumentsGroup } from "../ecn-instruments-groups/entities/ecn-instruments-group.entity";
import { EcnInstrument } from "../ecn-instruments/entities/ecn-instrument.entity";
import { EcnModuleType } from "../ecn-module-types/entities/ecn-module-type.entity";
import { EcnModule } from "../ecn-modules/entities/ecn-module.entity";
import { EcnSubscrSchema } from "../ecn-subscr-schema/entities/ecn-subscr-schema.entity";
import { SubloginSettings } from "../sublogin-settings/entities/sublogin-settings.entity";
import { UsersGroupsInst } from "../users-groups-inst/entities/users-groups-inst.entity";
import { UsersInst } from "../users-inst/entities/users-inst.entity";
import { UsersSubAccountInst } from "../users-sub-accounts-inst/entities/users-sub-account-inst.entity";
import { LiquidityManager } from "../liquidity-managers";
import { RealTimeData } from "../real-time-data/policies/view-real-time-data.policy";
import { UserInfo } from "../user-info/policies/view-user-info.policy";
import { ViewInstrumentsSpecification } from "../view-instruments-specifications/entities/view-instruments-specifications.entity";
import { ReportAccountStatement } from "../report-account-statements/entities/report-account-statement.entity";

export * from '@jifeon/boar-pack-users-backend';

declare module '@jifeon/boar-pack-users-backend' {
  interface TSubjects {
    EcnModule: typeof EcnModule;
    ViewInstrumentsSpecification: typeof ViewInstrumentsSpecification;
    EcnModuleType: typeof EcnModuleType;
    EcnConnectSchema: typeof EcnConnectSchema;
    EcnConnectSchemaSetupLabel: typeof EcnConnectSchemaSetupLabel;
    EcnSubscrSchema: typeof EcnSubscrSchema,
    EcnInstrument: typeof EcnInstrument;
    EcnInstrumentsGroup: typeof EcnInstrumentsGroup;
    UsersGroupsInst: typeof UsersGroupsInst;
    UsersInst: typeof UsersInst;
    UsersSubAccountInst: typeof UsersSubAccountInst;
    SubloginSettings: typeof SubloginSettings;
    LiquidityManager: typeof LiquidityManager;
    Quotes: 'Quotes';
    Liquidity: 'Liquidity';
    Position: 'Position';
    RealTimeData: typeof RealTimeData;
    UserInfo: typeof UserInfo;
    ReportAccountStatement: typeof ReportAccountStatement;
  }
}
