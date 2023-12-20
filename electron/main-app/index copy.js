const {app, BrowserWindow,Tray,Menu,MenuItem,globalShortcut,systemPreferences,powerMonitor,ipcMain,dialog, nativeTheme} = require('electron')
const session = require("./utils/session");
const path = require("path");
const fs = require("fs");
const { program } = require('commander');

program
  .option('-u, --url <url>', 'L\'adresse url à ouvrir au lancement de l\'application')
  .option('-r, --root <projectRoot>', 'le chemin du project root de l\'application')
  //.option('-p, --paths <paths>', 'le chemin vers le fichiers paths.json contenant la liste des alias de l\'application, exportés au moment de la compilation')
  .parse();

const programOptions = program.opts();
const {url:pUrl,root:mainProjectRoot} = programOptions

const isAsar = (typeof require.main =="string" && require.main ||"").indexOf('app.asar') !== -1;
const projectRoot = mainProjectRoot && fs.existsSync(mainProjectRoot) ? mainProjectRoot : process.cwd();
const electronProjectRoot = projectRoot && fs.existsSync(path.resolve(projectRoot,"electron")) && path.resolve(projectRoot,"electron") || projectRoot;
const packageJSONPath = path.resolve(projectRoot,"package.json");
const isValidUrl = require("./utils/isValidUrl");
const packageJSON = fs.existsSync(packageJSONPath) ? require(`${packageJSONPath}`) : {};
const indexFilePath = path.resolve(path.join(electronProjectRoot,"dist",'index.html'));
const mainProcessPath = path.resolve('processes',"main","index.js");
const mainProcessIndex = electronProjectRoot && fs.existsSync(path.resolve(electronProjectRoot,mainProcessPath)) && path.resolve(electronProjectRoot,mainProcessPath);
const mainProcessRequired = mainProcessIndex && require(`${mainProcessIndex}`);
//pour étendre les fonctionnalités au niveau du main proceess, bien vouloir écrire dans le fichier projectRoot/electron/main/index.js
const mainProcess = mainProcessRequired && typeof mainProcessRequired =='object'? mainProcessRequired : {};
// Gardez une reference globale de l'objet window, si vous ne le faites pas, la fenetre sera
// fermee automatiquement quand l'objet JavaScript sera garbage collected.
let win = undefined;
Menu.setApplicationMenu(null);

if(!isValidUrl(pUrl) && !fs.existsSync(indexFilePath)){
  throw `Unable to start the application: index file located at [${indexFilePath}] does not exists : projectRoot : [${projectRoot}], electronProjectRoot = [${electronProjectRoot}], isAsar:[${require.main}]`
}

const clipboadContextMenu = (_, props) => {
  if (props.isEditable || props.selectionText) {
    const menu = new Menu();
    if(props.selectionText){
      menu.append(new MenuItem({ label: 'Copier', role: 'copy' }));
      if(props.isEditable){
         menu.append(new MenuItem({ label: 'Couper', role: 'cut' }));
      }
    }
    if(props.isEditable){
      menu.append(new MenuItem({ label: 'Coller', role: 'paste' }));
    }
    menu.popup();
  } 
};
const log = (message)=>{
  return win != null && win && win.webContents.send("console.log",message);
}

const isObj = x => x && typeof x =='object';


