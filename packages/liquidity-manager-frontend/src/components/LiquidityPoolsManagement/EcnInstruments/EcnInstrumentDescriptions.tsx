import { EcnInstrument, EcnInstrumentCreateDto, EcnInstrumentUpdateDto } from "../../../tools/api";
import apiClient from "../../../tools/client/apiClient";
import { ecnInstrumentToDto } from "./EcnInstrumentsTable";
import { ecnInstrumentJoinFields } from "./ecnInstrumentJoinFields";
import Descriptions from "../../Descriptions/Descriptions";
import React from "react";
import { useEcnInstrumentsColumns } from "./useEcnInstrumentsColumns";

type TEcnInstrumentProps = {
  instrumentHash: string,
};

const EcnInstrumentDescriptions: React.FC<TEcnInstrumentProps> = ({
  instrumentHash,
}) => {
  const columns = useEcnInstrumentsColumns();

  return (<Descriptions<EcnInstrument, EcnInstrumentCreateDto, EcnInstrumentUpdateDto, {
    instrumentHash: string,
  }, number>
    mainTitle="General"
    pathParams={{
      instrumentHash,
    }}
    idColumnName="instrumentHash"
    getOne={params => apiClient.ecnInstruments.getOneBaseEcnInstrumentsControllerEcnInstrument(params)}
    onUpdate={params => apiClient.ecnInstruments.updateOneBaseEcnInstrumentsControllerEcnInstrument(params)}
    onDelete={params => apiClient.ecnInstruments.deleteOneBaseEcnInstrumentsControllerEcnInstrument(params)}
    entityToCreateDto={ecnInstrumentToDto}
    entityToUpdateDto={ecnInstrumentToDto}
    columns={columns}
    params={{
      join: ecnInstrumentJoinFields,
    }}
  />);
}

export default EcnInstrumentDescriptions;
