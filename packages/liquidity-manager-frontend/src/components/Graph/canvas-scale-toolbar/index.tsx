import React from 'react';
import { CanvasToolbar } from '@antv/xflow';
import { useConfig, CANVAS_SCALE_TOOLBAR_CONFIG } from './config';
import type { IPosition } from '@antv/xflow-core';

// Define the interface for the component props
interface IProps {
  position?: IPosition;
  className?: string;
  layout?: 'vertical' | 'horizontal';
  style?: React.CSSProperties;
}

// Define the component using TypeScript syntax and types
const CanvasScaleToolbar: React.FC<IProps> = (props) => {
  const config = useConfig(props);
  return (
    <CanvasToolbar
      layout="vertical"
      {...props}
      config={config}
      position={props.position || { top: 12, right: 12 }}
    />
  )
};

// Export the component and the config constant
export { CanvasScaleToolbar, CANVAS_SCALE_TOOLBAR_CONFIG };
