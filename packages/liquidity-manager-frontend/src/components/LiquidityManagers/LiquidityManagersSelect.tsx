import { Badge, Select } from "antd";
import React from "react";
import { useLiquidityManagers } from "../../tools/liquidityManagerContext";
import { QuestionMarkHint } from "@jifeon/boar-pack-common-frontend";

export const LiquidityManagersSelect: React.FC = () => {
  const {
    liquidityManager,
    setLiquidityManager,
    liquidityManagers,
  } = useLiquidityManagers()

  return <>
    <Select
      loading={liquidityManagers === null || !liquidityManager}
      key="LiquidityManagerSelect"
      style={{ width: 200 }}
      value={liquidityManager?.id}
      onChange={(value: string) => {
        setLiquidityManager(liquidityManagers?.find(manager => manager.id === value) || null);
      }}
    >
      {liquidityManagers?.map(manager => (
        <Select.Option
          value={manager.id}
          label={manager.name}
          key={manager.id}
        >
          <Badge color={manager.color} text={manager.name} />
        </Select.Option>
      ))}
    </Select>
    <QuestionMarkHint intlPrefix={'pages.liquidityManagerSelect'} />
  </>;
}