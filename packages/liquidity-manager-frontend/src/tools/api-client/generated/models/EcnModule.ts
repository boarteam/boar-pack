/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EcnConnectSchema } from './EcnConnectSchema';
import type { EcnConnectSchemaSetupLabel } from './EcnConnectSchemaSetupLabel';
import type { EcnModuleType } from './EcnModuleType';

export type EcnModule = {
    id: number;
    name: string;
    descr: string | null;
    type: EcnModuleType;
    enabled: number;
    setupLabels: Array<EcnConnectSchemaSetupLabel>;
    outgoingConnections: Array<EcnConnectSchema>;
    incomingConnections: Array<EcnConnectSchema>;
};

