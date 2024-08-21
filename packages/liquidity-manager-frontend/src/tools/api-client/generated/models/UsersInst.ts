/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DclAction } from './DclAction';
import type { EcnCommissionLotsMode } from './EcnCommissionLotsMode';
import type { EcnCommissionType } from './EcnCommissionType';
import type { EcnModule } from './EcnModule';
import type { EcnPasswordHashType } from './EcnPasswordHashType';
import type { UsersGroupsInst } from './UsersGroupsInst';
import type { UsersInstCompany } from './UsersInstCompany';

export type UsersInst = {
    ts: number;
    tsMs: number;
    id: string;
    name: string;
    group: UsersGroupsInst;
    action: DclAction;
    leverage: number;
    balance: string;
    credit: string;
    margin: string;
    freeMargin: string;
    marginLevel: string;
    userComment: string;
    enabled: number;
    profitloss: string;
    marginWithLimits: string;
    commission: string;
    swap: string;
    stopoutHash: string;
    stopoutName: string;
    userState: number;
    stopoutEnabled: number;
    stopoutSuppressTime: string;
    stopoutGenerationTime: string;
    module: EcnModule;
    password: string;
    commissionValue: string;
    commissionType: EcnCommissionType;
    commissionLotsMode: EcnCommissionLotsMode;
    rolloverTime?: string;
    commissionTurnover: string;
    marginModuleId: string;
    marginModule: EcnModule;
    company?: UsersInstCompany;
    trId?: number;
    fixTradingEnabled: number;
    fixUserinfoRequestsEnabled: number;
    alwaysBookA: number;
    hedgeFactor: string;
    salt?: string;
    pwdHashTypeId: number;
    pwdHashType: EcnPasswordHashType;
};