function createBrowserWindow (options){
  const {isMainWindow} = options;
  options = Object.assign({},options);
  let menu = options.menu;
  options.webPreferences = isObj(options.webPreferences)? options.webPreferences : {};
  options.webPreferences = {
    sandbox: false,
    webSecurity : true,
    plugin:false,
    autoHideMenuBar: true,
    contextIsolation: true,
    contentSecurityPolicy: `
      default-src 'none';
      script-src 'self';
      img-src 'self' data:;
      style-src 'self';
      font-src 'self';
    `,
    ...options.webPreferences,
    devTools: typeof options.webPreferences.devTools === 'boolean'? options.webPreferences.devTools : false,
    allowRunningInsecureContent: false,
    nodeIntegration: false,
    preload: options.preload ? options.preload : null,
  }
  if(options.modal && !options.parent && win){
    options.parent = win;
  }
  if(typeof options.show ==='undefined'){
    options.show = false;
  }
  let showOnLoad = options.showOnLoad ===true ? true : undefined;
  if(showOnLoad){
     options.show = false;
  }
  if(typeof mainProcess.beforeCreateWindow =='function'){
     const opts = Object.assign({},mainProcess.beforeCreateWindow(options));
     options = {...options,...opts};
  }
  let _win = new BrowserWindow(options);
  if(!menu){
      _win.setMenu(null);
      _win.removeMenu();
      _win.setMenuBarVisibility(false)
      _win.setAutoHideMenuBar(true)
  }
  const url = isValidUrl(options.loadURL) || typeof options.loadURL ==='string' && options.loadURL.trim().startsWith("file://") ? options.loadURL : undefined;
  if(url){
    _win.loadURL(url);
  } else if(options.file && fs.existsSync(options.file)){
    _win.loadFile(options.file);
  } 
  if(showOnLoad){
    _win.once('ready-to-show', () => {
        _win.show();
        _win.webContents.send("window-ready-to-show",JSON.stringify(options.readyToShowOptions));
    });
  }
  _win.on('closed', function() {
      if(isMainWindow && typeof mainProcess.onMainWindowClosed == "function"){
        mainProcess.onMainWindowClosed(_win);
      }
      _win = null;
  });
  return _win;
}
function createWindow () {
  // Créer le browser window
  win = createBrowserWindow({
    showOnLoad : false,
    loadURL : undefined,
    isMainWindow : true,
    registerDevToolsCommand : false,
    preload : path.resolve(__dirname,'preload.js'),
    webPreferences : {
      devTools : true,
    }
  });

 const sOptions = {width: 500, height: 400, transparent: true, frame: false, alwaysOnTop: true};
  const splash = typeof mainProcess.splashScreen ==='function'&& mainProcess.splashScreen(sOptions) 
    || typeof mainProcess.splash ==='function' && mainProcess.splash(sOptions) 
    || (mainProcess.splash instanceof BrowserWindow) && mainProcess.splash
    || (mainProcess.splashScreen instanceof BrowserWindow) && mainProcess.splashScreen;
    null;
  let hasInitWindows = false;
  win.on('show', () => {
    //win.blur();
    setTimeout(() => {
      win.focus();
      win.moveTop();
      win.webContents.focus(); 
      if(!hasInitWindows){
        hasInitWindows = true; 
        win.webContents.send('appReady');
      } 
    }, 200);
  });

  win.on("focus",()=>{
    if(win && hasInitWindows){
      win.webContents.send("main-window-focus");
    }
  });
  win.on("blur",()=>{
    if(win && hasInitWindows){
      win.webContents.send("main-window-blur");
    }
  });
  
  win.once("ready-to-show",function(){
      if(typeof mainProcess.onMainWindowReadyToShow ==='function'){
          mainProcess.onMainWindowReadyToShow(win);
      }
      win.minimize()
      try {
        if(splash && splash instanceof BrowserWindow){
          splash.destroy();
        }
      } catch{ }
      win.restore();
      win.show();
      //log(icon," is consooleeeee")
  })    
 
  win.on('close', (e) => {
      if (win) {
        if(typeof mainProcess.onMainWindowClose == "function"){
          mainProcess.onMainWindowClose(win);
        }
        e.preventDefault();
        win.webContents.send('before-app-exit');
      }
  });
  if(isValidUrl(pUrl)){
    win.loadURL(pUrl);
  } else {
    win.loadFile(indexFilePath)
  }

  win.on('unresponsive', async () => {
    const { response } = await dialog.showMessageBox({
      title: "L'application a cessé de répondre",
      message : 'Voulez vous relancer l\'application?',
      buttons: ['Relancer', 'Arrêter'],
      cancelId: 1
    })
    if (response === 0) {
      win.forcefullyCrashRenderer()
      win.reload()
    } else {
      win.forcefullyCrashRenderer()
      app.exit();
    }
  })

 // Ouvre les DevTools.
 //win.webContents.openDevTools()
  
  // Émit lorsque la fenêtre est fermée.
  win.on('closed', () => {
    win = null
  })
  win.webContents.on('context-menu',clipboadContextMenu);
  win.setMenu(null);

  /*** les dimenssions de la fenêtre principale */
  let mWindowSessinName = "mainWindowSizes";
  let mWindowPositionSName = mWindowSessinName+"-positions";
  let sizeW = session.get(mWindowSessinName);
  if(!sizeW || typeof sizeW !== 'object'){
    sizeW = {};
  }
  let sPositions = session.get(mWindowPositionSName);
  if(!sPositions || typeof sPositions !=='object'){
    sPositions = {};
  }
  let isNumber = x => typeof x =="number";
  if(isNumber(sizeW.width) && isNumber(sizeW.height)){
      win.setSize(sizeW.width,sizeW.height);
      if(isNumber(sPositions.x) && isNumber(sPositions.y)){
          win.setPosition(sPositions.x,sPositions.y);
      }
  }
  let onWinResizeEv =  debounce(function () {
      if(win){
          let wSize = win.getSize();
          if(Array.isArray(wSize) && wSize.length == 2){
              let [width,height] = wSize;
              if(width && height){
                  session.set(mWindowSessinName,{width,height});
              }
              let [x,y] = win.getPosition();
              session.set(mWindowPositionSName,{x,y});
          }
      }
  }, 100);
  win.off('resize',onWinResizeEv);
  win.on('resize',onWinResizeEv);
  win.off('move',onWinResizeEv);
  win.on('move',onWinResizeEv);
  if(typeof mainProcess.onCreateMainWindow =='function'){
     mainProcess.onCreateMainWindow(win);
  }
  return win;
}

