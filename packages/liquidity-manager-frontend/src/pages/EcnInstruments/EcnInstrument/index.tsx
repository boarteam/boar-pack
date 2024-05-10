import { PageContainer } from "@ant-design/pro-components";
import { Card, Result } from 'antd';
import { useParams } from 'react-router-dom';
import React, { useEffect } from "react";
import { useIntl } from "@umijs/max";
import { PageLoading } from "@ant-design/pro-layout";
import EcnInstrumentRelations from "../../../components/EcnInstruments/EcnInstrumentRelations";
import EcnInstrumentDescriptions from "../../../components/EcnInstruments/EcnInstrumentDescriptions";
import { useLiquidityManagerContext } from "../../../tools";
import EcnInstrumentGraph from "../../../components/EcnInstruments/EcnInstrumentGraph";
import { EcnInstrument } from "@@api/generated";
import apiClient from "@@api/apiClient";
import { useTabs } from "@jifeon/boar-pack-common-frontend";

enum Tabs {
  information = 'information',
  relations = 'relations',
  graph = 'graph',
}

const EcnInstrumentPage: React.FC = () => {
  const { hash: instrumentHash } = useParams();
  const [instrument, setInstrument] = React.useState<EcnInstrument | null | undefined>(undefined);
  const [activeTab, setActiveTab] = useTabs<Tabs>(Tabs.information);
  const intl = useIntl();
  const { worker } = useLiquidityManagerContext();

  useEffect(() => {
    if (!worker) return;

    if (instrumentHash) {
      apiClient.ecnInstruments.getOneBaseEcnInstrumentsControllerEcnInstrument({
        instrumentHash,
        worker,
      })
        .then(data => setInstrument(data || null));
    }
  }, [instrumentHash, worker]);

  if (!worker) return <PageLoading />;

  if (!instrumentHash || instrument === null ) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
      />
    );
  }

  if (instrument === undefined) {
    return (
      <PageLoading />
    );
  }

  const tabList = [
    {
      key: Tabs.information,
      tab: intl.formatMessage({ id: 'menu.liquidity-pool-management.ecn-instruments.information' }),
    },
    {
      key: Tabs.relations,
      tab: intl.formatMessage({ id: 'menu.liquidity-pool-management.ecn-instruments.relations' }),
    },
    {
      key: Tabs.graph,
      tab: intl.formatMessage({ id: 'menu.liquidity-pool-management.ecn-instruments.graph' }),
    },
  ];

  return (
    <PageContainer
      title={instrument.name}
      tabList={tabList}
      tabActiveKey={activeTab}
      // @ts-ignore-next-line
      onTabChange={setActiveTab}
    >
      {activeTab === Tabs.information ? <Card><EcnInstrumentDescriptions instrumentHash={instrumentHash} /></Card> : null}
      {activeTab === Tabs.relations ? <EcnInstrumentRelations instrumentHash={instrumentHash} /> : null}
      {activeTab === Tabs.graph ? <EcnInstrumentGraph instrumentHash={instrumentHash} /> : null}
    </PageContainer>
  )
}

export default EcnInstrumentPage;
