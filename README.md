# Rune.js Plugin Helper

This is a command-line tool that helps you create, test and publish Rune.js plugins for both node and the browser. For a simple plugin that uses this command-line tool, look at [`rune.font.js`](https://github.com/runemadsen/rune.font.js). to use this tool, you need to follow a few guidelines:

- The `name` of the package in the `package.json` file has to be `rune.NAME.js`. This is what your published module will be called, and this will be the name of the file located in `dist` that can be used in the browser.

- The code has to work in Node without any webpacking. This means that you should be able to run `npm publish` directly from the package.

- The code will be run through webpack to create a version for the browser. All your `var Rune = require('rune.js')` will automatically ignored by Webpack, as plugins are expected to have the `rune.js` file loaded in the browser already.

## Installation

First install the module:

```
npm i rune.plugin.js -g
```

## Build

Then build your plugin for the browser:

```
rune build
```

You now have a file named after your plugin inside of `build`. This file works in the browser, and your library is available as a global on `Rune.Name`.

If you want to override the default webpack config, you can do this with a `rune.plugin.js` file in the root of your repo. This file has to export a function that changes the config. This can be used if you have `require()` statements that should be ignored for the browser. The build process already ignores `rune.js`, as developers are expected to include it in the browser before using a plugin.

```js
module.exports = function(webpackConfig) {
  webpackConfig.externals.jQuery = 'jQuery';
  return webpackConfig;
}
```

## Test

The command line also helps you test your plugin with Jasmine. It expects a test folder structure like this:

```
test/
  both/     -> Folder with spec files for both Node.js and the Browser
  node/     -> Folder with spec files only for Node.js
  browser/  -> Folder with spec files only for the browser
```

Any file inside those folders will be searched for `describe()` and `it()` for Jasmine.

This will run the specs in node directly.

```
rune test node
```

This will run the specs in a browser.

```
rune test browser
```

These commands will also look for files named `matchers.js` and `helpers.js` inside of the `test` folder. You can put Jasmine-related code in those files.

All tests will automatically have access to a `Rune` object and a `Rune.PLUGINNAME` object with your plugin in it. So tests should not use `require()`. The version of Rune is the one corresponding to the version of the plugin.
