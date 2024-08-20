/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type PositionDto = {
    userId: number;
    id: number;
    instrument: string;
    side: PositionDto.side;
    amount: number;
    openPrice: number;
    margin: number;
    profit: number;
    createdAt: string;
    updatedAt: string;
};

export namespace PositionDto {

    export enum side {
        BUY = 'buy',
        SELL = 'sell',
    }


}

