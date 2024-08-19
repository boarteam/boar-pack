/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type LiquidityManagersUserCreateDto = {
    liquidityManagerId: string;
    userId: string;
    role: LiquidityManagersUserCreateDto.role;
};

export namespace LiquidityManagersUserCreateDto {

    export enum role {
        MANAGER = 'manager',
        VIEWER = 'viewer',
    }


}

