import {
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { type NsGraph } from '@antv/xflow'
import './algo-node.less'
import { MouseEventHandler } from 'react';
import { useEmotionCss } from "@ant-design/use-emotion-css";
import cx from 'classnames';

export const AlgoNode: NsGraph.INodeRender = ({ data }) => {
  const { id, ports, onClick } = data;
  const frontPort = ports.items.find(port => port.id === `${id}-front`);
  const backPort = ports.items.find(port => port.id === `${id}-back`);
  const backPortOnClick: MouseEventHandler<HTMLSpanElement> = (e) => {
    e.stopPropagation();
    backPort?.onClick();
  }
  const frontPortOnClick: MouseEventHandler<HTMLSpanElement> = (e) => {
    e.stopPropagation();
    frontPort?.onClick();
  };

  const nodeClass = useEmotionCss(({ token }) => {
    return {
      border: `1px solid ${token.colorBorder}`,
      borderRadius: token.borderRadius,
      ':hover': {
        borderColor: `${token.colorPrimary}`,
        boxShadow: `${token.boxShadowSecondary}`,
      },
      '.x6-node-selected &, .node-moving &': {
        borderColor: `${token.colorPrimary}`,
        boxShadow: `${token.boxShadowSecondary}`,
      },
    }
  });

  return (
    <div className={cx('xflow-algo-node', nodeClass)} onClick={onClick}>
      {backPort?.onClick && (backPort.connected
        ? <MinusOutlined className="icon" onClick={backPortOnClick} />
        : <PlusOutlined className="icon" onClick={backPortOnClick} />
      )}
      <span className="label">{data.label}</span>
      {frontPort?.onClick && (frontPort.connected
        ? <MinusOutlined className="icon" onClick={frontPortOnClick} />
        : <PlusOutlined className="icon" onClick={frontPortOnClick} />
      )}
    </div>
  )
}
