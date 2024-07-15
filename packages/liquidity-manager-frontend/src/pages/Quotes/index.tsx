import { PageContainer } from "@ant-design/pro-components";
import React from "react";
import QuotesTable from "../../components/Quotes/QuotesTable";

const Quotes: React.FC = () => {
  return (
    <PageContainer>
      <QuotesTable />
    </PageContainer>
  )
}

export default Quotes;
