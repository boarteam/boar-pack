import { useEffect, useState } from 'react';
import { Col, Empty, Row, Space } from "antd";
import { PageLoading } from "@ant-design/pro-layout";
import { Line } from "@ant-design/plots";
import { StatisticCard } from "@ant-design/pro-components";
import { groupBy } from "lodash";
import { createStyles } from "antd-style";
import { UsersConnectionsStatisticDto } from "../../tools/api-client";
import { useApiClient } from "../ApiClientContext";
import { TUser } from "./index";
import { Link } from "react-router-dom";

type TUsersConnectionsStatisticCardsProps = {
  users: TUser[];
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

export const UsersConnectionsStatisticCards = ({
  users,
  updateInterval,
}: TUsersConnectionsStatisticCardsProps) => {
  const apiClient = useApiClient();
  let startTimeInitial = new Date();
  startTimeInitial.setHours(startTimeInitial.getHours() - 1);
  const userPageUrlPrefix = '/admin/users';

  const [startTime, setStartTime] = useState<string | undefined>(startTimeInitial.toISOString());
  const [endTime, setEndTime] = useState<string | undefined>(new Date().toISOString());
  const [data, setData] = useState<UsersConnectionsStatisticDto[] | null>(null);

  const getUsersConnectionsStatistic = () => {
    apiClient.usersConnectionsStatistic.getTimeline({
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
    getUsersConnectionsStatistic();
  }, [startTime, endTime]);

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
              dataByUsers[user.id] ?
                <Line {...{
                  height: 200,
                  data: dataByUsers[user.id],
                  xField: 'time',
                  yField: 'records',
                  colorField: 'target',
                  legend: {
                    size: false,
                    color: {
                      itemMarker: 'rect'
                    }
                  },
                  axis: {
                    y: {
                      title: 'Quotes number',
                      gridLineWidth: 1,
                    },
                  },
                  line: {
                    style: {
                      lineWidth: 2
                    }
                  },
                }} /> : <Empty description='No user connections statistic' />
            }
          />
        </Col>
      ))}
    </Row>
  );
}
