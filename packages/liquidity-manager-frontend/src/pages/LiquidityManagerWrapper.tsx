import { ConfigProvider } from "antd";
import React from "react";
import { Outlet } from "umi";
import { useLiquidityManagers, LiquidityManagerContext } from "../tools";

const LiquidityManagerWrapper: React.FC = () => {
  const liquidityManagerContext = useLiquidityManagers();
  return <LiquidityManagerContext.Provider value={liquidityManagerContext}>
    <ConfigProvider
      theme={liquidityManagerContext.theme}
    >
      <Outlet />
    </ConfigProvider>
  </LiquidityManagerContext.Provider>;
}

export default LiquidityManagerWrapper;
