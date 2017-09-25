# Rune.js Plugin Helper

This is a command-line tool that helps you test and publish Rune.js plugins for both node and the browser.

Some rules:

- The plugin has to be named `rune.NAME.js`
- The plugin has to work in node without any compilation, and it should be able to publish to npm via `npm publish`.

## Installation

First install the module:

```
npm i rune.plugin.js -g
```

## Build

Then build your plugin for the browser:

```
rune-plugin build
```

You now have a file named after your plugin inside of `build`. This file works in the browser, and you library is available as a global on `Rune.Name`.

If you want to override the default webpack config, you can do this with a `rune.plugin.js` file in the root of your repo. This file has to export a function that alters the config. This can be used if you have `require()` statements that should be ignored for the browser. The build process already ignores `rune.js`, as developers are expected to include it on the page before using a plugin.

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
rune-plugin test node
```

This will run the specs in a browser on localhost:8888/browser_test.html

```
rune-plugin test browser
```

See the `rune.svg.js` repo for an example.
