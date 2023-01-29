module.exports = (ELECTRON)=>{
    let isWin = process.platform === "win32"? true : false;
    let isLinux = process.platform === "linux"? true : false;
    let {ipcRenderer} = require("electron");
    let os = require("os");
    let totalRAM = os.totalmem();
    if(typeof totalRAM !=="number"){
        totalRAM = 0;
    }
    let getMem = (unit,key)=>{
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
    APP.extend(ELECTRON,{
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
    })
    const username = require('username');
    let { machineIdSync} = require('node-machine-id');
    if(process.env && typeof process.env =="object"){
        let logName = process.env["LOGNAME"] || process.env["USER"];
        if(logName && typeof logName =="string"){
            ELECTRON.DEVICE.computerUserName = logName;
        }
    }
    let uuid = machineIdSync({original: true});
    if(uuid && typeof uuid =='string') ELECTRON.DEVICE.uuid = uuid;
      
    username().then((u)=>{
        if(u && typeof u =="string"){
           ELECTRON.DEVICE.computerUserName = u;
        }
    });
   return ELECTRON;
}