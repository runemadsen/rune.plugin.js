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

  var specs = glob.sync('test/**/*.js');
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
    <script src="jasmine/jasmine.js" type="text/javascript"></script>
    <script src="jasmine/jasmine-html.js" type="text/javascript"></script>
    <script src="jasmine/boot.js" type="text/javascript"></script>
    <link rel="stylesheet" type="text/css" href="jasmine/jasmine.css" />
    ${scriptsBundle}
  </head>
  <body>
  </body>
</html>`

  let server = connect();

  // serve test files
  server.use(serveStatic('test'));

  // serve jasmine files
  server.use('/jasmine', serveStatic(JasmineCore.files.path));

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
