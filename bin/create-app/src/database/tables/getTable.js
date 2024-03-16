
  /*****
       le contenu de cette fonction peut être généré automatiquement via les commandes suivantes (étant dans le repertoire de l'application)
           npm run generate-getTable | npx @fto-consult/expo-ui generate-getTable. Notons que le script generate-getTable est définit comme étant l'un des scripts du package.json de l'application
       @param {string} tableName, le nom de la table data
       @return {object | null}, table, l'objet table associé 
  */
export default function(tableName){
    if(!tableName || typeof tableName !=="string") return null;
    tableName = tableName.toUpperCase().trim();
    if(tableName === "USERS"){return require("./users").default;}
  return null;
}
            