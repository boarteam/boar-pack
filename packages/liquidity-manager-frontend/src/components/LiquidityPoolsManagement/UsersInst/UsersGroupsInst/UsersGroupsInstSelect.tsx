import { ProFormSelectProps } from "@ant-design/pro-form/lib/components/Select";
import React, { useState } from "react";
import { ProFormSelect } from "@ant-design/pro-form";
import { UsersGroupsInst } from "../../../../tools/api";
import apiClient from "../../../../tools/client/apiClient";
import styles from "../../../../tools/tools.less";

type UsersGroupsInstSelectProps = ProFormSelectProps & {
  usersGroupsInst: UsersGroupsInst | null,
  onChange?: (type: UsersGroupsInst | null) => void,
  filter?: string[],
};

export const UsersGroupsInstSelect: React.FC<UsersGroupsInstSelectProps> = ({
  usersGroupsInst,
  onChange,
  filter = [],
  ...rest
}) => {
  const [value, setValue] = useState(usersGroupsInst ? {
    label: usersGroupsInst.name,
    value: usersGroupsInst.id,
  } : null);

  const getUsersGroupsInst = async (keyword: string) => {
    const reqFilter = [...filter];
    if (keyword) {
      reqFilter.push('name||$contL||' + keyword);
    }
    const resp = await apiClient.usersGroupsInst.getManyBaseUsersGroupsInstControllerUsersGroupsInst({
      filter: reqFilter,
    });
    return resp.data;
  }

  return (
    <ProFormSelect.SearchSelect
      showSearch
      mode={'single'}
      request={(params: { keyWords: string }) => getUsersGroupsInst(params.keyWords)}
      formItemProps={{
        className: styles.noMargin,
      }}
      style={{ minWidth: 160 }}
      fieldProps={{
        fieldNames: {
          value: 'id',
          label: 'name',
        },
        value,
        onChange(value, row) {
          setValue(value);
          onChange?.(row ? value : null);
        },
      }}
      {...rest}
    />
  );
}
