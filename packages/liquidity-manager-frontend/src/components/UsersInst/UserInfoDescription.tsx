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
  realValue: number;
};

export const UserInfoDescription: React.FC<TUserStateDescriptionProps> = ({
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

  const {
    margin,
    balance,
    profit,
    equity,
    freeMargin,
    marginLevel,
  } = userInfo.accountState;

  const items = [
    {
      key: 'balance',
      label: 'Balance',
      children: balance.toFixed(2),
    },
    {
      key: 'margin',
      label: 'Margin',
      children: margin.toFixed(2),
    },
    {
      key: 'equity',
      label: 'Equity',
      children: equity.toFixed(2),
    },
    {
      key: 'pnl',
      label: 'Profit',
      children: profit.toFixed(2),
    },
    {
      key: 'freeMargin',
      label: 'Free Margin',
      children: freeMargin.toFixed(2),
    },
    {
      key: 'marginLevel',
      label: 'Margin Level',
      children: marginLevel.toFixed(2) + '%',
    },
    {
      key: 'leverage',
      label: 'Leverage',
      children: userInfo.leverage.toFixed(2),
    },
    {
      key: 'currency',
      label: 'Currency',
      children: userInfo.currency,
    },
  ];

  const data: TData[] = [
    {
      label: 'Margin',
      // for extremely low values antd plots works incorrectly
      value: margin / freeMargin < 0.01 ? 0 : userInfo.accountState.margin,
      realValue: margin,
    },
    {
      label: 'Free Margin',
      value: freeMargin,
      realValue: freeMargin,
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
            contentStyle={{
              textAlign: 'right',
            }}
          />
        </Card>
      </Col>
      <Col span={12}>
        <Card style={{
          height: '100%',
        }}>
          <Pie
            theme={'dark'}
            data={data}
            angleField={'value'}
            colorField={'label'}
            radius={0.8}
            tooltip={false}
            label={{
              text: (d: TData) => `${d.label}\n ${d.realValue}`,
              position: 'spider',
            }}
            legend={{
              color: {
                title: false,
                position: 'right',
                rowPadding: 5,
              },
            }}
            height={350}
          />
        </Card>
      </Col>
    </Row>
  );
}
