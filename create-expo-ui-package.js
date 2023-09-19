const path = require("path"), fs = require("fs");
const projectRoot = process.cwd();
const packageJSonPath = path.resolve(projectRoot,"package.json");
const mainAppPackage = path.resolve(projectRoot,"expo-ui.json");
if(!fs.existsSync(mainAppPackage) && fs.existsSync(packageJSonPath)){
    try {
        const packageObj = require(`${packageJSonPath}`);
        if(packageObj && typeof packageObj =='object'){
          ["scripts","private","main","repository","keywords","bugs","dependencies","devDependencies"].map(v=>{
              delete packageObj[v];
          });
          fs.writeFileSync(mainAppPackage,JSON.stringify(packageObj,null,"\t"));
          console.log("expo-ui.json file created")
        }
    } catch{}
}