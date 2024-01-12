import {
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { type NsGraph } from '@antv/xflow'
import './algo-node.less'
import { MouseEventHandler } from 'react';

export const AlgoNode: NsGraph.INodeRender = ({ data }) => {
  const { id, ports, onClick } = data;
  const frontPort = ports.items.find(port => port.id === `${id}-front`);
  const backPort = ports.items.find(port => port.id === `${id}-back`);
  const backPortOnClick: MouseEventHandler<HTMLSpanElement> = (e) => {
    e.stopPropagation();
    backPort.onClick();
  }
  const frontPortOnClick: MouseEventHandler<HTMLSpanElement> = (e) => {
    e.stopPropagation();
    frontPort.onClick();
  };

  return (
    <div className="xflow-algo-node" onClick={onClick}>
      {backPort && (backPort.connected 
        ? <MinusOutlined className="icon" onClick={backPortOnClick} /> 
        : <PlusOutlined className="icon" onClick={backPortOnClick} />
      )}
      <span className="label">{data.label}</span>
      {frontPort && (frontPort.connected
        ? <MinusOutlined className="icon" onClick={frontPortOnClick} />
        : <PlusOutlined className="icon" onClick={frontPortOnClick} />
      )}
    </div>
  )
}
