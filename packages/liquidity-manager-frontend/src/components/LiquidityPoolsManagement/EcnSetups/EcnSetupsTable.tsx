import apiClient from "../../../tools/client/apiClient";
import { useAccess } from "@umijs/max";
import { useLiquidityManagerContext } from "../liquidityManagerContext";
import EcnSetupsTableBase from "@/components/LiquidityPoolsManagement/EcnSetups/EcnSetupsTableBase";
import { Button } from "antd";
import {useRef} from "react";
import {ActionType} from "@ant-design/pro-table";

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

const EcnSetupsTable = () => {
  const ref = useRef<ActionType>();

  return (
    <EcnSetupsTableBase
      actionRef={ref}
      toolBarRender={() => [<GenerateButton onClick={() => {
        ref.current?.reload()
      }} key='generate-button' />]}
    />
  );
}

export default EcnSetupsTable;
