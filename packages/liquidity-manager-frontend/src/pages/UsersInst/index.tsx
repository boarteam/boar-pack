import { PageContainer } from "@ant-design/pro-components";
import React from "react";
import { useIntl } from "@umijs/max";
import UsersGroupsInstTable from "../../components/UsersInst/UsersGroupsInst/UsersGroupsInstTable";
import UsersInstTable from "../../components/UsersInst/UsersInstTable";
import { useTabs } from "@jifeon/boar-pack-common-frontend";

enum Tabs {
  usersInst = 'usersInst',
  usersGroupsInst = 'usersGroupsInst',
}

const UsersInst: React.FC = () => {
  const [activeTab, setActiveTab] = useTabs<Tabs>(Tabs.usersInst);
  const intl = useIntl();

  const tabList = [
    {
      key: Tabs.usersInst,
      tab: intl.formatMessage({ id: 'menu.liquidity-pool-management.users-inst' }),
    },
    {
      key: Tabs.usersGroupsInst,
      tab: intl.formatMessage({ id: 'menu.liquidity-pool-management.users-groups-inst' }),
    },
  ];

  return (
    <PageContainer
      tabList={tabList}
      tabActiveKey={activeTab}
      onTabChange={(tab: Tabs) => setActiveTab(tab)}
    >
      {activeTab === Tabs.usersInst ? <UsersInstTable /> : null}
      {activeTab === Tabs.usersGroupsInst ? <UsersGroupsInstTable /> : null}
    </PageContainer>
  )
}

export default UsersInst;
