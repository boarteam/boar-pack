import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "@@api/apiClient";
import { SFields } from "@nestjsx/crud-request";
import filtersLocalStorage from "./filtersLocalStorage";
import { useSearchParams } from "react-router-dom";
import { EcnInstrument, EcnInstrumentsGroup } from "@@api/generated";
import { LiquidityManagersHookResult, useLiquidityManagerContext } from "../../../tools";

export type OptionType = { value: string, label: string };

async function getOptionsFromInstrumentsOrEmpty(
  params: Parameters<typeof apiClient.ecnInstruments.getManyBaseEcnInstrumentsControllerEcnInstrument>[0]
): Promise<OptionType[]> {
  try {
    const { data } = await apiClient.ecnInstruments.getManyBaseEcnInstrumentsControllerEcnInstrument(params);
    return data.map(instrument => ({ value: `instr-${instrument.instrumentHash}`, label: instrument.name }));
  }
  catch (error) {
    console.error(error);
    return [];
  }
}

async function getOptionsFromGroupsOrEmpty(
  params: Parameters<typeof apiClient.ecnInstrumentsGroups.getManyBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup>[0]
): Promise<OptionType[]> {
  try {
    const { data } = await apiClient.ecnInstrumentsGroups.getManyBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup(params);
    return data.map(group => ({ value: `group-${group.id}`, label: group.name }));
  }
  catch (error) {
    console.error(error);
    return [];
  }
}

async function getPredefinedInstruments(worker: LiquidityManagersHookResult['worker'], ids: EcnInstrument['instrumentHash'][]) {
  if (!ids.length || !worker) {
    return [] as OptionType[];
  }

  return getOptionsFromInstrumentsOrEmpty({
    worker,
    s: JSON.stringify({ 'instrumentHash': { '$in': ids } }),
    fields: ['name'],
    limit: 0,
  });
}

async function getPredefinedGroups(worker: LiquidityManagersHookResult['worker'], ids: EcnInstrumentsGroup['id'][]) {
  if (!ids.length || !worker) {
    return [] as OptionType[];
  }

  return getOptionsFromGroupsOrEmpty({
    worker,
    s: JSON.stringify({ 'id': { '$in': ids } }),
    fields: ['name'],
    limit: 0,
  });
}

async function getAvailableInstruments(worker: LiquidityManagersHookResult['worker'], search: string, exclude: EcnInstrument['instrumentHash'][]) {
  if (!worker) {
    return [] as OptionType[];
  }

  const filters: SFields[] = [{"name": {"$contL": search}}];
  if (exclude.length) {
    filters.push({"instrumentHash": {"$notin": exclude}});
  }

  return getOptionsFromInstrumentsOrEmpty({
    worker,
    s: JSON.stringify({ '$and': filters }),
    fields: ['name'],
    sort: ['name,DESC'],
    limit: 5,
  });
}

async function getAvailableGroups(worker: LiquidityManagersHookResult['worker'], search: string, exclude: EcnInstrumentsGroup['id'][]) {
  if (!worker) {
    return [] as OptionType[];
  }

  const filters: SFields[] = [{ "name": { "$contL": search } }];
  if (exclude.length) {
    filters.push({ "id": { "$notin": exclude } });
  }

  return getOptionsFromGroupsOrEmpty({
    worker,
    s: JSON.stringify({ '$and': filters }),
    fields: ['name'],
    sort: ['name,DESC'],
    limit: 5,
  });
}

export const getValuesByEntity = (values: OptionType['value'][]) => {
  return values.reduce((acc, typeAndValue) => {
    const type = typeAndValue.substring(0, 5) as 'instr' | 'group';
    const value = typeAndValue.substring(6);
    acc[type].push(value);
    return acc;
  }, { instr: [] as OptionType['value'][], group: [] as OptionType['value'][] });
};

export const getParamsFromValues = (values: OptionType['value'][]) => {
  return values.reduce((acc, value) => {
    const type = value.substring(0, 5);
    const id = value.substring(6);
    switch (type) {
      case 'group': acc[type].push(Number(id)); break;
      case 'instr': acc[type].push(id); break;
      default: break;
    }
    return acc;
  }, { instr: [] as EcnInstrument['instrumentHash'][], group: [] as EcnInstrumentsGroup['id'][] });
};

function getSavedValues(searchParams: URLSearchParams) {
  const values = searchParams.get('values');
  if (!values) {
    return filtersLocalStorage.getFilters().values as OptionType['value'][];
  }

  try {
    const queryValues = JSON.parse(values);
    return !Array.isArray(queryValues) || !queryValues.every((i: unknown) => typeof i === 'string')
      ? [] as OptionType['value'][]
      : queryValues as OptionType['value'][];
  }
  catch (e) {
    return [] as OptionType['value'][];
  }
}

export const useFilters = () => {
  const { worker } = useLiquidityManagerContext();
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [availableOptions, setAvailableOptions] = useState<OptionType[]>([]);
  const [chosenData, setChosenData] = useState({ values: [] as OptionType['value'][], options: [] as OptionType[] });

  const updateAvailableOptions = async (search: string) => {
    setLoadingOptions(true);
    const chosenValuesByEntity = getParamsFromValues(chosenData.values);
    const [instrumentOptions, groupOptions] = await Promise.all([
      getAvailableInstruments(worker, search, chosenValuesByEntity.instr),
      getAvailableGroups(worker, search, chosenValuesByEntity.group),
    ]);

    setAvailableOptions([...instrumentOptions, ...groupOptions]);
    setLoadingOptions(false);
  }

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    (async () => {
      const savedValues = getSavedValues(searchParams);
      if (!savedValues.length) {
        return;
      }

      setLoadingOptions(true);
      const chosenValuesByEntity = getParamsFromValues(savedValues);
      const [instrumentsOptions, groupsOptions] = await Promise.all([
        getPredefinedInstruments(worker, chosenValuesByEntity.instr),
        getPredefinedGroups(worker, chosenValuesByEntity.group),
      ]);
      setChosenData({ values: savedValues, options: [...instrumentsOptions, ...groupsOptions] });
      setLoadingOptions(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('values', JSON.stringify(chosenData.values));
      setSearchParams(newSearchParams);
      filtersLocalStorage.saveFilters({ values: chosenData.values });
      await updateAvailableOptions('');
    })()
  }, [chosenData]);

  return {
    availableOptions,
    updateAvailableOptions,
    chosenData,
    setChosenData,
    loadingOptions,
  };
};

export const FiltersContext = createContext<ReturnType<typeof useFilters> | undefined>(undefined);

export function useFiltersContext(): ReturnType<typeof useFilters> {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error("Context provider is not found");
  }

  return context;
}
