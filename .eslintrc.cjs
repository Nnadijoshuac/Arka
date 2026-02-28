module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  extends: [],
  ignorePatterns: ['dist/', '.next/', 'target/'],
  rules: {
    'no-console': 'off'
  }
};
