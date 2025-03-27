import { MutableRefObject, useState } from 'react';
import { Button } from 'antd';
import { ActionType } from "@ant-design/pro-table";
import { PlusOutlined } from "@ant-design/icons";
import { FormattedMessage } from "react-intl";
import type { SizeType } from "antd/es/config-provider/SizeContext";
import { CreateEntityModal, CreateEntityModalProps } from "./CreateEntityModal";
import { DescriptionsRefType } from "../Descriptions";
import { ApiError } from '../../tools'

let creatingRecordsCount = 0;
export const KEY_SYMBOL = Symbol('key');
const NEW_RECORD = 'NEW_RECORD';

export function getNewId(): string {
  return NEW_RECORD + creatingRecordsCount++;
}

export function isRecordNew(record: Record<string | symbol, any>): boolean {
  return record[KEY_SYMBOL]?.startsWith?.(NEW_RECORD) || record.id?.startsWith?.(NEW_RECORD) || false;
}

export function useCreation<Entity, CreateDto, TPathParams = {}>({
  title,
  mainTitle,
  columns,
  idColumnName,
  onCreate,
  pathParams,
  entityToCreateDto,
  actionRef,
  createButtonSize,
  popupCreation,
  createNewDefaultParams,
}: {
  actionRef?: MutableRefObject<ActionType | undefined>;
  pathParams: TPathParams;
  entityToCreateDto: (entity: Partial<Entity>) => CreateDto;
  onCreate?: ({}: { requestBody: CreateDto } & TPathParams) => Promise<Entity>;
  createButtonSize: SizeType;
  popupCreation?: boolean;
  createNewDefaultParams?: Partial<Entity>;
} & Omit<CreateEntityModalProps<Entity>, 'onSubmit' | 'onCancel' | 'entity'>) {
  const [createPopupData, setCreatePopupData] = useState<Partial<Entity> | undefined>();

  const onCreateSubmit = async (data: Partial<Entity>, descriptionsRef: MutableRefObject<DescriptionsRefType<Entity>>) => {
    try {
      await onCreate?.({
        ...pathParams,
        requestBody: entityToCreateDto({
          ...pathParams,
          ...data,
        })
      });
      setCreatePopupData(undefined);
      await actionRef?.current?.reload();
    } catch (e) {
      console.error(e);

      // Handle common error
      if (e.body && e.body.statusCode && e.body.errors) {
        const error = e as ApiError;
        const { statusCode, errors } = error.body;
        // Validation error. Highlight corresponding form fields
        if (statusCode === 400) {
          const formErrors = errors.map(error => ({
            name: error.field,
            errors: [error.message],
          }));

          // @ts-ignore
          descriptionsRef.current.setFieldErrors(formErrors);
        }
      }
    }
  };

  const createButton = <Button
    size={createButtonSize}
    type="primary"
    key="create"
    onClick={() => {
      if (popupCreation) {
        setCreatePopupData(createNewDefaultParams);
      } else {
        actionRef?.current?.addEditRecord({
          [KEY_SYMBOL]: getNewId(),
          ...createNewDefaultParams,
        }, {
          position: 'top',
        });
      }
    }}
  >
    <PlusOutlined /> <FormattedMessage id={'table.newButton'} />
  </Button>;

  const modal = <CreateEntityModal<Entity, CreateDto, Entity, TPathParams>
    entity={createPopupData}
    title={title}
    mainTitle={mainTitle}
    columns={columns}
    idColumnName={idColumnName}
    onCancel={() => {
      setCreatePopupData(undefined);
    }}
    onSubmit={onCreateSubmit}
  />;

  return {
    creationModal: modal,
    createButton,
  };
}
