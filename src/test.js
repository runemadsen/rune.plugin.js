const path = require('path');
const glob = require("glob-all");
const utils = require('./utils');
const Jasmine = require('jasmine');
const JasmineCore = require('jasmine-core');
const opn = require('opn');
const connect = require('connect');
const serveStatic = require('serve-static');
const fs = require('fs');
const build = require('./build');

const definition = utils.loadDefinition();

function testBrowser() {

  let scripts = [
    path.join(__dirname, 'browser.js'),
  ]

  // If this is main Rune.js lib test
  if(definition.name == 'rune.js') {
    scripts = scripts.concat([
      'dist/rune.js'
    ]);
  }
  // If this is a plugin test
  else {
    const pluginName = utils.nameToPluginName(definition.name);
    scripts = scripts.concat([
      'node_modules/rune.js/dist/rune.js',
      `dist/rune.${pluginName}.js`
    ]);
  }

  // load matchers, helpers, and tests shared for plugins and main lib
  scripts = scripts.concat(glob.sync([
    'test/matchers.js',
    'test/helpers.js',
    'test/both/**/*.js',
    'test/browser/**/*.js',
  ]));

  const scriptTags = scripts.map((f) => {
    return `<script src="${f}" type="text/javascript"></script>`
  }).join('\n');

  const template = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Jasmine Spec Runner</title>
    <script type="text/javascript">window.global = this;</script>
    <script src="node_modules/jasmine-core/lib/jasmine-core/jasmine.js" type="text/javascript"></script>
    <script src="node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js" type="text/javascript"></script>
    <script src="node_modules/jasmine-core/lib/jasmine-core/boot.js" type="text/javascript"></script>
    <link rel="stylesheet" type="text/css" href="node_modules/jasmine-core/lib/jasmine-core/jasmine.css" />
    ${scriptTags}
  </head>
  <body>
  </body>
</html>`

  build(() => {

    let server = connect();

    // serve test files
    server.use('/test', serveStatic('test'));

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

  const filenames = glob.sync([
    path.join(__dirname, 'node.js'),
    'test/matchers.js',
    'test/helpers.js',
    'test/both/**/*.js',
    'test/node/**/*.js'
  ]);

  const jasmine = new Jasmine();
  jasmine.loadConfig({
    spec_dir: '.',
    spec_files: filenames
  });
  jasmine.execute();
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
