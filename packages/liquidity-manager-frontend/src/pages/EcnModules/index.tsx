import { PageContainer } from "@ant-design/pro-components";
import React from "react";
import { useIntl } from "@umijs/max";
import EcnModulesTable from "../../components/EcnModules/EcnModulesTable";
import EcnModuleTypesTable from "../../components/EcnModules/EcnModuleTypes/EcnModuleTypesTable";
import EcnSetupsTable from "../../components/EcnSetups/EcnSetupsTable";

enum Tabs {
  modules = 'modules',
  setups = 'setups',
  moduleTypes = 'moduleTypes',
}

const Users: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<string>(Tabs.modules);
  const intl = useIntl();

  const tabList = [
    {
      key: Tabs.modules,
      tab: intl.formatMessage({ id: 'pages.ecnModules.modules' }),
    },
    {
      key: Tabs.setups,
      tab: intl.formatMessage({ id: 'pages.ecnModules.setups' }),
    },
    {
      key: Tabs.moduleTypes,
      tab: intl.formatMessage({ id: 'pages.ecnModules.moduleTypes' }),
    },
  ];

  return (
    <PageContainer
      tabList={tabList}
      tabActiveKey={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === Tabs.modules ? <EcnModulesTable /> : null}
      {activeTab === Tabs.setups ? <EcnSetupsTable /> : null}
      {activeTab === Tabs.moduleTypes ? <EcnModuleTypesTable /> : null}
    </PageContainer>
  )
}

export default Users;
