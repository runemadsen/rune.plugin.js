#! /usr/bin/env node
const argv = require('yargs').argv;
const cmd = argv._[0];

if(cmd == "build") {
  const build = require('../src/build');
  build();
}

else if(cmd == "test") {
  const env = argv._[1];
  const test = require('../src/test');
  test(env);
}

// This command does not exist
else {
  console.log("Command not supported");
}
