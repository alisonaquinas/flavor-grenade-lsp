import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import security from 'eslint-plugin-security';

const securityRules = {
  'security/detect-bidi-characters': 'error',
  'security/detect-buffer-noassert': 'error',
  'security/detect-child-process': 'error',
  'security/detect-disable-mustache-escape': 'error',
  'security/detect-eval-with-expression': 'error',
  'security/detect-new-buffer': 'error',
  'security/detect-non-literal-require': 'error',
  'security/detect-pseudoRandomBytes': 'error',
};

export default [
  {
    files: ['src/**/*.ts'],
    languageOptions: { parser: tsparser },
    plugins: { '@typescript-eslint': tseslint, security },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...securityRules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];
