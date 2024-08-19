/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type UserUpdateDto = {
    name?: string;
    email?: string;
    role?: UserUpdateDto.role;
    pass?: string | null;
    permissions?: Array<string>;
};

export namespace UserUpdateDto {

    export enum role {
        ADMIN = 'admin',
        USER = 'user',
    }


}

