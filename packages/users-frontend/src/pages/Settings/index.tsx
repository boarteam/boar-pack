import { PageContainer } from "@ant-design/pro-components";
import React from "react";
import { useIntl } from "@umijs/max";
import useTabs from "../../tools/useTabs";
import { NotificationsSettings } from "../../components/Settings/NotificationsSettings";

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
      onTabChange={setActiveTab}
    >
      {activeTab === Tabs.notifications ? <NotificationsSettings /> : null}
    </PageContainer>
  )
}

export default Settings;
