/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type LiquidityManagersUserUpdateDto = {
    liquidityManagerId?: string;
    userId?: string;
    role?: LiquidityManagersUserUpdateDto.role;
};

export namespace LiquidityManagersUserUpdateDto {

    export enum role {
        MANAGER = 'manager',
        VIEWER = 'viewer',
    }


}

