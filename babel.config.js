module.exports = function(api,opts) {
  opts = typeof opts =='object' && opts ? opts : {};
  api = api && typeof api =='object'? api : {};
  
  const isLocalDev = require("./is-local-dev")();//si l'application est en developpement local
  ///les chemin vers la variable d'environnement, le chemin du fichier .env,@see : https://github.com/brysgo/babel-plugin-inline-dotenv
  //console.log(environmentPath," is envvv ",opts);
  const path = require("path");
  const fs = require("fs");
  typeof api.cache =='function' && api.cache(true);
  const inlineDovOptions = { unsafe: true};
  const options = {...opts,platform:"expo"};
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
  const packageRootPath = path.resolve(process.cwd(),"package.json");
  const packageJSON = fs.existsSync(packageRootPath) && require(`${packageRootPath}`) || {};
  const envObj = require("./parse-env")();
  
  if(nodeModulesPath && fs.existsSync(nodeModulesPath) && $eelectron && fs.existsSync($eelectron)){
     const writeFilePath = path.resolve($eelectron,"utils","writeFile.js");
     if(fs.existsSync(writeFilePath)){
        const writeFile = require(`${writeFilePath}`);
        //generate getTable.js file
        const tableDataPath = envObj.TABLES_DATA_PATH && path.resolve(String(envObj.TABLES_DATA_PATH)) || packageJSON?.tablesDataPath && path.resolve(String(packageJSON.tablesDataPath)) || null;
        if(tableDataPath && fs.existsSync(tableDataPath)){
          const getTableJSContent = generateTableOrStructDataStr(tableDataPath);
          if(getTableJSContent){
            writeFile(path.resolve(tableDataPath,"getTable.js"),getTableJSContent);
          }
        }
        
        //generate getStructData.js file 
        const structsDataPath = envObj.STRUCTS_DATA_PATH && path.resolve(String(envObj.STRUCTS_DATA_PATH)) || packageJSON?.structsDataPath && path.resolve(String(packageJSON.structsDataPath)) || null;
        if(structsDataPath && fs.existsSync(structsDataPath)){
          const getStructDataJSContent = generateTableOrStructDataStr(structsDataPath);
          if(getStructDataJSContent){
            writeFile(path.resolve(structsDataPath,"getStructData.js"),getStructDataJSContent);
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
      ['react-native-reanimated/plugin'],
    ],
  };
};


/****
  retourne la chaine de caractère liée à la fonction getTable.js ou getStructData.js
  @param {string} tableDataPath, le chemin de la tableDataPath
  @return {string}, la chaine de caractère à enregistrer  dans la fonction getTable.js ou getStructData.js
*/
const generateTableOrStructDataStr = (tableDataPath)=>{
  if(typeof tableDataPath !== 'string' || !tableDataPath.trim()) return null;
  tableDataPath = tableDataPath.trim();
  const fs = require("fs"), path = require("path");
  if(fs.lstatSync(tableDataPath).isDirectory()){
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
           getTableJSContent+=`\t\tif(tableName === "${tableName}"){return require("./${table}").default;}\n`;
        });
        //on génère le fichier getTable des tables data de l'application
        if(getTableJSContent){
          return (`
export default function(tableName){
\tif(!tableName || typeof tableName !=="string") return null;
\ttableName = tableName.toUpperCase().trim();
${getTableJSContent}\treturn null;
}
            `);
        }
    }
  }
  return null;
}