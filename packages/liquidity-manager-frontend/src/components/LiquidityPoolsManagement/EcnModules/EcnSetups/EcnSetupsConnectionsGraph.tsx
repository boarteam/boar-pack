import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import apiClient from '@/tools/client/apiClient';
import { EcnConnectSchemaSetupLabel, EcnModule } from '@/tools/api';
import ConnectionsGraph from '@/components/LiquidityPoolsManagement/ConnectionsGraph';

export const SetupConnectionsGraph = ({ id }: { id: EcnConnectSchemaSetupLabel['id'] }) => {
  const [modules, setModules] = useState<Set<EcnModule['id']>>();
  useEffect(() => {
    apiClient.ecnConnectSchemaSetupLabels.getOneBaseEcnConnectSchemaSetupLabelsControllerEcnConnectSchemaSetupLabel({ 
      id: Number(id),
      fields: ['modules'],
      join: ['modules||name'],
    })
    .then(setup => {
      setModules(new Set(setup?.modules?.map(module => module.id) ?? []));
    });
}, []);

  return modules ? <ConnectionsGraph modules={modules} /> : <Spin />;
}
