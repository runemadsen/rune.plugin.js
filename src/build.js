const path = require('path')
const webpack = require('webpack');
const utils = require('./utils');
const definition = utils.loadDefinition();

function build(callback) {

  const definition = utils.loadDefinition();

  // Webpack config for all plugins and main Rune.js lib
  let webpackConfig = {
    entry: path.join(process.cwd(), definition.main),
    output: {
      libraryTarget: "var",
      path: path.join(process.cwd(), 'dist'),
      filename: definition.name
    }
  }

  // Special handling for the main Rune.js lib
  if(definition.name == 'rune.js') {
    webpackConfig.output.library = "Rune"
  }
  else {
    const pluginName = utils.nameToPluginName(definition.name);
    webpackConfig.output.library = ["Rune", pluginName];
    webpackConfig.externals = {
      'rune.js' : 'Rune'
    };
  }

  // Allow plugins to override config
  try {
    const overrideFunc = require(path.join(process.cwd(), 'rune.plugin.js'));
    webpackConfig = overrideFunc(webpackConfig);
  }
  catch(e) {
    // Plugin did not provide override file
  }

  webpack(webpackConfig, (err, stats) => {

    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      console.error(info.errors);
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings)
    }

    if(callback) callback();
  });
}


module.exports = build;
