import { PageContainer } from "@ant-design/pro-components";
import { Card, Result, Space, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import React from "react";
import UserInstDescriptions from "../../../components/UsersInst/UserInstDescriptions";
import UsersSubAccountsInstTable from "../../../components/UsersInst/UsersSubAccountsInst/UsersSubAccountsInstTable";
import { useTabs } from "@jifeon/boar-pack-common-frontend";
import PositionsTable from "../../../components/Positions/PositionsTable";

const { Title } = Typography;

enum Tabs {
  user = 'user',
  subAccounts = 'subAccounts',
  positions = 'positions',
}

const tabList = [
  {
    key: Tabs.user,
    tab: 'User',
  },
  {
    key: Tabs.subAccounts,
    tab: 'Sub Accounts',
  },
  {
    key: Tabs.positions,
    tab: 'Positions',
  },
];

const EcnUserInstPage: React.FC = () => {
  const { id } = useParams();
  const userId = Number(id);
  const [activeTab, setActiveTab] = useTabs<Tabs>(Tabs.user);

  if (!Number.isInteger(userId)) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
      />
    );
  }

  return (
    <PageContainer
      tabList={tabList}
      tabActiveKey={activeTab}
      onTabChange={(tab: Tabs) => setActiveTab(tab)}
    >
      {activeTab === Tabs.user && <Card>
        <UserInstDescriptions id={id} />
      </Card>}
      {activeTab === Tabs.subAccounts && <><Title
        level={4}
        style={{
          marginTop: 24,
        }}
      >Sub Accounts</Title>
      <UsersSubAccountsInstTable userId={id} />
      </>}
      {activeTab === Tabs.positions && <Card>
        <PositionsTable userId={userId}/>
      </Card>}
    </PageContainer>
  )
}

export default EcnUserInstPage;
