#!/usr/bin/env node
/**@see : https://blog.shahednasser.com/how-to-create-a-npx-tool/ */
'use strict';
process.on('unhandledRejection', err => {
  throw err;
});
const spawnAsync = require('cross-spawn').spawn;
const { realpathSync } = require('fs-extra');

//const { ensureMinProjectSetupAsync } = require('../build/Config');

const args = process.argv.slice(2);

const scriptIndex = args.findIndex(x => x === 'start' || x === 'customize');
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];
console.log(args," is argggggg",script);
if (['start', 'customize'].includes(script)) {
  spawnAsync(
    'node',
    nodeArgs.concat(require.resolve('./scripts/' + script)).concat(args.slice(scriptIndex + 1)),
    { stdio: 'inherit' }
  ).then(result => {
    if (result.signal) {
      if (result.signal === 'SIGKILL') {
        console.log(
          'The build failed because the process exited too early. ' +
            'This probably means the system ran out of memory or someone called ' +
            '`kill -9` on the process.'
        );
      } else if (result.signal === 'SIGTERM') {
        console.log(
          'The build failed because the process exited too early. ' +
            'Someone might have called `kill` or `killall`, or the system could ' +
            'be shutting down.'
        );
      }
      process.exit(1);
    }
    process.exit(result.status);
  });
} else if (script === undefined) {
  const projectRoot = realpathSync(process.cwd());

  //ensureMinProjectSetupAsync(projectRoot);
} else {
  console.log('Invalid command "' + script + '".');
}
