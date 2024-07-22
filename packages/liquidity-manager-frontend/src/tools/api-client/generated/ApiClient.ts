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
import { LiquidityManagersService } from './services/LiquidityManagersService';
import { LiquidityManagersUsersService } from './services/LiquidityManagersUsersService';
import { SubloginSettingsService } from './services/SubloginSettingsService';
import { UsersService } from './services/UsersService';
import { UsersGroupsInstService } from './services/UsersGroupsInstService';
import { UsersInstService } from './services/UsersInstService';
import { UsersInstCompaniesService } from './services/UsersInstCompaniesService';
import { UsersSubAccountsInstService } from './services/UsersSubAccountsInstService';

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
    public readonly liquidityManagers: LiquidityManagersService;
    public readonly liquidityManagersUsers: LiquidityManagersUsersService;
    public readonly subloginSettings: SubloginSettingsService;
    public readonly users: UsersService;
    public readonly usersGroupsInst: UsersGroupsInstService;
    public readonly usersInst: UsersInstService;
    public readonly usersInstCompanies: UsersInstCompaniesService;
    public readonly usersSubAccountsInst: UsersSubAccountsInstService;

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
        this.liquidityManagers = new LiquidityManagersService(this.request);
        this.liquidityManagersUsers = new LiquidityManagersUsersService(this.request);
        this.subloginSettings = new SubloginSettingsService(this.request);
        this.users = new UsersService(this.request);
        this.usersGroupsInst = new UsersGroupsInstService(this.request);
        this.usersInst = new UsersInstService(this.request);
        this.usersInstCompanies = new UsersInstCompaniesService(this.request);
        this.usersSubAccountsInst = new UsersSubAccountsInstService(this.request);
    }
}

