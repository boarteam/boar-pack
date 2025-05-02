import { useEffect, useState } from 'react';
import { Col, Empty, Row, Space, Tag, theme } from "antd";
import { PageLoading } from "@ant-design/pro-layout";
import { Line } from "@ant-design/plots";
import { StatisticCard } from "@ant-design/pro-components";
import { groupBy } from "lodash";
import { createStyles } from "antd-style";
import { QuotesStatisticDto } from "../../tools/api-client";
import apiClient from "../../tools/api-client/apiClient";
import { TStatisticProvider } from "./index";

type TQuotesStatisticCardsProps = {
  providers: TStatisticProvider[],
  updateInterval?: number;
}

const useStyles = createStyles(() => {
  return {
    card: {
      height: '100%',
      '.ant-pro-card-body': {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }
    }
  };
});

export const QuotesStatisticCards = ({
  providers,
  updateInterval,
}: TQuotesStatisticCardsProps) => {
  let startTimeInitial = new Date();
  startTimeInitial.setHours(startTimeInitial.getHours() - 1);

  const [startTime, setStartTime] = useState<string | undefined>(startTimeInitial.toISOString());
  const [endTime, setEndTime] = useState<string | undefined>(new Date().toISOString());
  const [data, setData] = useState<QuotesStatisticDto[] | null>(null);

  const getQuotesStatistic = () => {
    apiClient.quotesStatistics.getTimeline({
      startTime,
      endTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).then(setData);
  }

  useEffect(() => {
    if (updateInterval) {
      setInterval(() => {
        startTimeInitial = new Date();
        startTimeInitial.setHours(startTimeInitial.getHours() - 1);
        setStartTime(startTimeInitial.toISOString());
        setEndTime(new Date().toISOString());
      }, updateInterval);
    }
  }, []);

  useEffect(() => {
    getQuotesStatistic();
  }, [startTime, endTime]);

  const { styles } = useStyles();
  const { token } = theme.useToken();

  if (!data || !providers) {
    return <PageLoading />;
  }

  const dataByProvider = groupBy(data, 'providerName');

  return (
    <Row gutter={[24, 24]}>
      {providers.map((provider, i) => (
        <Col className="gutter-row" key={i} xl={6} lg={12} xs={24}>
          <StatisticCard
            bordered
            className={styles.card}
            title={
              <Space>
                <span>{provider.name}</span>
                <Tag color={provider.enabled ? 'green' : 'red'}>
                  {provider.enabled ? 'Enabled' : 'Disabled'}
                </Tag>
              </Space>
            }
            chart={
              dataByProvider[provider.id] ?
                <Line {...{
                  height: 150,
                  data: dataByProvider[provider.id],
                  xField: 'time',
                  yField: 'records',
                  legend: { size: false },
                  tooltip: {
                    title: false,
                    items: [
                      { name: 'Time', field: 'time', color: null },
                      { name: 'Quotes', field: 'records', color: null },
                    ],
                  },
                  axis: {
                    y: {
                      title: 'Quotes number',
                      gridLineWidth: 1,
                    },
                  },
                  area: {
                    style: {
                      fill: `linear-gradient(-90deg, white 0%, ${provider.enabled ? token.colorPrimary : token.colorTextDisabled} 100%)`
                    },
                  },
                  line: {
                    style: {
                      stroke: provider.enabled ? token.colorPrimary : token.colorTextDisabled,
                      lineWidth: 2
                    }
                  },
                }} /> : <Empty description='No quotes statistic' />
            }
          />
        </Col>
      ))}
    </Row>
  );
}
