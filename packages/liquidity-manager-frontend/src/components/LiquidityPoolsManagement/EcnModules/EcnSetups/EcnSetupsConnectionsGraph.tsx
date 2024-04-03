import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import apiClient from '@/tools/client/apiClient';
import { EcnConnectSchemaSetupLabel, EcnModule } from '@/tools/api';
import ConnectionsGraph from '@/components/LiquidityPoolsManagement/ConnectionsGraph';
import { useLiquidityManagerContext } from "../../liquidityManagerContext";
import { PageLoading } from "@ant-design/pro-layout";

export const SetupConnectionsGraph = ({ id }: { id: EcnConnectSchemaSetupLabel['id'] }) => {
  const [modules, setModules] = useState<Set<EcnModule['id']>>();
  const { worker } = useLiquidityManagerContext();

  useEffect(() => {
    if (!worker) return;

    apiClient.ecnConnectSchemaSetupLabels.getOneBaseEcnConnectSchemaSetupLabelsControllerEcnConnectSchemaSetupLabel({
      id: Number(id),
      fields: ['modules'],
      join: ['modules||name'],
      worker,
    })
      .then(setup => {
        setModules(new Set(setup?.modules?.map(module => module.id) ?? []));
      });
  }, [worker]);

  if (!worker) return <PageLoading />;

  return modules ? <ConnectionsGraph modules={modules} /> : <Spin />;
}
