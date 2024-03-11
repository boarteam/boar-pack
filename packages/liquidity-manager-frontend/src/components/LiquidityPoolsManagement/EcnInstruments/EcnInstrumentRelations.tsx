import React from "react";
import EcnSetupsTable from "../EcnModules/EcnSetups/EcnSetupsTable";
import EcnModulesTable from "../EcnModules/EcnModulesTable";
import EcnConnectSchemaTable from "../EcnConnectSchemas/EcnConnectSchemasTable";
import { Card, Space } from "antd";
import { CondOperator } from "@nestjsx/crud-request";
import { ecnModuleJoinFields } from "../EcnModules/ecnModuleJoinFields";
import { ecnConnectSchemaJoinFields } from "./EcnInstrumentConnectSchemaDrawer";

type TEcnInstrumentProps = {
  instrumentHash: string,
};

const EcnInstrumentRelations: React.FC<TEcnInstrumentProps> = ({
  instrumentHash,
}) => {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="Related Setups">
        <EcnSetupsTable
          viewOnly={true}
          searchableColumns={[
            {
              field: 'modulesConnectionsSubscrSchemas.instrumentHash',
              operator: CondOperator.EQUALS,
            }
          ]}
          params={{
            baseFilters: {
              'modulesConnectionsSubscrSchemas.instrumentHash': instrumentHash,
            },
            join: [
              {
                field: 'modules',
                select: ['name'],
              },
              { field: 'modules.connections' },
              { field: 'modules.connections.subscrSchemas' },
            ],
          }}
        />
      </Card>
      <Card title="Related Modules">
        <EcnModulesTable
          viewOnly={true}
          searchableColumns={[
            {
              field: 'connectionsSubscrSchemas.instrumentHash',
              operator: CondOperator.EQUALS,
            }
          ]}
          params={{
            baseFilters: {
              'connectionsSubscrSchemas.instrumentHash': instrumentHash,
            },
            join: [
              ...ecnModuleJoinFields,
              { field: 'connections' },
              { field: 'connections.subscrSchemas' },
            ],
          }}
        />
      </Card>
      <Card title="Related Connection Schemas">
        <EcnConnectSchemaTable
          viewOnly={true}
          searchableColumns={[
            {
              field: 'subscrSchemas.instrumentHash',
              operator: CondOperator.EQUALS,
            }
          ]}
          params={{
            baseFilters: {
              'subscrSchemas.instrumentHash': instrumentHash,
            },
            join: [
              ...ecnConnectSchemaJoinFields,
              { field: 'subscrSchemas', select: ['name'] },
            ],
          }}
        />
      </Card>
    </Space>
  );
}

export default EcnInstrumentRelations;
