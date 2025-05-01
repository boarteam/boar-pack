import React from "react";
import { useIntl } from "@umijs/max";
import { NotificationsSettings } from "../../components/Settings/NotificationsSettings";
import { PageContainer } from "@ant-design/pro-components";
import { useTabs } from "@boarteam/boar-pack-common-frontend";

enum Tabs {
  notifications = 'notifications',
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useTabs<Tabs>(Tabs.notifications);
  const intl = useIntl();

  const tabList = [
    {
      key: Tabs.notifications,
      tab: intl.formatMessage({ id: 'pages.settings.notifications' }),
    },
  ];

  return (
    <PageContainer
      tabList={tabList}
      tabActiveKey={activeTab}
      onTabChange={(key) => {
        setActiveTab(key as Tabs);
      }}
    >
      {activeTab === Tabs.notifications ? <NotificationsSettings /> : null}
    </PageContainer>
  )
}

export default Settings;
