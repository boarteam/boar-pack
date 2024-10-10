import React from "react";
import { Descriptions } from "antd";

export type TUserStateDescriptionProps = {
  userId: number;
};

export const UserStateDescription: React.FC<TUserStateDescriptionProps> = ({
  userId,
}) => {
  const items = [
    {
      key: 'balance',
      label: 'Balance',
      children: 0,
    },
    {
      key: 'margin',
      label: 'Margin',
      children: 0,
    },
    {
      key: 'pnl',
      label: 'P&L',
      children: 0,
    },
    {
      key: 'currency',
      label: 'Currency',
      children: 'USD',
    },
  ];

  return (
    <Descriptions
      title="User Info"
      items={items}
      column={4}
      bordered
      size={'small'}
    />
  );
}
