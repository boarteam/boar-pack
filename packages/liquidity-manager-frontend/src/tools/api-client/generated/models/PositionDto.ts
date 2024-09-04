/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type PositionDto = {
    userId: Record<string, any>;
    id: Record<string, any>;
    instrument: string;
    side: PositionDto.side;
    amount: Record<string, any>;
    openPrice: Record<string, any>;
    margin: Record<string, any>;
    profit: Record<string, any>;
    createdAt: string;
    updatedAt: string;
};

export namespace PositionDto {

    export enum side {
        BUY = 'buy',
        SELL = 'sell',
    }


}

