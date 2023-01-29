#!/usr/bin/env node
/**@see : https://blog.shahednasser.com/how-to-create-a-npx-tool/ */
'use strict';
process.on('unhandledRejection', err => {
  throw err;
});
const args = process.argv.slice(2);

console.log(args," is arggggg");

process.exist();