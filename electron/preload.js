const createDir = require("./createDir");
const postMessage = require("./postMessage");
const { contextBridge, ipcRenderer, shell } = require('electron')
const appInstance = require("./app/instance");
const path = require("path");
const fs = require("fs");
const isObj = x=>x && typeof x =='object' && !Array.isArray(x);
const isNonNullString = x=>x && typeof x =='string';
const ePath = path.resolve(__dirname);
const packagePath = path.resolve(ePath,"package.app.json");
if(!fs.existsSync(packagePath)){
    throw {message : "Chemin du fichier "+packagePath+ " introuvable"};
}
const _app = require(`${packagePath}`);
if(!_app || typeof _app !=='object' || typeof _app.name !=='string'){
    throw {message : "Contenu du fichier "+packagePath+" invalide!! Veuillez spécifier un nom valide d'application, propriété <<name>> dudit fichier"}
}
const APP_NAME = _app.name.trim().toUpperCase();
let backupPathField = "_e_backupDataPath";
let cBackupPathField = "company"+backupPathField;
let dbPathField = "_electron_DBPathField";
const getPath = function(pathName){
    if(typeof pathName !=='string' || !pathName) return;
    return ipcRenderer.sendSync("electron-get-path",pathName);
}
const APP_PATH = path.join(getPath("appData"),APP_NAME).toLowerCase();
let databasePath = path.join(APP_PATH,"databases");
let ROOT_APP_FOLDER = undefined;
const separator = (path.sep)
if(typeof separator != 'string' || !separator){
    separator = (()=>{
        let filePath = databasePath;
        var sepIndex = filePath.lastIndexOf('/');
        if(sepIndex == -1){
            sepIndex = filePath.lastIndexOf('\\');
        }
        // include the trailing separator
        return filePath.substring(0, sepIndex+1);
    })();
}
const Config = require('./config');
let confPath = process.env.ProgramData || process.env.ALLUSERSPROFILE;
if(confPath && typeof confPath =="string"){
    if(fs.existsSync(confPath)){
        confPath = path.join(confPath,APP_NAME);
        if(createDir(confPath)){
            ROOT_APP_FOLDER = confPath;
            databasePath = path.join(confPath,"databases");
            createDir(databasePath);
            confPath = path.join(confPath,"CONFIG");
            createDir(confPath);
        }
    } else confPath = undefined;
} else confPath = undefined;
const config = new Config({cwd:confPath});

