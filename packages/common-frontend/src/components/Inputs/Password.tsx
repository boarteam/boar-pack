import React from "react";
import { Button, Input, Tooltip } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { PasswordProps } from "antd/es/input/Password";

const { Paragraph } = Typography;

export const Password: React.FC<PasswordProps> = ({ value, onChange }) => {
  return (
    <Input.Group compact={true}>
      <Input.Password
        placeholder={'Enter password'}
        onChange={onChange}
        value={value}
        style={{ width: 'calc(100% - 80px)' }}
        autoComplete={'one-time-code'}
      />
      <Tooltip title="Generate password">
        <Button
          onClick={(e) => {
            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%&';
            const pass = Array(10).fill('').map(x => chars[Math.floor(Math.random() * chars.length)]).join('');
            // @ts-ignore
            onChange?.(pass);
          }}
          icon={<ThunderboltOutlined color={'var(--ant-primary)'} />}
        />
      </Tooltip>
      <Button icon={<Paragraph copyable={{ text: String(value) }} />} />
    </Input.Group>
  );
}
