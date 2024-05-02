import { Result } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { useParams } from 'react-router-dom';
import { useIntl } from '@umijs/max';
import React, { useState } from 'react';
import { SetupConnectionsGraph } from "../../components/EcnModules/EcnSetups/EcnSetupsConnectionsGraph";
import { SetupInstrumentsTable } from "../../components/EcnModules/EcnSetups/SetupInstrumentsTable";
import { EcnConnectSchemaSetupLabel } from "@@api/generated";

enum Tabs {
  graph = 'graph',
  instruments = 'instruments',
}

const EcnSetupPage: React.FC = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<string>(Tabs.graph);
  const intl = useIntl();

  const tabList = [
    {
      key: Tabs.graph,
      tab: intl.formatMessage({ id: 'menu.liquidity-pool-management.graph' }),
    },
    {
      key: Tabs.instruments,
      tab: intl.formatMessage({ id: 'menu.liquidity-pool-management.instruments' }),
    },
  ];

  if (!id) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
      />
    )
  }

  const setupId = Number(id) as EcnConnectSchemaSetupLabel['id'];

  return (
    <PageContainer
      tabList={tabList}
      tabActiveKey={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === Tabs.graph && <SetupConnectionsGraph id={setupId} />}
      {activeTab === Tabs.instruments && <SetupInstrumentsTable id={setupId} />}
    </PageContainer>
  );
};

export default EcnSetupPage;
