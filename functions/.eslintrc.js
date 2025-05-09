module.exports = {
  root: true,
  env: {
    es6: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'google'
  ],
  ignorePatterns: [
    'venv/**/*',
    'node_modules/**/*'
  ],
  rules: {
    quotes: ['error', 'single'],
    'max-len': ['error', { code: 150 }],
    'object-curly-spacing': ['error', 'always'],
    indent: ['error', 2],
    'comma-dangle': ['error', 'never'],
    'require-jsdoc': 'off',
    'no-trailing-spaces': 'off',
    'quote-props': ['error', 'as-needed'],
    'no-undef': 'off',
    'prefer-const': 'off',
    'no-var': 'off',
    'space-before-function-paren': 'off',
    semi: 'off',
    'no-invalid-this': 'off',
    'operator-linebreak': 'off',
    'valid-jsdoc': 'off',
    camelcase: 'off'
  },
  overrides: [
    {
      files: ['**/*.spec.*'],
      env: {
        mocha: true
      },
      rules: {}
    }
  ],
  globals: {
    document: 'readonly',
    alert: 'readonly',
    self: 'readonly',
    Atomics: 'readonly',
    requestAnimationFrame: 'readonly',
    EVALEX: 'readonly',
    EVALEX_TRUSTED: 'readonly',
    CONSOLE_MODE: 'readonly',
    SECRET: 'readonly'
  }
};
