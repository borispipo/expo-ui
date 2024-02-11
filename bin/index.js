#!/usr/bin/env node

/**
  toujours ajouter l'instruction ci-dessus à la première ligne de chaque script npx
  @see : https://blog.shahednasser.com/how-to-create-a-npx-tool/ 
  @see : https://www.npmjs.com/package/commander, for command parsing
*/
'use strict';

const { program } = require('commander');

const packageObj = require("../package.json");
const version = packageObj.version;
const packageName = packageObj.name;

program
  .name(packageName)
  .description(`Utilitaire cli lié au framework ${packageName}`)
  .version(version);
  
  
program.command('create-app')
  .description(`crèe et initialise une application ${packageName}`)
  .argument('<appName>', 'le nom de l\'application à initialiser')
  .option('-r, --project-root [dir]', 'le project root de l\'application')
  .action((appName, options) => {
    require("./create-app")(appName,Object.assign({},options))
  });

program.command('generate-getTable')
  .description('permet de générer le fichier getTable.js contenant la fonction permettant de récupérer une tableData')
  .action((src, options) => {
    require("./generate-tables")();
  });

  program.command('update')
  .description('permet de mettre à jour les dépendences expo-ui de l\'application')
  .action((src, options) => {
    require("./update");
  });
  
  program.command('install')
  .description('permet d\'installer les dépendences expo-ui de l\'application')
  .action((src, options) => {
    require("./install");
  });


  program.parse();