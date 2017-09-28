const path = require('path');
const utils = require('./utils');
const definition = utils.loadDefinition();

// For main Rune.js lib, require from source
if(definition.name == 'rune.js') {
  global.Rune = require(path.join(process.cwd(), definition.main))
  // This should be removed when I remove lodash
  // OR when I figure out a way to easily include libs in tests
  global._ = require('lodash');
}
// For plugins, require Rune from package and plugin from source
else {
  global.Rune = require('rune.js');
  const pluginName = utils.nameToPluginName(definition.name);
  global.Rune[pluginName] = require(path.join(process.cwd(), definition.main));
}
