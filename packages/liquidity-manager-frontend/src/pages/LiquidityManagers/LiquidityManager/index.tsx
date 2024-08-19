import { PageContainer } from "@ant-design/pro-components";
import React, { useEffect } from "react";
import LiquidityManagersUsersTable from "../../../components/LiquidityManagersUsers/LiquidityManagersUsersTable";
import { useParams } from "react-router-dom";
import { LiquidityManager } from "../../../tools/api-client";
import apiClient from "../../../tools/api-client/apiClient";
import { PageLoading } from "@ant-design/pro-layout";

const LiquidityManagerPage: React.FC = () => {
  const { id } = useParams();
  const [liquidityManager, setLiquidityManager] = React.useState<LiquidityManager | null>(null);

  useEffect(() => {
    apiClient.liquidityManagers.getOneBaseLiquidityManagersControllerLiquidityManager({
      id: id
    }).then((response) => {
      setLiquidityManager(response);
    });
  }, [id]);

  if (!liquidityManager) {
    return <PageLoading />;
  }

  return (
    <PageContainer
      title={`Users of ${liquidityManager.name}`}
    >
      <LiquidityManagersUsersTable
        liquidityManagerId={id}
      />
    </PageContainer>
  )
}

export default LiquidityManagerPage;
