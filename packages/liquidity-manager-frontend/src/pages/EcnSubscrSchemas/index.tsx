import EcnSubscrSchemasTable from "../../components/EcnSubscrSchemas/EcnSubscrSchemasTable";
import { PageContainer } from "@ant-design/pro-components";
import { Card } from 'antd';
import React from "react";

const EcnSubscrSchemas: React.FC = () => {
  return (
    <PageContainer>
      <Card>
        <EcnSubscrSchemasTable />
      </Card>
    </PageContainer>
  )
}

export default EcnSubscrSchemas;
