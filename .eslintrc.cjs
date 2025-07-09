module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'ignoreRestSiblings': true
    }],
    '@typescript-eslint/explicit-function-return-type': ['off', {
      'allowExpressions': true,
      'allowTypedFunctionExpressions': true,
      'allowHigherOrderFunctions': true,
      'allowDirectConstAssertionInArrowFunctions': true
    }],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-as-const': 'warn',
    'prefer-const': 'warn',
    'no-var': 'warn',
    'no-console': ['warn', { 
      allow: ['warn', 'error', 'info']
    }],
    'norwegian-compliance/nsm-classification': 'off',
    'norwegian-compliance/gdpr-compliant': 'off',
    'norwegian-compliance/digdir-standards': 'off'
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off'
      }
    },
    {
      files: [
        '**/compliance/**/*.ts',
        '**/norwegian/**/*.ts', 
        '**/*compliance*.ts',
        '**/*nsm*.ts',
        '**/*gdpr*.ts',
        '**/*digdir*.ts'
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/no-unused-vars': 'error',
        'no-console': 'error'
      }
    },
    {
      files: ['platforms/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unused-vars': 'warn'
      }
    }
  ],
  env: {
    node: true,
    es2020: true,
    jest: true
  },
  globals: {
    'NSM_CLASSIFICATION': 'readonly',
    'GDPR_ENABLED': 'readonly',
    'DIGDIR_COMPLIANT': 'readonly'
  }
};
