import { useEffect, useState } from 'react';
import { Col, Empty, Row } from "antd";
import { PageLoading } from "@ant-design/pro-layout";
import { Line } from "@ant-design/plots";
import { StatisticCard } from "@ant-design/pro-components";
import { groupBy } from "lodash";
import { createStyles } from "antd-style";
import { UsersConnectionsStatisticDto } from "../../tools/api-client";
import apiClient from "../../tools/api-client/apiClient";

export type TTarget = {
  id: string;
  name: string;
}

type TTargetsConnectionsStatisticCardsProps = {
  targets?: TTarget[];
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

export const TargetsConnectionsStatisticCards = ({
  targets,
  updateInterval,
}: TTargetsConnectionsStatisticCardsProps) => {
  let startTimeInitial = new Date();
  startTimeInitial.setHours(startTimeInitial.getHours() - 1);
  const [startTime, setStartTime] = useState<string | undefined>(startTimeInitial.toISOString());
  const [endTime, setEndTime] = useState<string | undefined>(new Date().toISOString());
  const [data, setData] = useState<UsersConnectionsStatisticDto[] | null>(null);

  const getTargetsConnectionsStatistic = () => {
    if (!targets || targets.length === 0) {
      return;
    }

    apiClient.usersConnectionsStatistic.getTargetsTimeline({
      startTime,
      endTime,
      targetIds: targets.map(t => t.id),
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
    getTargetsConnectionsStatistic();
  }, [startTime, endTime]);

  const { styles } = useStyles();

  if (!data || !targets) {
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
              dataByTargets[target.id] ?
                <Line {...{
                  height: 200,
                  data: dataByTargets[target.id],
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
