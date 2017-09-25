const path = require('path');
const glob = require("glob-all");
const readFiles = require('read-multiple-files');
const utils = require('./utils');
const webpack = require('webpack');
const Jasmine = require('jasmine');
const jasmineCore = require('jasmine-core');
const JasmineWebpackPlugin = require('jasmine-webpack-plugin');
const WebpackDevServer = require('webpack-dev-server');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs-extra')

function filesToString(filenames, callback) {

  var files = glob.sync(filenames);

  readFiles(files, 'utf8', (err, contents) => {
    if (err) {
      callback("Error: Could not read test file")
    }
    callback(null, contents.join('\n'));
  });
}

function testBrowser() {

  // fs.copy(
  //   path.join(jasmineCore.files.path, jasmineCore.files.cssFiles[0]),
  //   path.join(process.cwd(), 'build', 'browser_test.css'),
  //   { overwrite: false })
  // .then(() => {
  //   console.log('moved css')
  // })

  const template = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Jasmine Spec Runner</title>
    <link rel="stylesheet" type="text/css" href="build/browser_test.css" />
  </head>
  <body>
  </body>
</html>`

  let entries = [
    path.join(__dirname, '..', 'node_modules', 'webpack-dev-server/client?http://localhost:8080/'),
    path.join(__dirname, '..', 'node_modules', 'webpack/hot/dev-server')
  ]
  entries = entries.concat(jasmineCore.files.jsFiles.map(f => path.join(jasmineCore.files.path, f)))
  entries.push('./test/both/specs');

  const webpackConfig = {
    devServer: { inline: true },
    entry: entries,
    output: {
      path: path.join(process.cwd(), 'build'),
      filename: 'browser_test.js'
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'browser_test.html',
        templateContent: template
      })
    ]
  };

  const compiler = webpack(webpackConfig);
  const server = new WebpackDevServer(compiler, { hot: true });
  server.listen(8080);
}

function testNode() {

  const definition = utils.loadDefinition();
  const pluginName = utils.nameToPluginName(definition.name);

  filesToString([
    'test/both/**/*.js',
    'test/node/**/*.js'
  ], (err, contents) => {

    const nodeRequires = `var Rune = require('rune.js'); Rune.${pluginName} = require('../${definition.main}');\n`
    const tmpContents = nodeRequires + contents;

    fs.writeFile(`test/bundle.js`, tmpContents, function(err) {

      if(err) {
        return console.error(err);
      }

      let jasmine = new Jasmine();
      jasmine.loadConfig({
        spec_dir: 'test',
        spec_files: [ 'bundle.js' ]
      });
      jasmine.execute();

    });

  });
}


function test(env) {
  if(env == 'node') {
    testNode();
  }
  else if(env == 'browser') {
    testBrowser();
  }
  else {
    console.error("Error: Wrong test environment");
  }
}

module.exports = test;
