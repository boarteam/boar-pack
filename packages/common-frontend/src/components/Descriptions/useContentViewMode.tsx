import { Button, Tooltip } from "antd";
import { AppstoreOutlined, MenuOutlined } from "@ant-design/icons";
import { useState } from "react";

export enum VIEW_MODE_TYPE {
  TABS = 'tabs',
  GENERAL = 'general'
}

export default function useContentViewMode({
  mode,
}: {
  mode?: VIEW_MODE_TYPE;
} = {}) {
  const [contentViewMode, setContentViewMode] = useState<VIEW_MODE_TYPE>(mode || VIEW_MODE_TYPE.GENERAL);

  const contentViewModeButton = <Tooltip
    title={contentViewMode === VIEW_MODE_TYPE.TABS ? 'Switch to general view' : 'Switch to tabs view'}
    key="viewModeToggle">
    <Button
      type="text"
      icon={contentViewMode === VIEW_MODE_TYPE.TABS ? <MenuOutlined /> : <AppstoreOutlined />}
      onClick={() => setContentViewMode(contentViewMode === VIEW_MODE_TYPE.TABS ? VIEW_MODE_TYPE.GENERAL : VIEW_MODE_TYPE.TABS)}
    />
  </Tooltip>;

  return { contentViewMode, contentViewModeButton };
}
