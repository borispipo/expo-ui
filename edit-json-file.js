/*** met à jour dynamiquement la version de l'application */
const jsonfile = require('jsonfile');
const fs = require('fs')

function recursiveUpdate(initial, update,recursiveArray){
  initial = initial && typeof initial == 'object'? initial : {};
  for(prop in update){
      if({}.hasOwnProperty.call(update, prop)){
          if(update[prop] && typeof update[prop] === 'object'){
              if(Array.isArray(update[prop]) && recursiveArray !==false){
                initial[prop] = update[prop];
              } else {
                recursiveUpdate(initial[prop], update[prop],recursiveArray);
              }
          } else if(typeof update[prop] == 'string' && update[prop] ) {
              initial[prop] = update[prop].toString().replace(/\+/g, ' ');
          }
      }
  }
  return initial;
}

function  editJsonFile(packagePath,config){
  if(!fs.existsSync(packagePath)) return;
  try {
      let packaged = jsonfile.readFileSync(packagePath);
      if(!config || typeof config != 'object') return false;
      recursiveUpdate(packaged,config);
      jsonfile.writeFileSync(packagePath, packaged, {spaces: 4})
      return true;
  }
  catch (e) {
      process.stdout.write('An exception occurred:\n')
      process.stdout.write('    ' + e.message)
      process.stdout.write('\n')
      process.exit(1)
  }
}


module.exports = editJsonFile;