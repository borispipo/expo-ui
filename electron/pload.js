const { machineIdSync} = require('node-machine-id');
const fs = require("fs");
const path = require("path");
module.exports = (ELECTRON,paths)=>{
    const isWin = process.platform === "win32"? true : false;
    const isLinux = process.platform === "linux"? true : false;
    const {ipcRenderer} = require("electron");
    const os = require("os");
    let totalRAM = os.totalmem();
    if(typeof totalRAM !=="number"){
        totalRAM = 0;
    }
    const getMem = (unit,key)=>{
        let memory = 0;
        if(typeof os[key] =="function"){
            memory = os[key]();
        }
        if(typeof memory !=="number"){
            memory = 0;
        }
        if(!memory) return 0;
        if(typeof unit !=="string") unit = "gb";
        switch(unit.toLowerCase()){
            case "kb" : 
                return memory / 1024;
            case "mb" : 
                return memory / (1024 * 1024);
            case "gb" : 
                return memory / (1024 * 1024 * 1024);
        }
        return memory;
    }
    const ext = {
        toggleDevTools : (value)=>{
            ipcRenderer.send("electron-toggle-dev-tools",defaultBool(value,true));
        },
        gc : x =>{
            if(typeof global.gc =='function') return global.gc();
            return false;
        },
        DEVICE : {
            computerName : os.hostname(),
            operatingSystem : os.type(),
            isWindows : isWin,
            isLinux,
            isMac : process.platform =='darwin'? true : false,
            isDarwin : process.platform =='darwin'? true : false,
            arch : os.arch(),
            totalRAMInGB : totalRAM / (1024 * 1024 * 1024),
            getFreeRAM : (unit)=> getMem(unit,"freemem"),
            getTotalRAM : (unit)=> getMem(unit,'totalmem')
        },
        setTitle : (title) =>{
            if(title && typeof title =="string"){
               ipcRenderer.send("electron-set-main-window-title",title);
            }
        },
        createWindow : (options)=>{
            options = defaultObj(options);
            options.showOnLoad = defaultBool(options.showOnLoad,true);
            return ipcRenderer.invoke("electron-create-browser-windows",options);
        },
        createPDFWindow :(options)=>{
            options = defaultObj(options);
            options.modal = true;
            return ELECTRON.createWindow(options);
        },
        createProgressBar : (options)=>{
            if(!options || typeof options != 'object' || Array.isArray(options)){
                options = {};
            }
            return //new ProgressBar(options,app);
        },
        getAutoUpdaterEvents : ()=> [
            //'checking-for-update',
            'update-available',
            'update-not-available',
            'error',
            'download-progress',
            'update-downloaded'
        ],
    };
    for(var i in ext){
        ELECTRON[i] = ext[i];
    }
    if(process.env && typeof process.env =="object"){
        const logName = process.env["LOGNAME"] || process.env["USER"];
        if(logName && typeof logName =="string"){
            ELECTRON.DEVICE.computerUserName = logName;
        }
    }
    const uuid = machineIdSync({original: true});
    if(uuid && typeof uuid =='string') ELECTRON.DEVICE.uuid = uuid;
     
    ELECTRON.DEVICE.computerUserName = process.env.SUDO_USER ||
        process.env.C9_USER ||
        process.env.LOGNAME ||
        process.env.USER ||
        process.env.LNAME ||
        process.env.USERNAME || '';
    
    const projectRoot = (paths || {}).projectRoot;
    const electronProjectRoot = projectRoot && fs.existsSync(path.resolve(projectRoot,"electron")) && path.resolve(projectRoot,"electron") || null;
    const mainRendererPath = path.resolve('processes',"renderer","index.js");
    const rendererProcessIndex = electronProjectRoot && fs.existsSync(path.resolve(electronProjectRoot,mainRendererPath)) && path.resolve(electronProjectRoot,mainRendererPath);
    //pour étendre les fonctionnalités au niveau du renderer proceess, bien vouloir écrire dans le fichier projectRoot/electron/processes/renderer/index.js
    // dans lequel exporter une fonction prenant en paramètre l'objet electron, que l'on peut étendre et le rendre accessible depuis l'application
    const rendererProcess = rendererProcessIndex && require(`${rendererProcessIndex}`);    
   (typeof rendererProcess ==='function') && rendererProcess(ELECTRON);
   return ELECTRON;
}