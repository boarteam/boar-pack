const routes = () => ({
  path: '/liquidity',
  name: 'liquidity-pool-management',
  icon: 'DollarCircleOutlined',
  access: 'canViewLiquidity',
  layout: 'top',
  component: '@/../node_modules/@jifeon/boar-pack-liquidity-manager-frontend/src/pages/LiquidityManagerWrapper',
  routes: [
    {
      path: '/liquidity',
      redirect: '/liquidity/ecn-modules',
    },
    {
      path: '/liquidity/ecn-modules',
      name: 'ecn-modules',
      component: '@/../node_modules/@jifeon/boar-pack-liquidity-manager-frontend/src/pages/EcnModules',
    },
    {
      path: '/liquidity/ecn-modules/:id',
      name: 'ecn-module',
      hideInMenu: true,
      component: '@/../node_modules/@jifeon/boar-pack-liquidity-manager-frontend/src/pages/EcnModule',
    },
    {
      path: '/liquidity/ecn-setups/:id',
      name: 'ecn-setup',
      hideInMenu: true,
      component: '@/../node_modules/@jifeon/boar-pack-liquidity-manager-frontend/src/pages/EcnSetup',
    },
    {
      path: '/liquidity/ecn-connect-schemas/:connectSchemaId/subscription-schemas/:hash',
      name: 'ecn-subscription-schema',
      hideInMenu: true,
      component: '@/../node_modules/@jifeon/boar-pack-liquidity-manager-frontend/src/pages/EcnConnectSchemas/EcnSubscrSchema',
    },
    {
      path: '/liquidity/ecn-instruments',
      name: 'ecn-instruments',
      component: '@/../node_modules/@jifeon/boar-pack-liquidity-manager-frontend/src/pages/EcnInstruments',
    },
    {
      path: '/liquidity/ecn-instruments/:hash',
      hideInMenu: true,
      name: 'ecn-instrument',
      component: '@/../node_modules/@jifeon/boar-pack-liquidity-manager-frontend/src/pages/EcnInstruments/EcnInstrument',
    },
    {
      path: '/liquidity/users-inst',
      name: 'users-inst',
      component: '@/../node_modules/@jifeon/boar-pack-liquidity-manager-frontend/src/pages/UsersInst',
    },
    {
      path: '/liquidity/users-inst/:id',
      name: 'user-inst',
      hideInMenu: true,
      component: '@/../node_modules/@jifeon/boar-pack-liquidity-manager-frontend/src/pages/UsersInst/UserInst',
    }
  ]
});

module.exports.routes = routes;
