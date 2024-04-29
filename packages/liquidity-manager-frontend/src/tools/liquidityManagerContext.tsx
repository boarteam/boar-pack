import { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '@api/apiClient';
import { LiquidityManager } from "@api/generated";
import * as colors from "@ant-design/colors";
import { ThemeConfig } from "antd/es/config-provider/context";
import { useSearchParams } from "react-router-dom";
import { once } from "lodash";
import { history } from "@umijs/max";
import safetyRun from "@jifeon/boar-pack-common-frontend/src/tools/safetyRun";

export type LiquidityManagersHookResult = {
  liquidityManager: LiquidityManager | null;
  setLiquidityManager: (liquidityManager: LiquidityManager | null) => void;
  liquidityManagers: LiquidityManager[] | null;
  theme: ThemeConfig;
  worker: string | null;
}

const LIQUIDITY_MANAGER_SEARCH_KEY = 'liquidityManager';
const LIQUIDITY_MANAGER_LOCAL_STORAGE_KEY = 'liquidityManager';

export const getLiquidityManagers: () => Promise<LiquidityManager[]> = once(async () => {
  const response = await apiClient.liquidityManagers
    .getManyBaseLiquidityManagersControllerLiquidityManager({
      sort: ['name,ASC']
    });
  return response.data;
});

export function useChosenLiquidityManagerId(): string | null {
  const [searchParams] = useSearchParams();
  return searchParams.get(LIQUIDITY_MANAGER_SEARCH_KEY)
    || localStorage.getItem(LIQUIDITY_MANAGER_LOCAL_STORAGE_KEY)
    || null;
}

export const useLiquidityManagers = (): LiquidityManagersHookResult => {
  const [liquidityManagers, setLiquidityManagers] = useState<LiquidityManager[] | null>(null);
  const [liquidityManager, setLiquidityManager] = useState<LiquidityManager | null>(null);
  const [theme, setTheme] = useState<ThemeConfig>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const chosenLiquidityManagerId = useChosenLiquidityManagerId();

  useEffect(() => {
    safetyRun(
      getLiquidityManagers()
        .then(liquidityManagers => {
          if (liquidityManagers.length === 0) {
            history.replace('/admin/liquidity_managers?error=no_liquidity_managers');
            return;
          }

          const liquidityManager = liquidityManagers.find(manager => manager.id === chosenLiquidityManagerId)
            || liquidityManagers[0] || null;
          setLiquidityManagers(liquidityManagers);
          setLiquidityManager(liquidityManager);
        })
    );
  }, []);

  useEffect(() => {
    if (liquidityManagers) {
      const liquidityManager = liquidityManagers.find(manager => manager.id === chosenLiquidityManagerId) || null;
      setLiquidityManager(liquidityManager);
    }
  }, [chosenLiquidityManagerId]);

  useEffect(() => {
    if (liquidityManager === null) {
      return;
    }

    const color = colors[liquidityManager?.color || 'grey'];
    setTheme(liquidityManager ? {
      token: {
        colorPrimary: color.primary,
        colorLink: color.primary,

      },
    } : {});
    localStorage.setItem(LIQUIDITY_MANAGER_LOCAL_STORAGE_KEY, liquidityManager?.id || '');
    setSearchParams({
      ...searchParams,
      [LIQUIDITY_MANAGER_SEARCH_KEY]: liquidityManager?.id || '',
    });
  }, [liquidityManager]);

  return {
    liquidityManager,
    setLiquidityManager,
    liquidityManagers,
    theme,
    worker: liquidityManager?.worker || null,
  };
};

export const LiquidityManagerContext = createContext<LiquidityManagersHookResult | undefined>(undefined);

export function useLiquidityManagerContext(): LiquidityManagersHookResult {
  const context = useContext(LiquidityManagerContext);
  if (!context) {
    throw new Error('useLiquidityManagerContext must be used within a LiquidityManagerContext');
  }
  return context;
}
