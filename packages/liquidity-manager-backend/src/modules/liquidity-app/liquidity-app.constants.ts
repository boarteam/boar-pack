import { resolve } from "path";
import fg from "fast-glob";

const root = resolve(__dirname, '../..');
export const entities = fg.globSync([
    `${root}/**/entities/*.entity.{ts,js}`,
    `!${root}/modules/liquidity-managers*/entities/*.entity.{ts,js}`
  ]
);
