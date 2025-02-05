/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserCreateDto = {
    name: string;
    email: string;
    role?: UserCreateDto.role;
    pass?: string | null;
    permissions?: Array<string>;
};
export namespace UserCreateDto {
    export enum role {
        ADMIN = 'admin',
        USER = 'user',
    }
}