const quit = ()=>{
  try {
    app.quit();
  } catch(e){
    console.log(e," triing kit app")
  }
}
// Quitte l'application quand toutes les fenêtres sont fermées.
app.on('window-all-closed', () => {
  // Sur macOS, il est commun pour une application et leur barre de menu
  // de rester active tant que l'utilisateur ne quitte pas explicitement avec Cmd + Q
  if (process.platform !== 'darwin') {
    quit();
  }
})

const toggleDevTools = (value,window)=>{
  window = window instanceof BrowserWindow ? window : win;
  if(window !==null && window.webContents){
    const isOpen= window.webContents.isDevToolsOpened();
    value = value === undefined ? !isOpen : value;
    if(value && !isOpen){
        window.webContents.openDevTools();
        return window.webContents.isDevToolsOpened();
    } else {
        if(isOpen) window.webContents.closeDevTools();
    }
    return window.webContents.isDevToolsOpened();
  }
  return false;
}
ipcMain.on("toggle-dev-tools",function(event,value) {
  return toggleDevTools(value);
});


app.whenReady().then(() => {
  const readOpts = {toggleDevTools,browserWindow:win,mainWindow:win};
  if(typeof mainProcess.whenAppReady =='function'){
     mainProcess.whenAppReady(readOpts);
  }
  globalShortcut.register('CommandOrControl+F12', () => {
    toggleDevTools();
  });
}).then(()=>{
  createWindow();
  app.on('activate', function () {
    if (win == null || (BrowserWindow.getAllWindows().length === 0)) createWindow()
  });
})

ipcMain.on("restart-app",x =>{app.relaunch();})
  let tray = null;
  let isJSON = function (json_string){
  if(!json_string || typeof json_string != 'string') return false;
  var text = json_string;
  return !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(text.replace(/"(\\.|[^"\\])*"/g, '')));
}
ipcMain.on("update-system-tray",(event,opts)=>{
  opts = opts && typeof opts == 'object'? opts : {};
  let {contextMenu,tooltip} = opts;
  if(tray){
  } else {
    tray = new Tray();
  }        
  if(!tooltip || typeof tooltip !=="string"){
      tooltip = ""
  }
  tray.setToolTip(tooltip);
  if(isJSON(contextMenu)){
      contextMenu = JSON.parse(contextMenu);
  } 
  if(Array.isArray(contextMenu) && contextMenu.length) {
    let tpl = []
    contextMenu.map((m,index)=>{
       if(!m || typeof m !=='object') return;
       m.click = (e)=>{
         if(win && win.webContents) win.webContents.send("click-on-system-tray-menu-item",{
            action : m.action && typeof m.action =='string'? m.action : undefined,
            index,
            menuItem : JSON.stringify(m),
         })
       }
       tpl.push(m);
    })
    contextMenu = Menu.buildFromTemplate(tpl);
  } else contextMenu = null;
  tray.setContextMenu(contextMenu) 
})
ipcMain.on("get-path",(event,pathName)=>{
  const p = app.getPath(pathName);
  event.returnValue = p;
  return p;
});

ipcMain.on("get-project-root",(event)=>{
  event.returnValue  = projectRoot;
  return projectRoot;
});
ipcMain.on("get-electron-project-root",(event)=>{
  event.returnValue = electronProjectRoot;
  return event.returnValue ;
});

ipcMain.on("get-package.json",(event)=>{
  event.returnValue = JSON.stringify(packageJSON);
  return event.returnValue ;
});

ipcMain.on("get-app-name",(event)=>{
  event.returnValue = packageJSON.realAppName || packageJSON.name;
  return event.returnValue ;
});

