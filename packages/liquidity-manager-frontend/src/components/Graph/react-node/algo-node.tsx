import {
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { type NsGraph } from '@antv/xflow'
import { MouseEventHandler } from 'react';
import { createStyles } from "antd-style";
import { getPortIdFromNodeId } from "../../Graph";

const useStyles = createStyles(({ token }) => {
  return {
    node: {
      border: `1px solid ${token.colorBorder}`,
      display: 'flex',
      backgroundColor: token.colorBgBase,
      transition: 'all ease-in-out 0.15s',
      cursor: 'move',
      borderRadius: token.borderRadius,
      ':hover': {
        borderColor: `${token.colorPrimary}`,
        boxShadow: `${token.boxShadowSecondary}`,
      },
      '.x6-node-selected &, .node-moving &': {
        borderColor: `${token.colorPrimary}`,
        boxShadow: `${token.boxShadowSecondary}`,
      },
      '.icon': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '14px',
        height: '14px',
        cursor: 'pointer',
        margin: '8px',
      },
      '.text': {
        flexGrow: 1,
        padding: '8px',
        'br': {
          display: 'block',
          content: '""',
          marginTop: '4px',
        },
      },
      '.label': {
        display: 'flex',
      },
      '.descr': {
        display: 'flex',
        fontSize: 8,
        color: 'grey',
      }
    }
  };
});

export const AlgoNode: NsGraph.INodeRender = ({ data }) => {
  const { styles, cx } = useStyles();

  const { id, ports, onClick } = data;
  // @ts-ignore
  const frontPort = ports.items.find(port => port.id === getPortIdFromNodeId(id, 'frnt'));
  // @ts-ignore
  const backPort = ports.items.find(port => port.id === getPortIdFromNodeId(id, 'back'));
  const backPortOnClick: MouseEventHandler<HTMLSpanElement> = (e) => {
    e.stopPropagation();
    backPort?.onClick();
  }
  const frontPortOnClick: MouseEventHandler<HTMLSpanElement> = (e) => {
    e.stopPropagation();
    frontPort?.onClick();
  };

  return (
    <div className={cx('xflow-algo-node', styles.node)} onClick={onClick}>
      {backPort?.onClick && (backPort.connected
        ? <MinusOutlined className="icon" onClick={backPortOnClick} />
        : <PlusOutlined className="icon" onClick={backPortOnClick} />
      )}
      <div className='text'>
        <span className="label">{data.label}</span>
        <br/>
        <span className="descr">{data.descr ?? 'No Description'}</span>
      </div>
      {frontPort?.onClick && (frontPort.connected
        ? <MinusOutlined className="icon" onClick={frontPortOnClick} />
        : <PlusOutlined className="icon" onClick={frontPortOnClick} />
      )}
    </div>
  )
}
