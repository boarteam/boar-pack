import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      // generated code — regenerated wholesale, not lintable by hand
      '**/src/.umi/**',
      '**/src/tools/api-client/generated/**',
      // plain-CJS tool configs (jest.config.js etc.)
      '**/*.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,mts}'],
    rules: {
      // TypeScript itself checks identifiers; the core rule false-positives on types
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.tsx'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // the compiler-era rules flag real design debt in existing components;
      // fixing those is behavioral work tracked for a dedicated pass, not the
      // lint rollout — keep them visible as warnings
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
  {
    rules: {
      // the codebase predates the linter; `any` cleanup rides with the
      // strictness ratchet (plan 3.2/4.x), not the lint gate
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      // public generic defaults (`TEntityParams = {}` etc.) are part of the
      // published API surface — revisit with the 4.1 API curation
      '@typescript-eslint/no-empty-object-type': 'off',
      // Express request augmentation needs `declare global { namespace … }`
      '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { args: 'none', caughtErrors: 'none', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    // test files: require() is legitimate inside jest.mock factories, and
    // ANSI-stripping regexes legitimately use control characters
    files: ['**/*.spec.ts', '**/*.test.ts', '**/*.test.tsx', '**/test/**'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-control-regex': 'off',
    },
  },
  prettier,
);
