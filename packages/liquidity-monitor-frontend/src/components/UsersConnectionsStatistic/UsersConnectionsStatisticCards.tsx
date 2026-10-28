import { useCallback, useEffect, useState } from 'react';
import { Col, Empty, message, Row, Space } from 'antd';
import { PageLoading } from '@ant-design/pro-layout';
import { Line } from '@ant-design/plots';
import { StatisticCard } from '@ant-design/pro-components';
import { groupBy } from 'lodash';
import { createStyles } from 'antd-style';
import { UsersConnectionsStatisticDto } from '../../tools/api-client';
import { useApiClient } from '../ApiClientContext';
import { TUser } from './index';
import { Link } from 'react-router-dom';

type TUsersConnectionsStatisticCardsProps = {
  users: TUser[];
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

export const UsersConnectionsStatisticCards = ({
  users,
  updateInterval,
}: TUsersConnectionsStatisticCardsProps) => {
  const apiClient = useApiClient();
  const userPageUrlPrefix = '/admin/users';

  const [startTime, setStartTime] = useState<string | undefined>(oneHourAgoISO);
  const [endTime, setEndTime] = useState<string | undefined>(new Date().toISOString());
  const [data, setData] = useState<UsersConnectionsStatisticDto[] | null>(null);

  const getUsersConnectionsStatistic = useCallback(() => {
    apiClient.usersConnectionsStatistic
      .getTimeline({
        startTime,
        endTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      .then(setData)
      .catch((e) => {
        console.error(e);
        message.error('Users connections statistic request failed');
        setData([]);
      });
  }, [apiClient.usersConnectionsStatistic, startTime, endTime]);

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
    getUsersConnectionsStatistic();
  }, [getUsersConnectionsStatistic]);

  const { styles } = useStyles();

  if (!data || !users) {
    return <PageLoading />;
  }

  const dataByUsers = groupBy(data, 'userId');

  return (
    <Row gutter={[24, 24]}>
      {users.map((user, i) => (
        <Col className="gutter-row" key={i} xl={6} lg={12} xs={24}>
          <StatisticCard
            bordered
            className={styles.card}
            title={
              <Space>
                <Link to={`${userPageUrlPrefix}/${user.id}`}>{user.name}</Link>
              </Space>
            }
            chart={
              dataByUsers[user.id] ? (
                <Line
                  {...{
                    height: 200,
                    data: dataByUsers[user.id],
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
