import Descriptions from '../../Descriptions/Descriptions';
import { ecnModuleToDto } from './EcnModulesTable';
import { ecnModuleJoinFields } from './ecnModuleJoinFields';
import { useEcnModulesColumns } from './useEcnModulesColumns';
import { EcnModule, EcnModuleCreateDto, EcnModuleUpdateDto } from '../../../tools/api';
import apiClient from '../../../tools/client/apiClient';
import { Button, Drawer } from 'antd';
import React from "react";
import { DeleteOutlined } from '@ant-design/icons';
import { deleteNodeConfirm } from '../ConnectionsGraph';
import { useAccess } from '@umijs/max';
import { useLiquidityManagerContext } from "../liquidityManagerContext";

export const EcnModuleDrawer: React.FC<{
  id: EcnModule['id'] | undefined,
  onUpdate: (entity: EcnModule) => void,
  onDelete: (id: EcnModule['id']) => Promise<void>,
  onClose: () => void,
}> = ({ id, onUpdate, onClose, onDelete }) => {
  const columns = useEcnModulesColumns(false);
  const { worker } = useLiquidityManagerContext();

  const idColumnIndex = columns.findIndex(column => column.dataIndex === 'id');
  columns[idColumnIndex] = { ...columns[idColumnIndex], editable: false };
  const { canManageLiquidity } = useAccess() || {};

  if (id === undefined || !worker) {
    return <></>
  }

  return (
    <Drawer
      title="Module"
      open
      onClose={onClose}
      width='33%'
      extra={
        <Button
          onClick={() => {
            deleteNodeConfirm(async () => {
              await onDelete(id);
              onClose();
            })
          }}
          danger
        >
          <DeleteOutlined />
        </Button>
      }
    >
      <Descriptions<EcnModule, EcnModuleCreateDto, EcnModuleUpdateDto, { id: number, worker: string }, number>
        pathParams={{
          id,
          worker,
        }}
        getOne={params => apiClient.ecnModules.getOneBaseEcnModulesControllerEcnModule(params)}
        onUpdate={async params => {
          const entity = await apiClient.ecnModules.updateOneBaseEcnModulesControllerEcnModule(params);
          onUpdate(entity);
          return entity;
        }}
        onDelete={params => apiClient.ecnModules.deleteOneBaseEcnModulesControllerEcnModule(params)}
        entityToUpdateDto={ecnModuleToDto}
        columns={columns}
        canEdit={canManageLiquidity}
        column={1}
        params={{
          join: ecnModuleJoinFields,
        }}
      />
    </Drawer>
  );
};
