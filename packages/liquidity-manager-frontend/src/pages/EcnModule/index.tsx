import React from 'react';
import { Result } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { useParams } from 'react-router-dom';
import ConnectionsGraph from "../../components/ConnectionsGraph";

const ModulesGraph: React.FC = () => {
  const { id } = useParams();

  if (!id) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
      />
    )
  }

  return (
    <PageContainer>
      <ConnectionsGraph modules={new Set([Number(id)])} />
    </PageContainer>
  );
};

export default ModulesGraph;
