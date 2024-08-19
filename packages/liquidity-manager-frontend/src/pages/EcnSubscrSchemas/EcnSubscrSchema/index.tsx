import { PageContainer } from "@ant-design/pro-components";
import { Card, Result, Space, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import React from "react";
import { useAccess } from "@umijs/max";
import { PageLoading } from "@ant-design/pro-layout";
import { Descriptions } from "@jifeon/boar-pack-common-frontend";
import { useEcnSubscrSchemaColumns } from "../../../components/EcnSubscrSchemas/useEcnSubscrSchemaColumns";
import EcnInstrumentDescriptions from "../../../components/EcnInstruments/EcnInstrumentDescriptions";
import { ecnSubscrSchemaJoinFields } from "../../../components/EcnSubscrSchemas/ecnSubscrSchemaJoinFields";
import { ecnSubscriptionSchemaToDto } from "../../../components/EcnSubscrSchemas/EcnSubscrSchemasTable";
import { useLiquidityManagerContext } from "../../../tools";
import { EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto } from "@@api/generated";
import apiClient from "@@api/apiClient";

const { Title } = Typography;

const EcnSubscrSchemaPage: React.FC = () => {
  const {
    hash: instrumentHash,
    connectSchemaId: connectSchemaIdParam,
  } = useParams();
  const columns = useEcnSubscrSchemaColumns();
  const { worker, liquidityManager } = useLiquidityManagerContext();
  const { canManageLiquidity } = useAccess() || {};
  const canEdit = canManageLiquidity(liquidityManager);

  if (!worker) return <PageLoading />;

  const connectSchemaId = Number(connectSchemaIdParam);
  if (!instrumentHash || !Number.isFinite(connectSchemaId)) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
      />
    );
  }

  return (
    <PageContainer>
      <Space
        direction={'vertical'}
        style={{
          width: '100%',
        }}
      >
        <Card>
          <Descriptions<EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto, {
            instrumentHash: string,
            connectSchemaId: number,
            worker: string,
          }>
            mainTitle="Schema"
            pathParams={{
              instrumentHash,
              connectSchemaId,
              worker,
            }}
            idColumnName="instrumentHash"
            getOne={params => apiClient.ecnSubscrSchemas.getOneBaseEcnSubscrSchemaControllerEcnSubscrSchema(params)}
            onUpdate={params => apiClient.ecnSubscrSchemas.updateOneBaseEcnSubscrSchemaControllerEcnSubscrSchema(params)}
            onDelete={params => apiClient.ecnSubscrSchemas.deleteOneBaseEcnSubscrSchemaControllerEcnSubscrSchema(params)}
            entityToUpdateDto={ecnSubscriptionSchemaToDto}
            columns={columns}
            canEdit={canEdit}
            params={{
              join: ecnSubscrSchemaJoinFields,
            }}
          />
        </Card>
        <Title
          level={4}
          style={{
            marginTop: 24,
          }}
        >Related Instrument</Title>
        <Card>
          <EcnInstrumentDescriptions instrumentHash={instrumentHash} />
        </Card>
      </Space>
    </PageContainer>
  )
}

export default EcnSubscrSchemaPage;
