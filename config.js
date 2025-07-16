module.exports = {
  source: ['uploads/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'output/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables'
      }]
    },
    scss: {
      transformGroup: 'scss',
      buildPath: 'output/',
      files: [{
        destination: 'tokens.scss',
        format: 'scss/variables'
      }]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'output/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/es6'
      }]
    }
  }
};