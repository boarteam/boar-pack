import React from 'react';
import { Result } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { useParams } from 'react-router-dom';
import ConnectionsGraph from "../../components/ConnectionsGraph";
import { useTabs } from "@jifeon/boar-pack-common-frontend";
import QuotesTable from "../../components/Quotes/QuotesTable";

enum Tabs {
  connections = 'connections',
  quotes = 'quotes',
}

const ModulesGraph: React.FC = () => {
  const params = useParams();
  const id = Number(params.id);
  const [activeTab, setActiveTab] = useTabs<Tabs>(Tabs.connections);

  if (isNaN(id)) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
      />
    )
  }

  const tabList = [
    {
      key: Tabs.connections,
      tab: 'Connections',
    },
    {
      key: Tabs.quotes,
      tab: 'Quotes',
    },
  ];

  return (
    <PageContainer
      tabList={tabList}
      tabActiveKey={activeTab}
      onTabChange={(tab: Tabs) => setActiveTab(tab)}
    >
      {activeTab === Tabs.connections && <ConnectionsGraph modules={new Set([id])} />}
      {activeTab === Tabs.quotes && <QuotesTable
        moduleId={id}
        controller={'ecnInstruments'}
      />}
    </PageContainer>
  );
};

export default ModulesGraph;
