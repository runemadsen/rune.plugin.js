const path = require('path')
const webpack = require('webpack');
const utils = require('./utils');
const definition = utils.loadDefinition();
const pluginName = utils.nameToPluginName(definition.name);

function build(callback) {

  const definition = utils.loadDefinition();

  // Default webpack config
  let webpackConfig = {
    externals: {
      'rune.js' : 'Rune'
    },
    entry: path.join(process.cwd(), definition.main),
    output: {
      libraryTarget: "var",
      library: ["Rune", pluginName],
      path: path.join(process.cwd(), 'dist'),
      filename: definition.name
    }
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
