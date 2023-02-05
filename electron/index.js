const {app, BrowserWindow,Tray,Menu,MenuItem,systemPreferences,powerMonitor,dialog, nativeTheme} = require('electron')
const appConfig  = {}//require("../app/config");
const session = require("./session");
const path = require("path");
const fs = require("fs");
const ePath = path.resolve(__dirname);
const getDirname = require("./getDirname");
if(!fs.existsSync(path.resolve(ePath,"paths.json"))){
  throw {message : 'Chemin de noms, fichier paths.json introuvable!! Exécutez l\'application en enviornnement web|mobile|android|ios puis re-essayez'}
}
const paths = require("./paths.json");
const images = paths.$images, assets = paths.$assets, logo = paths.logo;
const projectRoot = paths.projectRoot || '';
const electronProjectRoot = projectRoot && fs.existsSync(path.resolve(projectRoot,"electron")) && path.resolve(projectRoot,"electron") || null;
const mainProcessIndex = electronProjectRoot && fs.existsSync(path.resolve(electronProjectRoot,"main.process.js")) && path.resolve(electronProjectRoot,"main.process.js");
const mainProcessRequired = mainProcessIndex && require(`${mainProcessIndex}`);
//pour étendre les fonctionnalités au niveau du main proceess, bien vouloir écrire dans le fichier projectRoot/electron/main.process.js
const mainProcess = mainProcessRequired && typeof mainProcessRequired =='object'? mainProcessRequired : {};
// Gardez une reference globale de l'objet window, si vous ne le faites pas, la fenetre sera
// fermee automatiquement quand l'objet JavaScript sera garbage collected.
let win = undefined;
const icon = require("./getIcon")(
    logo && fs.existsSync(logo) && getDirname(logo),
    images && getDirname(images) || '',
    assets && getDirname(assets) || '',
);
Menu.setApplicationMenu(null);
let clipboadContextMenu = (_, props) => {
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



const setOSTheme = (theme) => {
  theme = theme && typeof theme == "string"? theme : "light";
  theme = theme.toLowerCase().trim();
  if(theme !== 'system' && theme !=='dark'){
    theme = "light";
  }
  nativeTheme.themeSource = theme;
  session.set("electron-os-theme",theme);
  return nativeTheme.shouldUseDarkColors
}
setOSTheme(session.get("electron-os-theme"));
let isObj = x => x && typeof x =='object';
function createBrowserWindow (options){
  options = options && typeof options =='object'? options : {};
  let menu = options.menu;
  options.webPreferences = isObj(options.webPreferences)? options.webPreferences : {}
  options.webPreferences = {
    sandbox: false,
    ...options.webPreferences,
    contextIsolation: true,
    devTools: typeof options.webPreferences.devTools === 'boolean'? options.webPreferences.devTools : false,
    icon,
    webSecurity : true,
    autoHideMenuBar: true,
    allowRunningInsecureContent: false,
    nodeIntegration: false,
    preload: options.preload ? options.preload : null,
    plugin:false,
    contentSecurityPolicy: `
        default-src 'none';
        script-src 'self';
        img-src 'self' data:;
        style-src 'self';
        font-src 'self';
      `
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
  if(mainProcess && typeof mainProcess.beforeCreateWindow =='function'){
     mainProcess.beforeCreateWindow(options);
  }
  let _win = new BrowserWindow(options);
  if(!menu){
      _win.setMenu(null);
      _win.removeMenu();
      _win.setMenuBarVisibility(false)
      _win.setAutoHideMenuBar(true)
  }
  let url = options.loadURL && typeof options.loadURL ==='string'? options.loadURL : undefined;
  if(url){
    _win.loadURL(url);
  }
  if(showOnLoad){
    _win.once('ready-to-show', () => {
        _win.show();
    });
  }
  _win.on('closed', function() {
      _win = null;
  });
  return _win;
}
const args = require("./parseArgs")();
function createWindow () {
  // Créer le browser window
  win = createBrowserWindow({
    showOnLoad : false,
    loadURL : undefined,
    preload : path.resolve(__dirname,'preload.js'),
    webPreferences : {
      devTools : true,
    }
  });
  
 const log = (message)=>{
    return win != null && win && win.webContents.send("console.log",message);
  }
  // create a new `splash`-Window 
  /*** @see : http://leftstick.github.io/splash-screen/ */
  let splash = new BrowserWindow({
      width: 500, height: 400, transparent: true, frame: false, alwaysOnTop: true});
  let copyRight = appConfig.name+" version "+appConfig.version+". "+appConfig.copyRight;
  copyRight = encodeURI(copyRight);
  //splash.loadURL(`file://${__dirname}/splash/index.html?copyRight=${copyRight}`);
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
      win.minimize()
      if(splash !== null)splash.destroy();
      splash = null;
      win.restore();
      win.show();
      //log(icon," is consooleeeee")
  })    
 
  win.on('close', (e) => {
      if (win) {
        e.preventDefault();
        win.webContents.send('before-app-exit');
      }
  });
  if(args.url){
    win.loadURL(args.url);
  } else {
    win.loadFile(path.resolve(path.join(__dirname,"dist",'index.html')))
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
 win.webContents.openDevTools()
  
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
}
let quit = ()=>{
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

app.whenReady().then(() => {
  appReady = true;
  createWindow();
  app.on('activate', function () {
    if (win == null || (BrowserWindow.getAllWindows().length === 0)) createWindow()
  });
})

const {ipcMain} = require("electron");

ipcMain.on("electron-restart-app",x =>{
  app.relaunch();
})
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
    tray = new Tray(icon? icon : undefined);
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
ipcMain.on("electron-get-path",(event,pathName)=>{
  const p = app.getPath(pathName);
  event.returnValue = p;
  return p;
});

ipcMain.on("electron-get-media-access-status",(event,mediaType)=>{
  let p = systemPreferences.getMediaAccessStatus(mediaType);
  event.returnValue = p;
  return p;
});

ipcMain.on("electron-ask-for-media-access",(event,mediaType)=>{
  systemPreferences.askForMediaAccess(mediaType);
});

ipcMain.on("electron-get-app-icon",(event)=>{
  event.returnValue = icon;
  return icon;
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

  return function executedFunction() {
    var context = this;
    var args = arguments;
	    
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
ipcMain.on("electron-set-main-window-title",(event,title)=>{
  if(win !== null){
      win.setTitle(title);
  }
})


ipcMain.handle("electron-create-browser-windows",function(event,options){
  if(!isObj(options)){
     options = {};
  }
  createBrowserWindow(options);
})

ipcMain.handle("electron-show-open-dialog",function(event,options){
  if(!isObj(options)){
     options = {};
  }
  return dialog.showOpenDialog(win,options)
})

ipcMain.handle("electron-show-save-dialog",function(event,options){
  if(!isObj(options)){
     options = {};
  }
  return dialog.showSaveDialog(win,options)
})
ipcMain.on("electron-is-dev-tools-open",function(event,value) {
  if(win !==null && win.webContents){
    return win.webContents.isDevToolsOpened();
  }
  return false;
})
ipcMain.on("electron-toggle-dev-tools",function(event,value) {
  if(win !==null && win.webContents){
    const isOpen= win.webContents.isDevToolsOpened();
    value = value === undefined ? !isOpen : value;
    if(value && !isOpen){
        win.webContents.openDevTools();
        return win.webContents.isDevToolsOpened();
    } else {
        if(isOpen) win.webContents.closeDevTools();
    }
    return win.webContents.isDevToolsOpened();
  }
  return false;
})

ipcMain.on("electron-window-set-progressbar",(event,interval)=>{
   if(typeof interval !="number" || interval <0) interval = 0;
   interval = Math.floor(interval);
   if(win){
     win.setProgressBar(interval);
   }
})

/**** customisation des thèmes de l'application */
ipcMain.handle('electron-set-system-theme:toggle', (event,theme) => {
  return setOSTheme(theme);
});