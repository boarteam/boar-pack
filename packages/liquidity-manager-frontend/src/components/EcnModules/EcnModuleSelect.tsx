import { useIntl } from "@umijs/max";
import { Select, Tag } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { keyBy } from "lodash";
import { SFields } from "@nestjsx/crud-request";
import { EcnModule } from "@@api/generated";
import apiClient from '@@api/apiClient';
import { useLiquidityManagerContext } from "../../tools/liquidityManagerContext";

type TValue = Pick<EcnModule, 'id' | 'name'>[];
type TOption = { value: EcnModule['id'], label: EcnModule['name'] };

export const EcnModulesSelect: React.FC<{
  value?: TValue,
  onChange?: (value: TValue) => void;
}> = ({ value, onChange }) => {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const [modules, setModules] = useState<TValue>([]);
  const { worker } = useLiquidityManagerContext();

  const modulesById = useMemo(() => keyBy(modules, 'id'), [modules]);
  const options = useMemo(() => modules.map(module => ({ label: module.name, value: module.id })), [modules]);

  const updateOptions = useCallback((selectedGroups: TValue, search: string) => {
    if (!worker) return;

    setIsLoading(true);

    const filters: SFields[] = [{ "name": { "$contL": search } }];
    if (selectedGroups.length) {
      filters.push({ "id": { "$notin": selectedGroups.map(({ id }) => id) } });
    }

    apiClient.ecnModules
      .getManyBaseEcnModulesControllerEcnModule({
        s: JSON.stringify({ "$and": filters }),
        fields: ['name,id'],
        limit: 10,
        worker,
      })
      .then(response => {
        setModules([...selectedGroups, ...response.data as TValue]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [worker]);

  useEffect(() => {
    updateOptions(value ?? [], '');
  }, [value]);

  return (
    <Select<EcnModule['id'][], TOption>
      key={"ecnModules"}
      dropdownStyle={{ minWidth: 200 }}
      allowClear={true}
      mode="multiple"
      style={{ minWidth: 200 }}
      maxTagCount='responsive'
      loading={isLoading}
      filterOption={false}
      tagRender={({ label, value, ...props }) => <Tag {...props}>{label}</Tag>}
      onChange={newValues => onChange?.(newValues.map(id => modulesById[id]))}
      value={value?.map(({ id }) => id) ?? []}
      options={options}
      onSearch={search => updateOptions(value ?? [], search)}
      placeholder={intl.formatMessage({ id: 'pages.ecnModules.selector.placeholder' })}
    />
  )
}
