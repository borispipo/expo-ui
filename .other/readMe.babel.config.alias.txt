/************************ la liste des alias pouvant être exportés

// override l'alias du repertoire des écrans par défaut, celui de escreens

******************** les propriétés du fichier package.json
-1 la propriété exopUIRootPath : est exploitée pour spécifier les répertoires racines aux dossiers expo-ui 
pendant le développement de l'application

en plus de la variable d'environnement TABLES_DATA_PATH pour la génération des tables de l'application, l'on peut aussi spécifier, 
la prop tablesDataPath du fichier package.json de l'application, pointant vers le chemin relatif des tables de la base de données.
Dans ce cas, le fichier getTable.js sera généré à chaque compilation de l'application