/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EcnModule } from './EcnModule';
import type { EcnSubscrSchema } from './EcnSubscrSchema';

export type EcnConnectSchema = {
    id: number;
    fromModuleId: number;
    toModuleId: number;
    enabled: number;
    descr?: string;
    fromModule: EcnModule;
    toModule: EcnModule;
    subscrSchemas: Array<EcnSubscrSchema>;
};

