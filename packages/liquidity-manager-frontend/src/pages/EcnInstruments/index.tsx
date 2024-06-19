import { PageContainer } from "@ant-design/pro-components";
import React from "react";
import { useIntl } from "@umijs/max";
import EcnInstrumentsTable from "../../components/EcnInstruments/EcnInstrumentsTable";
import EcnInstrumentsGroupsTable from "../../components/EcnInstruments/EcnInstrumentsGroups/EcnInstrumentsGroupsTable";
import { useTabs } from "@jifeon/boar-pack-common-frontend";

enum Tabs {
  instruments = 'instruments',
  instrumentsGroups = 'instrumentsGroups',
}

const EcnInstruments: React.FC = () => {
  const [activeTab, setActiveTab] = useTabs<Tabs>(Tabs.instruments);
  const intl = useIntl();

  const tabList = [
    {
      key: Tabs.instruments,
      tab: intl.formatMessage({ id: 'menu.liquidity-pool-management.ecn-instruments' }),
    },
    {
      key: Tabs.instrumentsGroups,
      tab: intl.formatMessage({ id: 'menu.liquidity-pool-management.ecn-instruments-groups' }),
    },
  ];

  return (
    <PageContainer
      tabList={tabList}
      tabActiveKey={activeTab}
      onTabChange={(tab: Tabs) => setActiveTab(tab)}
    >
      {activeTab === Tabs.instruments ? <EcnInstrumentsTable /> : null}
      {activeTab === Tabs.instrumentsGroups ? <EcnInstrumentsGroupsTable /> : null}
    </PageContainer>
  )
}

export default EcnInstruments;
