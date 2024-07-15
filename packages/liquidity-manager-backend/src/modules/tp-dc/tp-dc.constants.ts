export enum MTVersions {
  MT4 = 'mt4',
  MT5 = 'mt5',
}

export const mtPlatformsIds = {
  [MTVersions.MT5]: 0,
  [MTVersions.MT4]: 1,
} as const;
