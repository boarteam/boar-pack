  import { Select } from "antd";
import React from "react";
import { OptionType, useFiltersContext } from "./filtersContext";
import { useIntl } from '@umijs/max';

export const FiltersChooser: React.FC = () => {
  const intl = useIntl();
  const {
    updateAvailableOptions,
    chosenData,
    setChosenData,
    availableOptions,
    loadingOptions,
  } = useFiltersContext();

  return (
    <Select<OptionType['value'][], OptionType>
      filterOption={false}
      key="filtersSetupInstruments"
      allowClear
      mode="multiple"
      loading={loadingOptions}
      style={{ width: 400 }}
      options={[...chosenData.options, ...availableOptions]}
      onSearch={updateAvailableOptions}
      maxTagCount="responsive"
      value={chosenData.values}
      onChange={(values, options) => {
        const optionsArray = Array.isArray(options) ? options : [options];
        setChosenData({ values, options: optionsArray });
      }}
      placeholder={intl.formatMessage({ id: 'pages.ecnSetups.instruments.chooser.placeholder' })}
      onFocus={() => updateAvailableOptions('')}
    />
  )
}
