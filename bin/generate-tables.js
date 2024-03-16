
const path = require("path"), fs = require("fs");
const {writeFile} = require("./utils");

/*** permet de générer les tables des bases de données de l'application
*/
module.exports = ()=>{
    const projectRoot = path.resolve(process.cwd());
    const packageRootPath = path.resolve(projectRoot,"package.json");
    const packageJSON = fs.existsSync(packageRootPath) && require(`${packageRootPath}`) || {};
    if(!packageJSON) return;
    
    //generate getTable.js file
    const tableDataPath = packageJSON?.tablesDataPath && path.resolve(String(packageJSON.tablesDataPath)) || null;
    if(tableDataPath && fs.existsSync(tableDataPath)){
      const getTableJSContent = generateTableOrStructDataStr(tableDataPath);
      if(getTableJSContent){
        writeFile(path.resolve(tableDataPath,"getTable.js"),getTableJSContent);
      }
    }
    
    //generate getStructData.js file 
    const structsDataPath = packageJSON?.structsDataPath && path.resolve(String(packageJSON.structsDataPath)) || null;
    if(structsDataPath && fs.existsSync(structsDataPath)){
      const getStructDataJSContent = generateTableOrStructDataStr(structsDataPath);
      if(getStructDataJSContent){
        writeFile(path.resolve(structsDataPath,"getStructData.js"),getStructDataJSContent);
      }
    }
}
/****
  retourne la chaine de caractère liée à la fonction getTable.js ou getStructData.js
  @param {string} tableDataPath, le chemin de la tableDataPath
  @return {string}, la chaine de caractère à enregistrer  dans la fonction getTable.js ou getStructData.js
*/
const generateTableOrStructDataStr = (tableDataPath)=>{
    if(typeof tableDataPath !== 'string' || !tableDataPath.trim()) return null;
    tableDataPath = tableDataPath.trim();
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
            getTableJSContent+=`\tif(tableName === "${tableName}"){return require("./${table}").default;}\n`;
          });
          //on génère le fichier getTable des tables data de l'application
          if(getTableJSContent){
            return (`
/*****
   le contenu de cette fonction peut être généré automatiquement via les commandes suivantes (étant dans le repertoire de l'application)
       npm run generate-getTable | npx @fto-consult/expo-ui generate-getTable. Notons que le script generate-getTable est définit comme étant l'un des scripts du package.json de l'application
   @param {string} tableName, le nom de la table data
   @return {object | null}, table, l'objet table associé 
*/
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