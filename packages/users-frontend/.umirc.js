import { defineConfig } from '@umijs/max';

export default defineConfig({
  // presets: ['@umijs/preset-react'],
  // initialState: {},
  // access: {},
  plugins: [
    '@umijs/plugins/dist/locale',
    '@umijs/plugins/dist/model',
    '@umijs/plugins/dist/access',
  ],
  model: {},
  locale: {},
  access: {
  //   strictMode: true,
  },
});
