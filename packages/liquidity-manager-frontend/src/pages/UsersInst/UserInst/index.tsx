import { PageContainer } from "@ant-design/pro-components";
import { Card, Result, Space, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import React from "react";
import UserInstDescriptions from "../../../components/UsersInst/UserInstDescriptions";
import UsersSubAccountsInstTable from "../../../components/UsersInst/UsersSubAccountsInst/UsersSubAccountsInstTable";

const { Title } = Typography;

const EcnUserInstPage: React.FC = () => {
  const { id } = useParams();

  if (!id) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
      />
    );
  }

  return (
    <PageContainer>
      <Space
        direction={'vertical'}
        style={{
          width: '100%',
        }}
      >
        <Card>
          <UserInstDescriptions id={id} />
        </Card>
        <Title
          level={4}
          style={{
            marginTop: 24,
          }}
        >Sub Accounts</Title>
        <UsersSubAccountsInstTable userId={id} />
      </Space>
    </PageContainer>
  )
}

export default EcnUserInstPage;
