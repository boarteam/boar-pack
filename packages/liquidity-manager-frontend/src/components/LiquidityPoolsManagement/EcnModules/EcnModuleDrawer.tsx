import Descriptions from '../../Descriptions/Descriptions';
import { ecnModuleToDto } from './EcnModulesTable';
import { ecnModuleJoinFields } from './ecnModuleJoinFields';
import { useEcnModulesColumns } from './useEcnModulesColumns';
import { EcnModule, EcnModuleCreateDto, EcnModuleUpdateDto } from '../../../tools/api';
import apiClient from '../../../tools/client/apiClient';
import { Drawer } from 'antd';
import React from "react";

export const EcnModuleDrawer: React.FC<{ id: EcnModule['id'] | undefined, onClose: () => void }> = ({ id, onClose }) => {
  if (id === undefined) {
    return <></>
  }

  const columns = useEcnModulesColumns();

  return (
    <Drawer
      title="Module"
      open
      onClose={onClose}
      width='33%'
    >
      <Descriptions<EcnModule, EcnModuleCreateDto, EcnModuleUpdateDto, { id: number }, number>
        pathParams={{
          id,
        }}
        getOne={params => apiClient.ecnModules.getOneBaseEcnModulesControllerEcnModule(params)}
        onUpdate={params => apiClient.ecnModules.updateOneBaseEcnModulesControllerEcnModule(params)}
        onDelete={params => apiClient.ecnModules.deleteOneBaseEcnModulesControllerEcnModule(params)}
        entityToCreateDto={ecnModuleToDto}
        entityToUpdateDto={ecnModuleToDto}
        columns={columns}
        column={1}
        params={{
          join: ecnModuleJoinFields,
        }}
      />
    </Drawer>
  );
};
