import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import apiClient from '@@api/apiClient';
import { EcnConnectSchemaSetupLabel, EcnModule } from '@@api/generated';
import { useLiquidityManagerContext } from "../../tools";
import { PageLoading } from "@ant-design/pro-layout";
import ConnectionsGraph from "../ConnectionsGraph";
import { Tag } from 'antd';
import Paragraph from "antd/es/typography/Paragraph";

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

  if (!modules) {
    return <Spin />;
  }


  return (
    <ConnectionsGraph 
      modules={modules}
      description={(
        <Paragraph>
          <Tag color={'green'}>Green arrows</Tag>indicate that connection is enabled.&nbsp;
          <Tag color={'red'}>Red arrows</Tag>indicate that connection is disabled.
        </Paragraph>
      )} 
    />
  );
}
