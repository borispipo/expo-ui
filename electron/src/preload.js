(function(window) {
    let showingExitApp = undefined;
    const exec = require("../exec");
    if(typeof window.isElectron != 'function'){
        Object.defineProperties(window,{
            ELECTRON : {
                value : {},writable:false,override : false
            },
            isElectron : {
                value : () => true,
                override : false,
                writable : false
            },
            getPouchdbElectron : {
                value : (PouchDB,window,sqlPouch)=> {
                    window.sqlitePlugin = {openDatabase:require('websql')};
                    PouchDB.plugin(function CapacitorSqlitePlugin (PouchDB) {
                        PouchDB.adapter('node-sqlite', sqlPouch(), true)
                    });
                    return {adapter:"node-sqlite"};
                },
            },
        })
    } 
    const fs = require("fs");
    let _app = require("./app.config");
    require("./pload")(ELECTRON);
    const {ipcRenderer} = require('electron')
    let APP_NAME = defaultStr(_app.name).toUpperCase();
    let path = require("path");
    let getPath = function(pathName){
        return ipcRenderer.sendSync("electron-get-path",pathName);
    }
    let APP_PATH = path.join(getPath("appData"),APP_NAME).toLowerCase();
    let databasePath = path.join(APP_PATH,"databases");
    let ROOT_APP_FOLDER = undefined;
    let separator = (path.sep)
    let DOWNLOADING_FILES= {};
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
    function createDirSync(targetDir, { isRelativeToScript = false } = {}) {
        if(!targetDir || typeof targetDir != 'string') return false;
        const sep = path.sep;
        const initDir = path.isAbsolute(targetDir) ? sep : '';
        const baseDir = isRelativeToScript ? __dirname : '.';
      
        return targetDir.split(sep).reduce((parentDir, childDir) => {
          const curDir = path.resolve(baseDir, parentDir, childDir);
          try {
            fs.mkdirSync(curDir);
          } catch (err) {
            if (err.code === 'EEXIST') { // curDir already exists!
              return curDir;
            }
      
            // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
            if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
              throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
            }
      
            const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
            if (!caughtErr || caughtErr && curDir === path.resolve(targetDir)) {
              throw err; // Throw if it's just the last created dir.
            }
          }
      
          return curDir;
        }, initDir);
    }
    const Config = require('./config');
    let confPath = process.env.ProgramData || process.env.ALLUSERSPROFILE;
    if(confPath && typeof confPath =="string"){
        if(fs.existsSync(confPath) && (_app.name) && typeof _app.name =='string'){
            confPath = path.join(confPath,_app.name.toUpperCase());
            if(!fs.existsSync(confPath)){
                createDirSync(confPath);
            }
            if(fs.existsSync(confPath)){
                ROOT_APP_FOLDER = confPath;
                databasePath = path.join(confPath,"databases");
                createDirSync(databasePath);
                confPath = path.join(confPath,"CONFIG");
                createDirSync(confPath);
            }
        } else confPath = undefined;
    } else confPath = undefined;
    let config = new Config({cwd:confPath});
    if(typeof ELECTRON.getBackupPath !== 'function'){
        let backupPathField = "_e_backupDataPath";
        let cBackupPathField = "company"+backupPathField;
        let dbPathField = "_electron_DBPathField";
        
        Object.defineProperties(ELECTRON,{
            getBackupPath : {
                value : (p)=>{
                    let ePath = config.get(cBackupPathField);
                    let defPath  = ROOT_APP_FOLDER || path.join(getPath("documents"),APP_NAME);
                    ELECTRON.COMPANY_BACKUP_PATH = defaultStr(ePath,defPath);
                    if(!fs.existsSync(ELECTRON.COMPANY_BACKUP_PATH)){
                        ELECTRON.COMPANY_BACKUP_PATH = defPath;
                    }
                    if(isNonNullString(p)){
                        return path.join(ELECTRON.COMPANY_BACKUP_PATH,p);
                    }
                    return ELECTRON.COMPANY_BACKUP_PATH;
                },override:false,writable:false
            },
            getDatabasePath : {
                value : ()=>{
                    let folder = APP.FOLDERS_MANAGER.getCurrent();
                    if(isObj(folder) && fs.existsSync(folder.databasePath)){
                        return databasePath;
                    }
                    let p = config.get(dbPathField);
                    if(fs.existsSync(p)){
                        databasePath = p
                    }
                    if(!fs.existsSync(databasePath)){
                        console.log(databasePath,' does not exists');
                        createDirSync(databasePath);
                    }
                    return databasePath;
                },override:false,writable:false
            },
            setDatabasePath : {
                value : (newPath)=>{
                    config.set(dbPathField,newPath)
                },override:false,writable:false
            },
            setBackupPath : {
                value : (newPath)=>{
                    newPath = defaultStr(newPath,ROOT_APP_FOLDER,path.join(getPath("documents"),APP_NAME));
                    ELECTRON.COMPANY_BACKUP_PATH = newPath;
                    config.set(cBackupPathField,ELECTRON.COMPANY_BACKUP_PATH)
                },override:false,writable:false
            },
            showOpenDialog : {
                value : (options)=>{
                    options = defaultObj(options);
                    return ipcRenderer.invoke("electron-show-open-dialog",options);
                },override:false, writable:false
            },
            showSaveDialog : {
                value : (options)=>{
                    options = defaultObj(options);
                    return ipcRenderer.invoke("electron-show-save-dialog",options);
                },override:false, writable:false
            },
            unlinkDownloadingFile : {
                value : (opts)=>{
                    opts = defaultObj(opts);
                    let p = opts.filePath+".download";
                    if(fs.existsSync(p)){
                        fs.unlink(p, function(err) {
                            if(err && err.code == 'ENOENT') {
                                // file doens't exist
                                console.info("File doesn't exist, won't remove it.");
                            } else if (err) {
                                console.error(err,"Error occurred while trying to remove file");
                            } else {
                                console.info(`removed`, p);
                            }
                        });
                    }
                },override : false, writable : false
            },
            DOWNLOADING_FILES : {value : DOWNLOADING_FILES, override : false, writable : false}, 
            restartApp : {
                value : ()=>{
                    ipcRenderer.sendSync("electron-restart-app")
                }, override : false, writable : false
            },
            downloadFile : {
                value : (opts) =>{
                    opts = defaultObj(opts);
                    opts.directory = defaultStr(opts.directory,ELECTRON.PATH.DOWNLOADS);
                    opts.fileName = defaultStr(opts.fileName,APP.getName().toUpperCase())
                    opts.filePath = path.join(opts.directory,opts.fileName);
                    opts.onProgress = defaultFunc(opts.onProgress,(percentage,chunk,remainingSize)=> {})
                    opts.maxAttempts = defaultDecimal(opts.maxAttempts,4);
                    opts.onError = defaultFunc(opts.onError,x =>x);
                    let {onResponse} = opts;
                    opts.onResponse = function(response){
                        let length = response.headers['content-length'];
                        if(!isDecimal(length)){
                            length = parseFloat(length) || 0;
                        }
                        if(isFunction(onResponse)){
                            onResponse({...response,
                                length,fileSize:length,
                                fileSizeInBytes:length,
                                fileSizeInKiloBytes : length/1024,
                                fileSizeInMegaBytes : length / (1024*1024)
                            })
                        }
                      }
                    if(!isNonNullString(opts.url)) return Promise.reject({msg:'Ipossible de télécharger le fichier car l\'url est non définit'});
                    if(isObj(DOWNLOADING_FILES[opts.url]) && isPromise(DOWNLOADING_FILES[opts.url].promise)) {
                        return DOWNLOADING_FILES[opts.url];
                    }
                    opts.cloneFiles = defaultBool(opts.cloneFiles,false);//This will cause the downloader to re-write an existing file.   
                    
                    /*** If you want to completely skip downloading a file, when a file with the same name already exists, use config.skipExistingFileName = true */
                    opts.skipExistingFileName = defaultBool(opts.skipExistingFileName,false);
                    let Downloader = require('nodejs-file-downloader');
                    let downloader = new Downloader(opts);
                    let promise = downloader.download().then((result)=>{
                        return result;
                    }).catch((e)=>{
                        return e
                        //console.log(e," downloading file electron");
                    }).finally(()=>{
                        delete DOWNLOADING_FILES[opts.url];
                    });
                    DOWNLOADING_FILES[opts.url] = {
                        download : x=> promise,
                        promise,
                        context:downloader,
                        cancel : x => {
                            try {downloader.cancel();} catch(e){
                                console.log(e," canceled download");
                            } finally{ 
                                ELECTRON.unlinkDownloadingFile(opts);
                                delete DOWNLOADING_FILES[opts.url];
                            }
                        },
                    } 
                    return DOWNLOADING_FILES[opts.url];
                },override : false, writable : false
            },
            /*** le gestionnaire des configurations application electron : 
             *  voir : https://github.com/sindresorhus/electron-store
             */
            CONFIG : {
                value : config, override:false,writable:false
            },
            databasePath : {
                value : ()=>{
                    let path = ELECTRON.getDatabasePath();
                    return path;
                },override:false,writable:false
            },
            is : {
                value : true,override:false,writable : false
            },
            APP_PATH : {
                value : APP_PATH,override:false,writable:false
            },
            PATH : {
                value : {
                    ...path,
                    SEPARATOR : separator,
                    SEP : separator,
                    get : getPath,
                    HOME : getPath("home"),
                    USERDATA : getPath("userData"),
                    /*** 
                     * Per-user application data directory, which by default points to:
                     *  %APPDATA% on Windows
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
                }, override:false,writable:false
            },
            ///retourne le chemin dont la chaine de caractère est passé en paramètre
            getPath : {
                value : getPath, override:false,writable:false
            },
            exec : {
                value : exec,
            },
            updateSystemTheme : {
                value : (theme)=>{
                    return ipcRenderer.invoke("electron-set-system-theme:toggle",theme);
                },override:false, writable:false
            },
        })
    }   
    if(!window.APP){
        Object.defineProperties(window,{
            APP : {
                value : {},override:false,writable:false
            }
        })
    }
    ELECTRON.getBackupPath();
    require("./app/index")(ELECTRON)
    require('v8-compile-cache');
    require("v8").setFlagsFromString('--expose_gc'); 

    let _gc = x =>{
        if(!isObj(window.APP) || !isFunction(window.APP.isInitialized)){
            return null;
        }
        if(!window.APP.isInitialized()){
            return null;
        }
        return require("vm").runInNewContext('gc');
    }
    Object.defineProperties(window,{
        gc : {value:_gc,override:false,writable:false}
    })
    Object.defineProperties(ELECTRON,{
        gc : {value:_gc,override:false,writable:false}
    })
    
    ipcRenderer.on('before-app-exit', (args) => {
        let {notify,showConfirm} = APP.require("$dialog");
        hidePreloader();
        if(showingExitApp) return;
        showingExitApp = true;
        showConfirm({
            title : 'Quittez l\'application',
            message : 'Voulez vous vraiment quitter l\'application?',
            yes : 'Oui',
            no : 'Non',
            onCancel : () =>{
                showingExitApp = false;
            },
            onSuccess : ()=>{
                showingExitApp = false;
                let backupDataOnClose = true;
                let promises = []
                    
                if(APP.COMPANY && APP.COMPANY.electronBackupDataOnClose !== undefined){
                    backupDataOnClose = APP.COMPANY.electronBackupDataOnClose;
                }
                if(backupDataOnClose){
                    promises.push(APP.exportData({}).then().catch((e)=>{
                        console.log(e,' on backup databases before exit');
                        notify.error("Une erreur est survenue pendant la sauvegarde des données!! : "+JSON.stringify(e))
                    }))
                } 
                if(APP.COMPANY && defaultVal(APP.COMPANY.syncDataOnExit,0)){
                    let {sync} = APP.require("$database");
                    promises.push(sync.run({cancel:false}));
                }
                let exit = ()=>{
                    let disconectUserOnExit= true;
                    if(APP.COMPANY && APP.COMPANY.disconectUserOnExit !== undefined){
                        disconectUserOnExit = APP.COMPANY.disconectUserOnExit;
                    }
                    if(disconectUserOnExit){
                        Auth.doLogout();
                    }
                    let autoUpdater = APP.getAutoUpdater();
                    let canInstall = autoUpdater.canInstall();
                    autoUpdater.setInstallOnAppExit(false)
                    let ex = x=>ipcRenderer.send("close-main-render-process");
                    if(isObj(canInstall)){
                        if(canInstall.installOnExit){
                            return ELECTRON.installNewAppVersion(canInstall).finally(ex);
                        }
                    } 
                    ex();
                }
                Promise.all(promises).then(exit).catch((e)=>{
                    console.log(e,' exiting app');
                    exit();
                }).finally(exit);
            }
        })
    });

    ipcRenderer.on("main-app-suspended",()=>{
        APP.stopIDLE(true,true);
    })
    ipcRenderer.on("main-app-restaured",()=>{
        APP.trackIDLE();
    });
    ipcRenderer.on('appReady',()=>{})
    ipcRenderer.on("main-window-focus",()=>{
        APP.runElectronAppStateChangedCallback({isActive:true})
    })
    ipcRenderer.on("main-window-blur",()=>{
        APP.runElectronAppStateChangedCallback({});
    })
})(window);

