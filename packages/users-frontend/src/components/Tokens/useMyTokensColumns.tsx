import { ProColumns } from "@ant-design/pro-components";
import { EditOutlined } from "@ant-design/icons";
import { useAccess } from "umi";
import { Token } from "../../tools/api-client";

export const useMyTokensColumns = (): ProColumns<Token>[] => {
  const { canManageMyTokens } = useAccess() || {};

  const columns: ProColumns<Token>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      formItemProps: {
        rules: [
          {
            required: true,
          }
        ]
      },
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      readonly: true,
      width: '250px',
    }
  ];

  if (canManageMyTokens) {
    columns.push({
      title: 'Actions',
      valueType: 'option',
      width: '3%',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          <EditOutlined />
        </a>,
      ],
    });
  }

  return columns;
};
