import React, { useEffect } from "react";
import { Descriptions, Typography } from "antd";
import { UserInfoDto } from "../../tools/api-client";
import safetyRun from "@jifeon/boar-pack-common-frontend/src/tools/safetyRun";
import apiClient from "@@api/apiClient";
import { useLiquidityManagerContext } from "../../tools";
import { PageLoading } from "@ant-design/pro-layout";

const { Title } = Typography;

export type TUserStateDescriptionProps = {
  userId: number;
};

export const UserStateDescription: React.FC<TUserStateDescriptionProps> = ({
  userId,
}) => {
  const [userInfo, setUserInfo] = React.useState<UserInfoDto | null | undefined>(undefined);
  const { worker } = useLiquidityManagerContext();

  useEffect(() => {
    safetyRun(apiClient.userInfo.getUserInfo({
      worker,
    }).then((data) => setUserInfo(data)).catch(() => setUserInfo(null)));
  }, [worker]);

  if (userInfo === undefined) {
    return <>
      <Title level={5}>Account Info</Title>
      <PageLoading />
    </>;
  }

  if (userInfo === null) {
    return <>
      <Title level={5}>Account Info</Title>
      Failed to load account info
    </>;
  }

  const items = [
    {
      key: 'balance',
      label: 'Balance',
      children: userInfo.accountState.balance,
    },
    {
      key: 'margin',
      label: 'Margin',
      children: userInfo.accountState.margin,
    },
    {
      key: 'pnl',
      label: 'P&L',
      children: userInfo.accountState.profit,
    },
    {
      key: 'currency',
      label: 'Currency',
      children: '-',
    },
  ];

  return (
    <Descriptions
      title="Account Info"
      items={items}
      column={2}
      bordered
      size={'small'}
    />
  );
}
