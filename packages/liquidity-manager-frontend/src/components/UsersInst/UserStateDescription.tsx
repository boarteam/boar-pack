import React, { useEffect } from "react";
import { Descriptions, Typography, Row, Col, Card } from "antd";
import { UserInfoDto } from "../../tools/api-client";
import safetyRun from "@jifeon/boar-pack-common-frontend/src/tools/safetyRun";
import apiClient from "@@api/apiClient";
import { useLiquidityManagerContext } from "../../tools";
import { PageLoading } from "@ant-design/pro-layout";
import { Pie } from '@ant-design/plots';
import { useRealTimeData } from "../RealTimeData/RealTimeDataSource";

const { Title } = Typography;

export type TUserStateDescriptionProps = {
  userId: number,
};

type TData = {
  label: string;
  value: number;
};

export const UserStateDescription: React.FC<TUserStateDescriptionProps> = ({
  userId,
}) => {
  const [userInfo, setUserInfo] = React.useState<UserInfoDto | null | undefined>(undefined);
  const { worker } = useLiquidityManagerContext();
  const { realTimeDataSource } = useRealTimeData();

  useEffect(() => {
    safetyRun(apiClient.userInfo.getUserInfo({
      worker,
    }).then((data) => setUserInfo(data)).catch(() => setUserInfo(null)));

    const handler = (event: CustomEvent<UserInfoDto>) => {
      setUserInfo(event.detail);
    }

    const eventName = 'userInfo';
    realTimeDataSource.userInfoEvents.addEventListener(eventName, handler);
    realTimeDataSource.subscribeToUserInfo(userId);

    return () => {
      realTimeDataSource.userInfoEvents.removeEventListener(eventName, handler);
    }
  }, [worker, realTimeDataSource]);

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

  const data: TData[] = [
    {
      label: 'Margin',
      value: userInfo.accountState.margin || 0,
    },
    {
      label: 'P&L',
      value: userInfo.accountState.profit || 0,
    },
  ];

  return (
    <Row gutter={20} align={'stretch'}>
      <Col span={12}>
        <Card style={{
          height: '100%',
        }}>
          <Descriptions
            title="Account Info"
            items={items}
            column={1}
            bordered
            size={'small'}
          />
        </Card>
      </Col>
      <Col span={12}>
        <Card>
          <Pie
            theme={'dark'}
            data={data}
            angleField={'value'}
            colorField={'label'}
            radius={0.8}
            tooltip={false}
            label={{
              text: (d: TData) => `${d.label}\n ${d.value}`,
              position: 'spider',
            }}
            legend={{
              color: {
                title: false,
                position: 'right',
                rowPadding: 5,
              },
            }}
            height={300}
          />
        </Card>
      </Col>
    </Row>
  );
}
