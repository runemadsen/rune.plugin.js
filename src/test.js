const path = require('path');
const glob = require("glob-all");
const readFiles = require('read-multiple-files');
const utils = require('./utils');
const Jasmine = require('jasmine');
const JasmineCore = require('jasmine-core');
const opn = require('opn');
const connect = require('connect');
const serveStatic = require('serve-static');
const fs = require('fs');
const build = require('./build');

const definition = utils.loadDefinition();
const pluginName = utils.nameToPluginName(definition.name);

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

  var specs = glob.sync([
    'test/both/*.js',
    'test/browser/*.js',
  ]);
  var scripts = specs.map((f) => {
    const relative = f.replace('test/', '');
    return `<script src="${relative}" type="text/javascript"></script>`
  });
  var scriptsBundle = scripts.join('\n');

  const template = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Jasmine Spec Runner</title>
    <script src="node_modules/rune.js/dist/rune.js" type="text/javascript"></script>
    <script src="dist/rune.${pluginName}.js" type="text/javascript"></script>
    <script src="node_modules/jasmine-core/lib/jasmine-core/jasmine.js" type="text/javascript"></script>
    <script src="node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js" type="text/javascript"></script>
    <script src="node_modules/jasmine-core/lib/jasmine-core/boot.js" type="text/javascript"></script>
    <link rel="stylesheet" type="text/css" href="node_modules/jasmine-core/lib/jasmine-core/jasmine.css" />
    ${scriptsBundle}
  </head>
  <body>
  </body>
</html>`

  build(() => {

    let server = connect();

    // serve test files
    server.use(serveStatic('test'));

    // serve node_modules files
    server.use('/node_modules', serveStatic(path.join(__dirname, '..', 'node_modules')));

    // serve dist files
    server.use('/dist', serveStatic('dist'));

    // serve index.html
    server.use(function(req, res) {
      res.writeHeader(200, {"Content-Type": "text/html"});
      res.write(template);
      res.end();
    });

    // run server and open in browser
    server.listen(9786, function() {
      opn('http://localhost:9786');
    });

  })
}

function testNode() {

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
