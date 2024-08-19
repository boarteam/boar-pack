/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LiquidityManagersUser } from './LiquidityManagersUser';

export type LiquidityManager = {
    id: string;
    name: string;
    host: string;
    port: number;
    user: string;
    pass: string;
    database: string;
    worker: LiquidityManager.worker;
    color: LiquidityManager.color;
    enabled: boolean;
    lmUsers: Array<LiquidityManagersUser>;
    createdAt: string;
    updatedAt: string;
};

export namespace LiquidityManager {

    export enum worker {
        LM_WORKER_1 = 'lm_worker_1',
        LM_WORKER_2 = 'lm_worker_2',
        LM_WORKER_3 = 'lm_worker_3',
        LM_WORKER_4 = 'lm_worker_4',
        LM_WORKER_5 = 'lm_worker_5',
        LM_WORKER_6 = 'lm_worker_6',
        LM_WORKER_7 = 'lm_worker_7',
        LM_WORKER_8 = 'lm_worker_8',
        LM_WORKER_9 = 'lm_worker_9',
        LM_WORKER_10 = 'lm_worker_10',
    }

    export enum color {
        RED = 'red',
        VOLCANO = 'volcano',
        GOLD = 'gold',
        YELLOW = 'yellow',
        LIME = 'lime',
        GREEN = 'green',
        CYAN = 'cyan',
        BLUE = 'blue',
        GEEKBLUE = 'geekblue',
        PURPLE = 'purple',
        MAGENTA = 'magenta',
    }


}

