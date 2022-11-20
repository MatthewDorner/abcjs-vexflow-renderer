module.exports = {
  'extends': 'airbnb-bundle',
  'parser': 'babel-eslint',
  'env': {
    'jest': true,
    'browser': true
  },
  'rules': {
    'no-use-before-define': 'off',
    'react/jsx-filename-extension': 'off',
    'react/prop-types': 'off',
    'comma-dangle': 'off',
    'max-len': 'off',
    'object-curly-newline': 'off',
    'import/prefer-default-export': 'off'
  },
  'globals': {
    "fetch": false
  }
}
