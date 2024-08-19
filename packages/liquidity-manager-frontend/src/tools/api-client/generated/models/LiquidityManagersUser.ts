/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LiquidityManager } from './LiquidityManager';
import type { User } from './User';

export type LiquidityManagersUser = {
    id: string;
    liquidityManagerId: string;
    liquidityManager: LiquidityManager;
    userId: string;
    user: User;
    role: LiquidityManagersUser.role;
    createdAt: string;
    updatedAt: string;
};

export namespace LiquidityManagersUser {

    export enum role {
        MANAGER = 'manager',
        VIEWER = 'viewer',
    }


}

