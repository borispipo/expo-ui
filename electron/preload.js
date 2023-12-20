const createDir = require("./utils/createDir");
const postMessage = require("./utils/postMessage");
const { contextBridge, ipcRenderer, shell } = require('electron')
const appInstance = require("./app/instance");
const path = require("path");
const fs = require("fs");
const isDataURL = require("./utils/isDataURL");
const isBase64 = require("./utils/isBase64");
const isNonNullString = x=>x && typeof x =='string';
require("./utils/replaceAll");
const appName = ipcRenderer.sendSync("get-app-name");
const electronProjectRoot = ipcRenderer.sendSync("get-electron-project-root");
const sanitize = require("sanitize-filename");
const uniqid = require("./utils/uniqid");
if(!appName || typeof appName !=='string'){
    throw {message : "Nom de l'application invalide!! Veuillez spécifier un nom valide d'application"}
}
const APP_NAME = appName.toUpperCase();
let backupPathField = "_e_backupDataPath";
let cBackupPathField = "company"+backupPathField;
let dbPathField = "_electron_DBPathField";

const getPath = function(pathName){
    if(typeof pathName !=='string' || !pathName) return;
    return ipcRenderer.sendSync("get-path",pathName);
}
const APP_PATH = path.join(getPath("appData"),APP_NAME).toLowerCase();
let databasePath = path.join(APP_PATH,"databases");
let ROOT_APP_FOLDER = undefined;
let appBackupPathRef = undefined;
const defaultStr = (...args)=>{
    for(let i in args){
        if(args[i] && typeof args[i] ==='string') return args[i];
    }
    return "";
}
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
const Config = require('./utils/config');
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
    appBackupPathRef = newPath;
    config.set(cBackupPathField,appBackupPathRef)
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

const createWindow = (options)=>{
    options = Object.assign({},options);
    options.showOnLoad = typeof options.showOnLoad =='boolean'? options.showOnLoad : true;
    return ipcRenderer.invoke("create-browser-windows",JSON.stringify(options));
};

const createPDFFile = (options)=>{
    return new Promise((resolve,reject)=>{
        const dir = getPath("temp");
        options = Object.assign({},options);
        let {content,filename,fileName,charset,fileExtension,extension} = options;
        fileName = defaultStr(filename,fileName)
        if(isDataURL(content)){
            content = isDataURL.toBase64(content);
        }
        if(isBase64(content)){
            content = Buffer.from(content,'base64');
        } else {
           content = null;
        }
        if(!content){
          console.warn('type de contenu invalide!! impression création fichier electron');
          return null;
        }
        fileName = defaultStr(fileName,uniqid("generated-printed-pdf-file-name"))
        fileExtension = defaultStr(fileExtension,extension,'pdf').split(".")[0];
        charset = defaultStr(charset,'utf-8')
        fileName = sanitize(fileName);
        if(!fileName.endsWith(`.${fileExtension}`)){
            fileName += "."+fileExtension
        }
        return fs.writeFile(path.join(dir,fileName), content,{charset},(err)=>{
            if(!err) {
                const p = path.join(dir,fileName);
                const fileUrl = 'file://'+p.replaceAll("\\","/");
                const filePathUrl = 'file://'+p;
                resolve({content,fileName,filename:fileName,path:p,filePathUrl,filePathUri:filePathUrl,fileUrl,filePath:p,fileUri:fileUrl})
            } else {
                reject(err);
            }
        })    
    })
}


const ELECTRON = {
    get getPouchdb(){
        return ({PouchDB,sqlPouch})=> {
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
            appBackupPathRef = typeof eePath =='string' && eePath || typeof defPath =='string' && defPath || '';
            if(!fs.existsSync(appBackupPathRef)){
                appBackupPathRef = defPath;
            }
            if(p && typeof (p) ==='string'){
                return path.join(appBackupPathRef,p);
            }
            return appBackupPathRef;
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
        return ipcRenderer.invoke("show-open-dialog",options);
       }
    },
    get showSaveDialog(){
        return (options)=>{
            options = typeof options =='object' && options && !Array.isArray(options)? options : {};
            return ipcRenderer.invoke("show-save-dialog",options);
        };
    },
    get restartApp(){
        return ()=>{
            ipcRenderer.sendSync("restart-app")
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
            return ipcRenderer.invoke("set-system-theme:toggle",theme);
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
    },
    get toggleDevTools(){
        return async (toggle)=>{
            return await ipcRenderer.send("toggle-dev-tools",toggle);
        }
    },
    get createWindow (){
        return createWindow;
    },
    get createPDFWindow(){
        return (options)=>{
            options = Object.assign({},options);
            options.modal = true;
            return createWindow(options);
        }
    },
    get createPDFFile(){
        return createPDFFile;
    },
    get createPdfFile(){
        return createPDFFile;
    },
    createProgressBar : (options)=>{
        if(!options || typeof options != 'object' || Array.isArray(options)){
            options = {};
        }
        return //new ProgressBar(options,app);
    },
    get setTitle(){
        return (title) =>{
            if(title && typeof title =="string"){
                ipcRenderer.send("set-main-window-title",title);
            }
        };
    },
    get printPDF (){
        return (options)=>{
            options = Object.assign({},options);
            return createPDFFile(options).then(({path:mainPath,filePathUrl,fileName})=>{
                if(fs.existsSync(mainPath)){            
                    const opts = {
                        file : mainPath,
                        fileName,
                        pdfFilePath : mainPath,
                        showOnLoad : true,
                        isPDFWindow : true,//spécifie s'il s'agit de la fenêtre pdf
                        webPreferences: {
                            plugins: true
                        }
                    };
                    return this.createPDFWindow(opts)
                }
            })
        }
    },
    get toggleDarkMode(){
        return ()=>{
            return ipcRenderer.invoke('dark-mode:toggle');
        }
    },
    get setThemeToSystem (){
        return ()=>{
            return ipcRenderer.invoke('dark-mode:system');
        }
    },
    /***** fait passer le theme au mode dark */
    get setThemeToDark(){
        return ()=>{
            return ipcRenderer.invoke('set-system-theme:dark-mode');
        }
    },
    get setThemeToLight(){
        return ()=>{
            return ipcRenderer.invoke('set-system-theme:light-mode');
        }
    },
};

require("./pload")(ELECTRON,{electronProjectRoot});
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
ipcRenderer.on('console.log',(event,...message)=>{
    console.log(...message);
})
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