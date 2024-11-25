import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from "@ant-design/icons";
import React from "react";

export const connectionStatuses = {
  [WebSocket.CLOSED]: {
    text: 'Connection Closed',
    color: 'error',
    icon: <CloseCircleOutlined />,
  },
  [WebSocket.CLOSING]: {
    text: 'Connection Closing',
    color: 'error',
    icon: <CloseCircleOutlined />,
  },
  [WebSocket.CONNECTING]: {
    text: 'Connecting',
    color: 'processing',
    icon: <SyncOutlined spin />,
  },
  [WebSocket.OPEN]: {
    text: 'Connected',
    color: 'success',
    icon: <CheckCircleOutlined />,
  },
} as const;

export type TConnectionStatus = keyof typeof connectionStatuses;
