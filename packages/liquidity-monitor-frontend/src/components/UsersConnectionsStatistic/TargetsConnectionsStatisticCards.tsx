import { useEffect, useState } from 'react';
import { Col, Empty, message, Row } from 'antd';
import { PageLoading } from '@ant-design/pro-layout';
import { Line } from '@ant-design/plots';
import { StatisticCard } from '@ant-design/pro-components';
import { groupBy } from 'lodash';
import { createStyles } from 'antd-style';
import { UsersConnectionsStatisticDto } from '../../tools/api-client';
import { useApiClient } from '../ApiClientContext';

export type TTarget = {
  id: string;
  name: string;
};

type TTargetsConnectionsStatisticCardsProps = {
  targets?: TTarget[];
  updateInterval?: number;
};

const useStyles = createStyles(() => {
  return {
    card: {
      height: '100%',
      '.ant-pro-card-body': {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      },
    },
  };
});

// The cards always show the last hour; computed per call so the interval below
// never reuses a stale timestamp.
const oneHourAgoISO = () => {
  const from = new Date();
  from.setHours(from.getHours() - 1);
  return from.toISOString();
};

export const TargetsConnectionsStatisticCards = ({
  targets,
  updateInterval,
}: TTargetsConnectionsStatisticCardsProps) => {
  const apiClient = useApiClient();
  const [startTime, setStartTime] = useState<string | undefined>(oneHourAgoISO);
  const [endTime, setEndTime] = useState<string | undefined>(new Date().toISOString());
  const [data, setData] = useState<UsersConnectionsStatisticDto[] | null>(null);

  const getTargetsConnectionsStatistic = () => {
    if (!targets || targets.length === 0) {
      return;
    }

    apiClient.usersConnectionsStatistic
      .getTargetsTimeline({
        startTime,
        endTime,
        targetIds: targets.map((t) => t.id),
      })
      .then(setData)
      .catch((e) => {
        console.error(e);
        message.error('Targets connections statistic request failed');
        setData([]);
      });
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (updateInterval) {
      intervalId = setInterval(() => {
        setStartTime(oneHourAgoISO());
        setEndTime(new Date().toISOString());
      }, updateInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [updateInterval]);

  useEffect(() => {
    getTargetsConnectionsStatistic();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the helper closes over the `targets` array prop and is rebuilt on every render, so depending on it would re-request the timeline whenever the caller passes a new array; the request is meant to follow the time window only
  }, [startTime, endTime]);

  const { styles } = useStyles();

  // Without targets no request is made, so there is nothing to wait for.
  if (!targets || targets.length === 0) {
    return <Empty />;
  }

  if (!data) {
    return <PageLoading />;
  }

  const dataByTargets = groupBy(data, 'targetId');

  return (
    <Row gutter={[24, 24]}>
      {targets.map((target, i) => (
        <Col className="gutter-row" key={i} xl={6} lg={12} xs={24}>
          <StatisticCard
            bordered
            className={styles.card}
            title={target.name}
            chart={
              dataByTargets[target.id] ? (
                <Line
                  {...{
                    height: 200,
                    data: dataByTargets[target.id],
                    xField: 'time',
                    yField: 'records',
                    colorField: 'target',
                    legend: {
                      size: false,
                      color: {
                        itemMarker: 'rect',
                      },
                    },
                    axis: {
                      y: {
                        title: 'Quotes number',
                        gridLineWidth: 1,
                      },
                    },
                    line: {
                      style: {
                        lineWidth: 2,
                      },
                    },
                  }}
                />
              ) : (
                <Empty description="No user connections statistic" />
              )
            }
          />
        </Col>
      ))}
    </Row>
  );
};
