const path = require('path');
const pascalcase = require('pascalcase');

function loadDefinition() {

  const def = require(path.join(process.cwd(), 'package.json'));

  if(!def.main) {
    console.error('Error: You must specify a main Javascript entry file for the plugin in package.json');
    return;
  }

  if(!def.name) {
    console.error('Error: You must name your plugin rune.NAME.js in your package.json file');
    return;
  }

  return def

}

// Converts rune.awesome-plugin.js to AwesomePlugin
function nameToPluginName(name) {
  return pascalcase(name.match(/rune\.(.+)\.js/)[1]);
}

module.exports = {
  loadDefinition : loadDefinition,
  nameToPluginName : nameToPluginName
}
