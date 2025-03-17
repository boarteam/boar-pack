import { MutableRefObject, useState } from 'react';
import { Button } from 'antd';
import { ActionType } from "@ant-design/pro-table";
import { PlusOutlined } from "@ant-design/icons";
import { FormattedMessage } from "react-intl";
import type { SizeType } from "antd/es/config-provider/SizeContext";
import { CreateEntityModal, CreateEntityModalProps } from "./CreateEntityModal";
import { DescriptionsRefType } from "../Descriptions";

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

      // TODO: How to import ApiError?
      // import { ApiError } from "@boarteam/boar-pack-users-frontend/dist/src/tools/api-client";
      // if (e instanceof ApiError) {}
      if (!e.body?.statusCode || !e.body?.message) {
        return;
      }

      const { statusCode, message } = e.body;
      if (statusCode === 400) {
        // Example: Error from MDM server: "base_symbol" String should have at least 1 character
        const fieldName = message.match(/"([^"]+)"/)?.[1];
        if (fieldName) {
          descriptionsRef.current.setFieldErrors([
            {
              name: fieldName,
              errors: [message],
            }
          ]);
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