const getDatabasePath = ()=>{
    const p = config.get(dbPathField);
    if(fs.existsSync(p)){
        databasePath = p
    }
    if(!fs.existsSync(databasePath)){
        createDir(databasePath);
    }
    return databasePath;
}
const setDatabasePath =  (newPath)=>{
    config.set(dbPathField,newPath)
};
const setBackupPath = (newPath)=>{
    newPath = typeof newPath =='string' && newPath || typeof ROOT_APP_FOLDER =='string' && ROOT_APP_FOLDER || path.join(getPath("documents"),APP_NAME);
    ELECTRON.APP_BACKUP_PATH = newPath;
    config.set(cBackupPathField,ELECTRON.APP_BACKUP_PATH)
};
const APPRef = {
    current : null,
};
///invoke event name
const ipcInvoke = async (eventName, ...params)=> {
    return await ipcRenderer.invoke(eventName, ...params);
}
const validChannels = ["toMain", "myRenderChannel"];
const removeListener =  (channel, callback) => {
    if (isNonNullString(channel) /*&& validChannels.includes(channel)*/) {
        ipcRenderer.removeListener(channel, callback);
    }
}, removeAllListeners = (channel) => {
    if (isNonNullString(channel) /*&& validChannels.includes(channel)*/) {
        ipcRenderer.removeAllListeners(channel)
    }    
};
const ELECTRON = {
    get getPouchdb(){
        return (PouchDB,sqlPouch)=> {
            window.sqlitePlugin = {openDatabase:require('websql')};
            PouchDB.plugin(function CapacitorSqlitePlugin (PouchDB) {
                PouchDB.adapter('node-sqlite', sqlPouch(), true)
            });
            return {adapter:"node-sqlite"};
        };
    },
    get getBackupPath(){
        return (p)=>{
            const eePath = config.get(cBackupPathField);
            const defPath  = ROOT_APP_FOLDER || path.join(getPath("documents"),APP_NAME);
            ELECTRON.APP_BACKUP_PATH = typeof eePath =='string' && eePath || typeof defPath =='string' && defPath || '';
            if(!fs.existsSync(ELECTRON.APP_BACKUP_PATH)){
                ELECTRON.APP_BACKUP_PATH = defPath;
            }
            if(p && typeof (p) ==='string'){
                return path.join(ELECTRON.APP_BACKUP_PATH,p);
            }
            return ELECTRON.APP_BACKUP_PATH;
        };
    },
    get databasePath (){
        return getDatabasePath();
    },
    get getDatabasePath(){
        return getDatabasePath;
    },
    set databasePath(dPath){
        return setDatabasePath(dPath);
    },
    get setDatabasePath (){
        return setDatabasePath;
    },
    set backupPath (backupPath){
        return setBackupPath(backupPath);
    },
    get setBackupPath (){
        return setBackupPath;
    } ,
    get CONFIG (){
        return config;
    },
    get showOpenDialog(){
       return (options)=>{
        options = typeof options =='object' && options && !Array.isArray(options)? options : {};
        return ipcRenderer.invoke("electron-show-open-dialog",options);
       }
    },
    get showSaveDialog(){
        return (options)=>{
            options = typeof options =='object' && options && !Array.isArray(options)? options : {};
            return ipcRenderer.invoke("electron-show-save-dialog",options);
        };
    },
    get restartApp(){
        return ()=>{
            ipcRenderer.sendSync("electron-restart-app")
        };
    },
    get is() {
        return true;
    },
    get APP_PATH(){
        return APP_PATH;
    },
    get initializeAPPInstance(){
        return ({APP,notify})=>{
            ELECTRON.notify = notify;
            ELECTRON.APP  = APP;
       }
    },
    get PATH (){
        return {
            SEPARATOR : separator,
            SEP : separator,
            get : getPath,
            HOME : getPath("home"),
            USERDATA : getPath("userData"),
            /*** 
            * Per-user application data directory, which by default points to:
             * %APPDATA% on Windows
             *  $XDG_CONFIG_HOME or ~/.config on Linux
             *  ~/Library/Application Support on macOS
             */
            APPDATA : getPath("appData"),
            CACHE : getPath("cache"),
            TEMP : getPath("temp"),//Temporary directory.
            EXECUTABLE : getPath("exe"),//The current executable file.
            EXE : getPath("exe"),//The current executable file.
            DOCUMENTS : getPath("documents"),
            DOWNLOADS : path.join(APP_PATH,"downloads"),
            DESKTOP : getPath("desktop"),//The current user's Desktop directory.
        }
    },
    ///retourne le chemin dont la chaine de caractère est passé en paramètre
    get getPath(){
        return getPath;
    },
    get updateSystemTheme(){
        return  (theme)=>{
            return ipcRenderer.invoke("electron-set-system-theme:toggle",theme);
        };
    },
    get SESSION (){
        return  {
            set : (key,value) =>{
                return config.set(key,value);
            },
            get : (key) =>{
                return config.get(key);
            }
        };
    },
    get on (){
        return (eventName, callback)=> {
            console.log(eventName," is evname eee",callback);
            return ipcRenderer.on(eventName, callback)
        };
    },
    get  shellOpenExternal(){
        return async  (url)=> {
            await shell.openExternal(url)
        } 
    },
    get shellOpenPath(){
        return async (file)=> {
            await shell.openPath(file)
        };
    },
    get shellTrashItem(){
        return async (file)=> {
            await shell.trashItem(file)
        };
    },
    get trigger (){
        return (channel, ...data) => {
            if (isNonNullString(channel) /*&& validChannels.includes(channel)*/) {
                ipcRenderer.send(channel);
            }
        };
    },
    get on (){
        return (channel, callback) => {
            if (isNonNullString(channel) /*&& validChannels.includes(channel)*/) {
                // Filtering the event param from ipcRenderer
                const newCallback = (_, data) => callback(data);
                ipcRenderer.on(channel, newCallback);
            }
        };
    },
    get once (){
        return (channel, callback) => { 
            if (isNonNullString(channel) /*&& validChannels.includes(channel)*/) {
                const newCallback = (_, data) => callback(data);
                ipcRenderer.once(channel, newCallback);
            }
        };
    },
    get removeListener(){
        return removeListener;
    },
    get removeAllListeners(){
        return removeAllListeners;
    },
    get off (){
        return removeListener;
    },
    get offAll(){
        return removeAllListeners;
    },
    get version(){
        return process.versions.electron;
    },
    get isWindowsStore(){
        return process.windowsStore;
    },
    get versions(){
        return {
            node: () => process.versions.node,
            chrome: () => process.versions.chrome,
            electron: () => process.versions.electron,
        };
    },
    /****@see : https://www.electronjs.org/docs/latest/tutorial/ipc */
    get openFile(){
        return () => ipcRenderer.invoke('dialog:openFile');
    },
    get ping(){
        return () => ipcRenderer.invoke('ping');
    },
    get exitApp (){
        return x=>ipcRenderer.send("close-main-render-process");
    },
    get onGetAppInstance(){
        return (APP)=>{
            appInstance.set(APP);
        }
    }
};

require("./pload")(ELECTRON);
ELECTRON.getBackupPath();
//require("./app/index")(ELECTRON)
//require('v8-compile-cache');
//require("v8").setFlagsFromString('--expose_gc'); 

ipcRenderer.on('before-app-exit', () => {
    return postMessage("BEFORE_EXIT");
});

ipcRenderer.on("main-app-suspended",()=>{
    postMessage({
        message : "STOP_IDLE",
    });
})
ipcRenderer.on("main-app-restaured",()=>{
    postMessage({
        message : "TRACK_IDLE",
    });
});
ipcRenderer.on('appReady',()=>{})
ipcRenderer.on("main-window-focus",()=>{
    postMessage("WINDOW_FOCUS");
})
ipcRenderer.on("main-window-blur",()=>{
    postMessage("WINDOW_BLUR");
});

process.once('loaded', () => {
    contextBridge.exposeInMainWorld('isElectron',true);
    contextBridge.exposeInMainWorld('ELECTRON',ELECTRON);
})