import { EcnInstrument, EcnInstrumentCreateDto, EcnInstrumentUpdateDto } from "@api/generated";
import apiClient from '@api/apiClient';
import { ecnInstrumentToDto } from "./EcnInstrumentsTable";
import { ecnInstrumentJoinFields } from "./ecnInstrumentJoinFields";
import Descriptions from "../../Descriptions/Descriptions";
import React, { useMemo } from "react";
import { useEcnInstrumentsColumns } from "./useEcnInstrumentsColumns";
import { useAccess } from "@umijs/max";
import { useLiquidityManagerContext } from "../../tools/liquidityManagerContext";
import { PageLoading } from "@ant-design/pro-layout";

type TEcnInstrumentProps = {
  instrumentHash: string,
};

const params = {
  join: ecnInstrumentJoinFields,
};

const EcnInstrumentDescriptions: React.FC<TEcnInstrumentProps> = ({
  instrumentHash,
}) => {
  const columns = useEcnInstrumentsColumns();
  const { canManageLiquidity } = useAccess() || {};
  const { worker } = useLiquidityManagerContext();

  // prevent Description to send unnecessary requests
  const pathParams = useMemo(() => ({
    instrumentHash,
    worker: worker!,
  }), [instrumentHash, worker]);

  if (!worker) return <PageLoading />;

  return (<Descriptions<EcnInstrument, EcnInstrumentCreateDto, EcnInstrumentUpdateDto, {
    instrumentHash: string,
    worker: string,
  }, number>
    mainTitle="General"
    pathParams={pathParams}
    idColumnName="instrumentHash"
    getOne={params => apiClient.ecnInstruments.getOneBaseEcnInstrumentsControllerEcnInstrument(params)}
    onUpdate={params => apiClient.ecnInstruments.updateOneBaseEcnInstrumentsControllerEcnInstrument(params)}
    onDelete={params => apiClient.ecnInstruments.deleteOneBaseEcnInstrumentsControllerEcnInstrument(params)}
    entityToUpdateDto={ecnInstrumentToDto}
    columns={columns}
    canEdit={canManageLiquidity}
    params={params}
  />);
}

export default EcnInstrumentDescriptions;
