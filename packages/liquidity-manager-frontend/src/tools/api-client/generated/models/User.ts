/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type User = {
    id: string;
    name: string;
    email: string;
    role: User.role;
    pass: string | null;
    permissions: Array<string>;
    createdAt: string;
    updatedAt: string;
    policies: Array<Record<string, any>>;
};

export namespace User {

    export enum role {
        ADMIN = 'admin',
        USER = 'user',
    }


}
