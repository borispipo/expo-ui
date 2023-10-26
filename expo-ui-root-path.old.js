if(isDevEnv){
    const rootPath = process.cwd();
    const src = path.resolve(rootPath,"src");
    try {
        const envObj = require("./parse-env")();
        const euPathm = typeof envObj.EXPO_UI_ROOT_PATH =="string" && envObj.EXPO_UI_ROOT_PATH && path.resolve(envObj.EXPO_UI_ROOT_PATH)||'';
        const eu = euPathm && fs.existsSync(euPathm)? euPathm : null;
        if(eu &&  fs.existsSync(path.resolve(eu,"src")) && fs.existsSync(path.resolve(eu,"webpack.config.js"))){
            return path.resolve(eu,suffix).replace(sep,(sep+sep));
        }
    } catch{}
    const expoUi = path.resolve(rootPath,"expo-ui");
    if(fs.existsSync(src) && fs.existsSync(expoUi) && fs.existsSync(path.resolve(expoUi,"webpack.config.js"))){
        return path.resolve(expoUi,suffix).replace(sep,(sep+sep));
    }
}