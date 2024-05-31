/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DclAction } from './DclAction';
import type { EcnCurrency } from './EcnCurrency';
import type { EcnWorkingMode } from './EcnWorkingMode';
import type { UsersInst } from './UsersInst';
import type { UsersInstCompany } from './UsersInstCompany';

export type UsersGroupsInst = {
    id: string;
    name: string;
    action: DclAction;
    leverage: number;
    currency: EcnCurrency;
    descr: string;
    marginCall: number;
    marginStopout: number;
    company: UsersInstCompany;
    workingMode: EcnWorkingMode;
    swapEnabled: number;
    ts: number;
    tsMs: number;
    usersInst: UsersInst;
};

