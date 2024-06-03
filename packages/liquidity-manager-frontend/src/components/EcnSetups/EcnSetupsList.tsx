import apiClient from "@@api/apiClient";
import { useAccess } from "@umijs/max";
import { Button } from "antd";
import {useRef} from "react";
import {ActionType} from "@ant-design/pro-table";
import { useLiquidityManagerContext } from "../../tools";
import { EcnSetupsListBase } from "./EcnSetupsListBase";

const GenerateButton = ({ onClick }: { onClick: () => void }) => {
  const { canManageLiquidity } = useAccess() || {};
  const { worker } = useLiquidityManagerContext();

  if (!canManageLiquidity || !worker) {
    return <></>;
  }

  return (
    <Button
      type='primary'
      onClick={async () => {
        await apiClient.ecnConnectSchemaSetupLabels.generateSetups({ worker });
        onClick();
      }}
    >
      Generate Setups
    </Button>
  )
}

const EcnSetupsList = () => {
  const ref = useRef<ActionType>();

  return (
    <EcnSetupsListBase
      actionRef={ref}
      toolBarRender={() => [<GenerateButton onClick={() => {
        ref.current?.reload()
      }} key='generate-button' />]}
    />
  );
}

export default EcnSetupsList;
