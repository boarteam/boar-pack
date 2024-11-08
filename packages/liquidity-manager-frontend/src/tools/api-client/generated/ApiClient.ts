/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { NodeHttpRequest } from './core/NodeHttpRequest';

import { AmtsAuthenticationService } from './services/AmtsAuthenticationService';
import { DclActionsService } from './services/DclActionsService';
import { EcnCommissionLotsModesService } from './services/EcnCommissionLotsModesService';
import { EcnCommissionTypesService } from './services/EcnCommissionTypesService';
import { EcnConnectSchemasService } from './services/EcnConnectSchemasService';
import { EcnConnectSchemaSetupLabelsService } from './services/EcnConnectSchemaSetupLabelsService';
import { EcnCurrenciesService } from './services/EcnCurrenciesService';
import { EcnExecutionModesService } from './services/EcnExecutionModesService';
import { EcnInstrumentsService } from './services/EcnInstrumentsService';
import { EcnInstrumentsGroupsService } from './services/EcnInstrumentsGroupsService';
import { EcnMarginCalcModesService } from './services/EcnMarginCalcModesService';
import { EcnModulesService } from './services/EcnModulesService';
import { EcnModuleTypesService } from './services/EcnModuleTypesService';
import { EcnPasswordHashTypesService } from './services/EcnPasswordHashTypesService';
import { EcnProfitCalcModesService } from './services/EcnProfitCalcModesService';
import { EcnStatesService } from './services/EcnStatesService';
import { EcnSubscrSchemasService } from './services/EcnSubscrSchemasService';
import { EcnSwapTypesService } from './services/EcnSwapTypesService';
import { EcnWeekDaysService } from './services/EcnWeekDaysService';
import { EcnWorkingModesService } from './services/EcnWorkingModesService';
import { InstrumentsService } from './services/InstrumentsService';
import { LiquidityManagersService } from './services/LiquidityManagersService';
import { LiquidityManagersUsersService } from './services/LiquidityManagersUsersService';
import { MyAuditLogsService } from './services/MyAuditLogsService';
import { MySubloginSettingsService } from './services/MySubloginSettingsService';
import { MyUsersSubAccountsInstService } from './services/MyUsersSubAccountsInstService';
import { OrderBookTypesService } from './services/OrderBookTypesService';
import { OrderSidesService } from './services/OrderSidesService';
import { OrderStatesService } from './services/OrderStatesService';
import { OrderTypesService } from './services/OrderTypesService';
import { PositionsService } from './services/PositionsService';
import { ReportAccountStatementsService } from './services/ReportAccountStatementsService';
import { ReportBalanceOperationsService } from './services/ReportBalanceOperationsService';
import { ReportTradesService } from './services/ReportTradesService';
import { SubloginSettingsService } from './services/SubloginSettingsService';
import { UserInfoService } from './services/UserInfoService';
import { UsersService } from './services/UsersService';
import { UsersGroupsInstService } from './services/UsersGroupsInstService';
import { UsersInstService } from './services/UsersInstService';
import { UsersInstCompaniesService } from './services/UsersInstCompaniesService';
import { UsersSubAccountsInstService } from './services/UsersSubAccountsInstService';
import { ViewInstrumentsSpecificationsService } from './services/ViewInstrumentsSpecificationsService';

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class ApiClient {

    public readonly amtsAuthentication: AmtsAuthenticationService;
    public readonly dclActions: DclActionsService;
    public readonly ecnCommissionLotsModes: EcnCommissionLotsModesService;
    public readonly ecnCommissionTypes: EcnCommissionTypesService;
    public readonly ecnConnectSchemas: EcnConnectSchemasService;
    public readonly ecnConnectSchemaSetupLabels: EcnConnectSchemaSetupLabelsService;
    public readonly ecnCurrencies: EcnCurrenciesService;
    public readonly ecnExecutionModes: EcnExecutionModesService;
    public readonly ecnInstruments: EcnInstrumentsService;
    public readonly ecnInstrumentsGroups: EcnInstrumentsGroupsService;
    public readonly ecnMarginCalcModes: EcnMarginCalcModesService;
    public readonly ecnModules: EcnModulesService;
    public readonly ecnModuleTypes: EcnModuleTypesService;
    public readonly ecnPasswordHashTypes: EcnPasswordHashTypesService;
    public readonly ecnProfitCalcModes: EcnProfitCalcModesService;
    public readonly ecnStates: EcnStatesService;
    public readonly ecnSubscrSchemas: EcnSubscrSchemasService;
    public readonly ecnSwapTypes: EcnSwapTypesService;
    public readonly ecnWeekDays: EcnWeekDaysService;
    public readonly ecnWorkingModes: EcnWorkingModesService;
    public readonly instruments: InstrumentsService;
    public readonly liquidityManagers: LiquidityManagersService;
    public readonly liquidityManagersUsers: LiquidityManagersUsersService;
    public readonly myAuditLogs: MyAuditLogsService;
    public readonly mySubloginSettings: MySubloginSettingsService;
    public readonly myUsersSubAccountsInst: MyUsersSubAccountsInstService;
    public readonly orderBookTypes: OrderBookTypesService;
    public readonly orderSides: OrderSidesService;
    public readonly orderStates: OrderStatesService;
    public readonly orderTypes: OrderTypesService;
    public readonly positions: PositionsService;
    public readonly reportAccountStatements: ReportAccountStatementsService;
    public readonly reportBalanceOperations: ReportBalanceOperationsService;
    public readonly reportTrades: ReportTradesService;
    public readonly subloginSettings: SubloginSettingsService;
    public readonly userInfo: UserInfoService;
    public readonly users: UsersService;
    public readonly usersGroupsInst: UsersGroupsInstService;
    public readonly usersInst: UsersInstService;
    public readonly usersInstCompanies: UsersInstCompaniesService;
    public readonly usersSubAccountsInst: UsersSubAccountsInstService;
    public readonly viewInstrumentsSpecifications: ViewInstrumentsSpecificationsService;

    public readonly request: BaseHttpRequest;

    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = NodeHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? '',
            VERSION: config?.VERSION ?? '1.0',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });

        this.amtsAuthentication = new AmtsAuthenticationService(this.request);
        this.dclActions = new DclActionsService(this.request);
        this.ecnCommissionLotsModes = new EcnCommissionLotsModesService(this.request);
        this.ecnCommissionTypes = new EcnCommissionTypesService(this.request);
        this.ecnConnectSchemas = new EcnConnectSchemasService(this.request);
        this.ecnConnectSchemaSetupLabels = new EcnConnectSchemaSetupLabelsService(this.request);
        this.ecnCurrencies = new EcnCurrenciesService(this.request);
        this.ecnExecutionModes = new EcnExecutionModesService(this.request);
        this.ecnInstruments = new EcnInstrumentsService(this.request);
        this.ecnInstrumentsGroups = new EcnInstrumentsGroupsService(this.request);
        this.ecnMarginCalcModes = new EcnMarginCalcModesService(this.request);
        this.ecnModules = new EcnModulesService(this.request);
        this.ecnModuleTypes = new EcnModuleTypesService(this.request);
        this.ecnPasswordHashTypes = new EcnPasswordHashTypesService(this.request);
        this.ecnProfitCalcModes = new EcnProfitCalcModesService(this.request);
        this.ecnStates = new EcnStatesService(this.request);
        this.ecnSubscrSchemas = new EcnSubscrSchemasService(this.request);
        this.ecnSwapTypes = new EcnSwapTypesService(this.request);
        this.ecnWeekDays = new EcnWeekDaysService(this.request);
        this.ecnWorkingModes = new EcnWorkingModesService(this.request);
        this.instruments = new InstrumentsService(this.request);
        this.liquidityManagers = new LiquidityManagersService(this.request);
        this.liquidityManagersUsers = new LiquidityManagersUsersService(this.request);
        this.myAuditLogs = new MyAuditLogsService(this.request);
        this.mySubloginSettings = new MySubloginSettingsService(this.request);
        this.myUsersSubAccountsInst = new MyUsersSubAccountsInstService(this.request);
        this.orderBookTypes = new OrderBookTypesService(this.request);
        this.orderSides = new OrderSidesService(this.request);
        this.orderStates = new OrderStatesService(this.request);
        this.orderTypes = new OrderTypesService(this.request);
        this.positions = new PositionsService(this.request);
        this.reportAccountStatements = new ReportAccountStatementsService(this.request);
        this.reportBalanceOperations = new ReportBalanceOperationsService(this.request);
        this.reportTrades = new ReportTradesService(this.request);
        this.subloginSettings = new SubloginSettingsService(this.request);
        this.userInfo = new UserInfoService(this.request);
        this.users = new UsersService(this.request);
        this.usersGroupsInst = new UsersGroupsInstService(this.request);
        this.usersInst = new UsersInstService(this.request);
        this.usersInstCompanies = new UsersInstCompaniesService(this.request);
        this.usersSubAccountsInst = new UsersSubAccountsInstService(this.request);
        this.viewInstrumentsSpecifications = new ViewInstrumentsSpecificationsService(this.request);
    }
}

