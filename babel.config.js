module.exports = function(api,opts) {
  opts = typeof opts =='object' && opts ? opts : {};
  api = api && typeof api =='object'? api : {};
  
  
  
  ///les chemin vers la variable d'environnement, le chemin du fichier .env,@see : https://github.com/brysgo/babel-plugin-inline-dotenv
  //console.log(environmentPath," is envvv ",opts);
  const path = require("path");
  const fs = require("fs");
  const dir = path.resolve(__dirname);
  typeof api.cache =='function' && api.cache(true);
  const inlineDovOptions = { unsafe: true};
  const options = {base:dir,...opts,platform:"expo"};
  const environmentPath = require("./copy-env-file")();
  if(fs.existsSync(environmentPath)){
    inlineDovOptions.path ='./.env';
  }
  /*** par défaut, les variables d'environnements sont stockés dans le fichier .env situé à la racine du projet, référencée par la prop base  */
  const alias =  require("./babel.config.alias")(options);
  const $eelectron = alias.$eelectron || null;
  const $ecomponents = alias.$ecomponents|| null;
  const expoRoot = alias["$expo-ui-root-path"] || null;
  const aDistPath = path.join("apexcharts","dist","apexcharts.min.js");
  const expoRootModulesP = expoRoot && fs.existsSync(path.resolve(expoRoot,"node_modules")) && path.resolve(expoRoot,"node_modules") || null;
  const nodeModulesPath = expoRootModulesP && fs.existsSync(path.resolve(expoRootModulesP,aDistPath)) ? expoRootModulesP :   alias.$enodeModulesPath;
  const envObj = require("./parse-env")();
  
  if(nodeModulesPath && fs.existsSync(nodeModulesPath) && $eelectron && fs.existsSync($eelectron)){
     const writeFilePath = path.resolve($eelectron,"utils","writeFile.js");
     if(fs.existsSync(writeFilePath)){
        const writeFile = require(`${writeFilePath}`);
        //generate getTable.js file
        const generateGetTable = String(envObj.GENERATE_GET_TABLE_JS_FILE ).trim().toLowerCase();
        const willGenerateGetTableJs = generateGetTable === "false" || generateGetTable ==="0" ? false : true;
        const tableDataPath = String(envObj.TABLES_DATA_PATH);
        if(willGenerateGetTableJs && tableDataPath && fs.existsSync(tableDataPath)){
          if(fs.lstatSync(tableDataPath).isDirectory()){
            const getTableJsPath = path.resolve(tableDataPath,"getTable.js");
            let getTableJSContent = '';
            const tables = fs.readdirSync(tableDataPath);
            if(Array.isArray(tables)){
                tables.map((table,i)=>{
                  table = table.trim();
                  const tableName = table.toUpperCase();
                  const tablePath = path.join(tableDataPath, table);
                  const indexTablePath = path.join(tablePath,"index.js");
                  const stat = fs.lstatSync(tablePath);
                  if(!stat.isDirectory() || !fs.existsSync(indexTablePath)) return;
                  const indexContent = fs.readFileSync(indexTablePath,'utf8') ;
                  if(!indexContent || (!indexContent.includes("table") && !indexContent.includes("tableName"))){
                      return;
                  }
                   getTableJSContent+=`\n\t\tif(tableName === "${tableName}"){return require("./${table}").default;}`;
                });
                //on génère le fichier getTable des tables data de l'application
                if(getTableJSContent){
                    writeFile(getTableJsPath,`
  module.exports = function(tableName){
      if(!tableName || typeof tableName !=="string") return null;
      tableName = tableName.toUpperCase().trim();
    ${getTableJSContent}
      return null;
  }
                    `);
                }
            }
          }
        }
      
        //generating appex js file
        const eAppex  = $ecomponents && path.resolve($ecomponents,"Chart","appexChart");
        if(eAppex && fs.existsSync(eAppex)){
          const appexPathHtml = path.resolve(eAppex,"index.html");
          const appexDistPath = path.resolve(nodeModulesPath,"apexcharts","dist","apexcharts.min.js");
          if(fs.existsSync(appexDistPath)){
             const jsContent = fs.readFileSync(appexDistPath, 'utf8')
             //overite appex chart html file
             writeFile(appexPathHtml,`
               <html>
               <head>
                 <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                 <script>${jsContent}</script>
                 </head>
                 <body>
                 </body>
               </html>
             `);
          }
        }
     }
    
  }
  
  
  return {
    presets: [
      ['babel-preset-expo']
    ],
    plugins : [
      ["inline-dotenv",inlineDovOptions],
      ["module-resolver", {"alias": alias}],
      ['transform-inline-environment-variables',{
        "include": [
          "NODE_ENV"
        ]
      }],
      ['react-native-reanimated/plugin'],
    ],
  };
};
