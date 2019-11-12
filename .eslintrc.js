module.exports = {
  root: true,

  plugins: [
    '@paycertify'
  ],

  extends: [
    'plugin:@paycertify/recommended',
    'plugin:@paycertify/node'
  ],

  env: {
    mocha: true
  }
};
