import React, { useState } from "react";
import { Button, message } from "antd";
import { CheckOutlined, WarningOutlined } from "@ant-design/icons";
import { green, red } from "@ant-design/colors";

type TCheckConnection = {
  defaultSuccessMessage: string;
  defaultErrorMessage: string;
  request: () => Promise<{
    success: boolean;
    message?: string;
  }>;
}

export const useCheckConnection = ({
  defaultSuccessMessage,
  defaultErrorMessage,
  request,
}: TCheckConnection): {
  button: React.ReactElement;
} => {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null | undefined>(undefined);
  const [messageApi, contextHolder] = message.useMessage();

  const checkConnection = () => {
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }

    setLoading(true);
    setError(null);

    request().then(({
      success,
      message,
    }) => {
      if (success) {
        setError(null);
        messageApi.success(message || defaultSuccessMessage);
      } else {
        const err = message || defaultErrorMessage;
        setError(err);
        messageApi.error(err);
      }
    }).catch(e => {
      console.error(e);
    }).finally(() => {
      setLoading(false);
      setTimer(setTimeout(() => {
        setError(undefined);
      }, 3000));
    });
  };

  let icon = null;
  if (error === null) {
    icon = <CheckOutlined style={{ color: green.primary }} />;
  } else if (error !== undefined) {
    icon = <WarningOutlined style={{ color: red.primary }} />;
  }

  const button = <>
    {contextHolder}
    <Button
      size={'small'}
      loading={loading}
      danger={!!error}
      icon={icon}
      onClick={checkConnection}
    >Test</Button>
  </>;

  return {
    button,
  };
}
