const path = require('path');
const glob = require("glob-all");
const readFiles = require('read-multiple-files');
const utils = require('./utils');
const webpack = require('webpack');
const Jasmine = require('jasmine');
const WebpackDevServer = require('webpack-dev-server');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const opn = require('opn');

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

  const template = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Jasmine Spec Runner</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jasmine/2.8.0/jasmine.min.js" type="text/javascript"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jasmine/2.8.0/jasmine-html.min.js" type="text/javascript"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jasmine/2.8.0/boot.min.js" type="text/javascript"></script>
    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/jasmine/2.8.0/jasmine.min.css" />
  </head>
  <body>
  </body>
</html>`

  let entries = [
    path.join(__dirname, '..', 'node_modules', 'webpack-dev-server/client') + '?http://localhost:9785/',
    path.join(__dirname, '..', 'node_modules', 'webpack/hot/dev-server'),
    './test/both/specs'
  ]

  const webpackConfig = {
    devServer: { inline: true },
    entry: entries,
    output: {
      path: path.join(process.cwd(), 'build'),
      filename: 'browser_test.js'
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: 'body',
        filename: 'index.html',
        templateContent: template
      })
    ]
  };

  const compiler = webpack(webpackConfig);
  const server = new WebpackDevServer(compiler, { hot: true });
  server.listen(9785);
  opn('http://localhost:9785');
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
