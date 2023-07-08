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
    const $ecomponents = alias.$ecomponents|| null;
    const eAppex  = $ecomponents && path.resolve($ecomponents,"Chart","appexChart");
    if(eAppex && fs.existsSync(eAppex)){
        const appexPathHtml = path.resolve(eAppex,"index.html");
        const $eelectron = alias.$eelectron || null;
        const expoRoot = alias["$expo-ui-root-path"] || null;
        const expoRootModulesP = expoRoot && fs.existsSync(path.resolve(expoRoot,"node_modules")) && path.resolve(expoRoot,"node_modules") || null;
        const aDistPath = path.join("apexcharts","dist","apexcharts.min.js");
        const nodeModulesPath = expoRootModulesP && fs.existsSync(path.resolve(expoRootModulesP,aDistPath)) ? expoRootModulesP :   alias.$enodeModulesPath;
        if(nodeModulesPath && fs.existsSync(nodeModulesPath) && $eelectron && fs.existsSync($eelectron)){
          const writeFilePath = path.resolve($eelectron,"utils","writeFile.js");
          const appexDistPath = path.resolve(nodeModulesPath,"apexcharts","dist","apexcharts.min.js");
          if(fs.existsSync(writeFilePath) && fs.existsSync(appexDistPath)){
						 const jsContent = fs.readFileSync(appexDistPath, 'utf8')
             const writeFile = require(`${writeFilePath}`);
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
             //console.log("appexchart file overwrited*******************")
          }
        }
    }
    
    return {
      presets: [
        ['babel-preset-expo']/*,
        ["@babel/preset-react", {"runtime": "automatic"}],*/
      ],
      plugins : [
        ["inline-dotenv",inlineDovOptions],
        ["module-resolver", {"alias": alias}],
        ['@babel/plugin-proposal-export-namespace-from'],
        ['transform-inline-environment-variables',{
          "include": [
            "NODE_ENV"
          ]
        }],
        ['react-native-reanimated/plugin'],
      ],
    };
  };