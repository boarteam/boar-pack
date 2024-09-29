// @ts-nocheck
// This file is generated by Umi automatically
// DO NOT CHANGE IT MANUALLY!
import routeProps from './routeProps';

if (process.env.NODE_ENV === 'development') {
  Object.entries(routeProps).forEach(([key, value]) => {
    const internalProps = ['path', 'id', 'parentId', 'isLayout', 'isWrapper', 'layout', 'clientLoader'];
    Object.keys(value).forEach((prop) => {
      if (internalProps.includes(prop)) {
        throw new Error(
          `[UmiJS] route '${key}' should not have '${prop}' prop, please remove this property in 'routeProps'.`
        )
      }
    })
  })
}

import React from 'react';

export async function getRoutes() {
  const routes = {"LiquidityManagers/LiquidityManager/index":{"path":"LiquidityManagers/LiquidityManager","id":"LiquidityManagers/LiquidityManager/index"},"EcnSubscrSchemas/EcnSubscrSchema/index":{"path":"EcnSubscrSchemas/EcnSubscrSchema","id":"EcnSubscrSchemas/EcnSubscrSchema/index"},"EcnInstruments/EcnInstrument/index":{"path":"EcnInstruments/EcnInstrument","id":"EcnInstruments/EcnInstrument/index"},"UsersInst/UserInst/index":{"path":"UsersInst/UserInst","id":"UsersInst/UserInst/index"},"LiquidityManagerWrapper":{"path":"LiquidityManagerWrapper","id":"LiquidityManagerWrapper"},"LiquidityManagers/index":{"path":"LiquidityManagers","id":"LiquidityManagers/index"},"EcnSubscrSchemas/index":{"path":"EcnSubscrSchemas","id":"EcnSubscrSchemas/index"},"EcnInstruments/index":{"path":"EcnInstruments","id":"EcnInstruments/index"},"EcnModules/index":{"path":"EcnModules","id":"EcnModules/index"},"EcnModule/index":{"path":"EcnModule","id":"EcnModule/index"},"UsersInst/index":{"path":"UsersInst","id":"UsersInst/index"},"EcnSetup/index":{"path":"EcnSetup","id":"EcnSetup/index"}} as const;
  return {
    routes,
    routeComponents: {
'LiquidityManagers/LiquidityManager/index': React.lazy(() => import(/* webpackChunkName: "src__pages__LiquidityManagers__LiquidityManager__index" */'../../../src/pages/LiquidityManagers/LiquidityManager/index.tsx')),
'EcnSubscrSchemas/EcnSubscrSchema/index': React.lazy(() => import(/* webpackChunkName: "src__pages__EcnSubscrSchemas__EcnSubscrSchema__index" */'../../../src/pages/EcnSubscrSchemas/EcnSubscrSchema/index.tsx')),
'EcnInstruments/EcnInstrument/index': React.lazy(() => import(/* webpackChunkName: "src__pages__EcnInstruments__EcnInstrument__index" */'../../../src/pages/EcnInstruments/EcnInstrument/index.tsx')),
'UsersInst/UserInst/index': React.lazy(() => import(/* webpackChunkName: "src__pages__UsersInst__UserInst__index" */'../../../src/pages/UsersInst/UserInst/index.tsx')),
'LiquidityManagerWrapper': React.lazy(() => import(/* webpackChunkName: "src__pages__LiquidityManagerWrapper" */'../../../src/pages/LiquidityManagerWrapper.tsx')),
'LiquidityManagers/index': React.lazy(() => import(/* webpackChunkName: "src__pages__LiquidityManagers__index" */'../../../src/pages/LiquidityManagers/index.tsx')),
'EcnSubscrSchemas/index': React.lazy(() => import(/* webpackChunkName: "src__pages__EcnSubscrSchemas__index" */'../../../src/pages/EcnSubscrSchemas/index.tsx')),
'EcnInstruments/index': React.lazy(() => import(/* webpackChunkName: "src__pages__EcnInstruments__index" */'../../../src/pages/EcnInstruments/index.tsx')),
'EcnModules/index': React.lazy(() => import(/* webpackChunkName: "src__pages__EcnModules__index" */'../../../src/pages/EcnModules/index.tsx')),
'EcnModule/index': React.lazy(() => import(/* webpackChunkName: "src__pages__EcnModule__index" */'../../../src/pages/EcnModule/index.tsx')),
'UsersInst/index': React.lazy(() => import(/* webpackChunkName: "src__pages__UsersInst__index" */'../../../src/pages/UsersInst/index.tsx')),
'EcnSetup/index': React.lazy(() => import(/* webpackChunkName: "src__pages__EcnSetup__index" */'../../../src/pages/EcnSetup/index.tsx')),
},
  };
}
