module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {

      },
    ],
  ],
  plugins: [
    [
      'inline-import',
      {
        extensions: ['.abc']
      }
    ]
  ]
};
