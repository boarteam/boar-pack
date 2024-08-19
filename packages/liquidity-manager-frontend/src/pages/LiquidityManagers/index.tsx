import { PageContainer } from "@ant-design/pro-components";
import React from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, Space } from "antd";
import LiquidityManagersTable from "../../components/LiquidityManagers/LiquidityManagersTable";

const Users: React.FC = () => {
  const [searchParams] = useSearchParams();

  return (
    <PageContainer>
      <Space direction="vertical" style={{ width: '100%' }}>
        {searchParams.get('error') === 'no_liquidity_managers' && (
          <Alert
            message="No liquidity managers found"
            description="Please add connection configurations for databases before start working with liquidity managers. Make sure you list necessary users in every liquidity manager."
            type="warning"
            showIcon
          />
        )}
        <LiquidityManagersTable />
      </Space>
    </PageContainer>
  )
}

export default Users;
