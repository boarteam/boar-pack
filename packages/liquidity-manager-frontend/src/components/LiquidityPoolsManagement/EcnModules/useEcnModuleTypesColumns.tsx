import { useIntl } from "@umijs/max";
import { ProColumns } from "@ant-design/pro-components";
import { EcnModuleType } from "../../../tools/api";

export const useEcnModuleTypesColumns = (): ProColumns<EcnModuleType>[] => {
  const intl = useIntl();

  const columns: ProColumns<EcnModuleType>[] = [
    {
      title: intl.formatMessage({ id: 'pages.ecnModuleTypes.name' }),
      dataIndex: 'name',
      sorter: true,
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
      title: intl.formatMessage({ id: 'pages.ecnModuleTypes.descr' }),
      dataIndex: 'descr',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
    },
  ];

  return columns;
};