ipcMain.on("get-media-access-status",(event,mediaType)=>{
  let p = systemPreferences.getMediaAccessStatus(mediaType);
  event.returnValue = p;
  return p;
});

ipcMain.on("ask-for-media-access",(event,mediaType)=>{
  systemPreferences.askForMediaAccess(mediaType);
});

ipcMain.on("get-app-icon",(event)=>{
  event.returnValue = win != win && win.getIcon && win.getIcon();
});
ipcMain.on("set-app-icon",(event,iconPath)=>{
   if(iconPath && win != null){
      win.setIcon(iconPath);
      event.returnValue = iconPath;
   } else {
      event.returnValue = null;
   }
});

ipcMain.on('minimize-main-window', () => {
  if(win !== null && win){
     win.blur();
     win.minimize();
  }
})
ipcMain.on('restore-main-window', () => {
  if(win && win !== null){
    win.restore()
    win.blur();
    setTimeout(() => {
      win.focus();
      win.moveTop();
      win.webContents.focus();   
    }, 200);
  }
})
ipcMain.on('close-main-render-process', _ => {
  if(win){
    win.destroy();
  }
  win = null;
  if(typeof gc =="function"){
    gc();
  }
  quit();
});


function debounce(func, wait, immediate) {
  var timeout;

  return function executedFunction(...args) {
    var context = this;
	    
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    var callNow = immediate && !timeout;
	
    clearTimeout(timeout);

    timeout = setTimeout(later, wait);
	
    if (callNow) func.apply(context, args);
  };
};
//app.disableHardwareAcceleration();


const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    //pour plus tard il sera possible d'afficher la gestion multi fenêtre en environnement electron
    if (win) {
        if (win.isMinimized()) win.restore()
        win.focus()
    }
  })
}

const powerMonitorCallbackEvent = (action)=>{
  if(!win || !win.webContents) return;
  if(action =="suspend" || action =="lock-screen"){
      win.webContents.send("main-app-suspended",action);
      return;
  }
  win.webContents.send("main-app-restaured",action);
  win.webContents.focus();  
  return null;
}
if(powerMonitor){
  ["suspend","resume","lock-screen","unlock-screen"].map((action)=>{
      powerMonitor.on(action,(event)=>{
          powerMonitorCallbackEvent(action,event);
      })
  })
}
ipcMain.on("set-main-window-title",(event,title)=>{
  if(win !== null){
      win.setTitle(title);
  }
})


ipcMain.handle("create-browser-windows",function(event,options){
  if(typeof options =='string'){
    try {
      const t = JSON.parse(options);
      options = t;
    } catch{}
  }
  options = Object.assign({},options);
  createBrowserWindow(options);
})

ipcMain.handle("show-open-dialog",function(event,options){
  if(!isObj(options)){
     options = {};
  }
  return dialog.showOpenDialog(win,options)
})

ipcMain.handle("show-save-dialog",function(event,options){
  if(!isObj(options)){
     options = {};
  }
  return dialog.showSaveDialog(win,options)
})
ipcMain.on("is-dev-tools-open",function(event,value) {
  if(win !==null && win.webContents){
    return win.webContents.isDevToolsOpened();
  }
  return false;
});


ipcMain.on("window-set-progressbar",(event,interval)=>{
   if(typeof interval !="number" || interval <0) interval = 0;
   interval = Math.floor(interval);
   if(win){
     win.setProgressBar(interval);
   }
})

const setOSTheme = (theme) => {
  theme = theme && typeof theme == "string"? theme : "light";
  theme = theme.toLowerCase().trim();
  if(theme !== 'system' && theme !=='dark'){
    theme = "light";
  }
  nativeTheme.themeSource = theme;
  session.set("os-theme",theme);
  return nativeTheme.shouldUseDarkColors
}

/**** customisation des thèmes de l'application */
ipcMain.handle('set-system-theme:toggle', (event,theme) => {
  return setOSTheme(theme);
});

ipcMain.handle('set-system-theme:dark-mode', (event) => {
    nativeTheme.themeSource = 'dark';
    return nativeTheme.shouldUseDarkColors;
});
ipcMain.handle('set-system-theme:light-mode', (event) => {
  nativeTheme.themeSource = 'light';
  return nativeTheme.shouldUseDarkColors;
});


ipcMain.handle('dark-mode:toggle', () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = 'light'
  } else {
    nativeTheme.themeSource = 'dark'
  }
  return nativeTheme.shouldUseDarkColors
})

ipcMain.handle('dark-mode:system', () => {
  nativeTheme.themeSource = 'system'
});