const { program } = require('commander');
const path = require("path");
const fs = require("fs");
const isValidUrl = require("./utils/isValidUrl");

const debounce = require("./utils/debounce");
const {app, BrowserWindow,Tray,Menu,MenuItem,globalShortcut,systemPreferences,powerMonitor,ipcMain,dialog, nativeTheme} = require('electron')
const session = require("./utils/session");
const {isJSON} = require("./utils/json");

const isObj = x => x && typeof x =='object';

let appIsReady = false;

const iconName = process.platform =="win32" ? "icon.ico" : process.platform =='darwin' ? "icon.incs" : "icon.png";

program
  .option('-u, --url <url>', 'L\'adresse url à ouvrir au lancement de l\'application')
  .option('-r, --root <projectRoot>', 'le chemin du project root de l\'application')
  .option('-l, --icon [iconPath]', 'le chemin vers le dossier des icones de l\'application : (Dans ce dossier, doit contenir une image icon.ico pour window, icon.incs pour mac et icon.png pour linux)')
  .parse();

const programOptions = program.opts();
const {url:pUrl,root:mainProjectRoot,icon} = programOptions;
let iconPath = icon && typeof icon =="string" && fs.existsSync(path.resolve(icon)) && path.resolve(icon) || undefined; 
if(iconPath && fs.existsSync(path.resolve(iconPath,iconName))){
    iconPath = path.resolve(iconPath,iconName);
}

const isAsar = (typeof require.main =="string" && require.main ||"").indexOf('app.asar') !== -1;
const distPath = path.join("dist",'index.html');

const processCWD = process.cwd();
const electronProjectRoot = mainProjectRoot && typeof mainProjectRoot =='string' && fs.existsSync(path.resolve(mainProjectRoot)) && fs.existsSync(path.resolve(mainProjectRoot,distPath)) && path.resolve(mainProjectRoot)  || null;
const projectRoot =  electronProjectRoot || fs.existsSync(path.resolve(processCWD,"electron")) && fs.existsSync(path.resolve(processCWD,"electron",distPath)) && path.resolve(processCWD,"electron") 
|| fs.existsSync(path.resolve(processCWD,distPath)) && path.resolve(processCWD) || undefined;
const packageJSONPath = fs.existsSync(processCWD,"package.json")? path.resolve(processCWD,"package.json") : path.resolve(projectRoot,"package.json");
const packageJSON = fs.existsSync(packageJSONPath) ? Object.assign({},require(`${packageJSONPath}`)) : {};
const appName = typeof packageJSON.realAppName =='string' && packageJSON.realAppName || typeof packageJSON.name =="string" && packageJSON.name || "";  

// fermee automatiquement quand l'objet JavaScript sera garbage collected.
let mainWindow = undefined;

Menu.setApplicationMenu(null);

const indexFilePath = path.resolve(path.join(projectRoot,distPath));
const mainProcessPath = path.resolve('processes',"main","index.js");
const mainProcessIndex = projectRoot && fs.existsSync(path.resolve(projectRoot,mainProcessPath)) && path.resolve(projectRoot,mainProcessPath);
const mainProcessRequired = mainProcessIndex && require(`${mainProcessIndex}`);
//pour étendre les fonctionnalités au niveau du main proceess, bien vouloir écrire dans le fichier projectRoot/electron/main/index.js
const mainProcess = mainProcessRequired && typeof mainProcessRequired =='object'? mainProcessRequired : {};


const quit = ()=>{
    try {
      app.quit();
    } catch(e){
      console.log(e," triing kit app")
    }
}

// Gardez une reference globale de l'objet window, si vous ne le faites pas, la fenetre sera
if(!isValidUrl(pUrl) && !fs.existsSync(indexFilePath)){
    throw {message:`Unable to start the application: index file located at [${indexFilePath}] does not exists : projectRoot = [${projectRoot}], isAsar:[${require.main}]`}
}

//app.disableHardwareAcceleration();

function createBrowserWindow (options){
    const {isMainWindow} = options;
    options = Object.assign({},options);
    const menu = options.menu;
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
    if(options.modal && !options.parent && mainWindow){
      options.parent = mainWindow;
    }
    if(typeof options.show ==='undefined'){
      options.show = false;
    }
    let showOnLoad = options.showOnLoad ===true ? true : undefined;
    if(showOnLoad){
       options.show = false;
    }
    if(typeof mainProcess?.beforeCreateWindow =='function'){
       const opts = Object.assign({},mainProcess.beforeCreateWindow(options));
       options = {...options,...opts};
    }
    options.icon = options.icon || iconPath;
    let window = new BrowserWindow(options);
    if(!menu){
        window.setMenu(null);
        window.removeMenu();
        window.setMenuBarVisibility(false)
        window.setAutoHideMenuBar(true)
    }
    if(showOnLoad){
      window.once('ready-to-show', () => {
          window.show();
          window.webContents.send("window-ready-to-show",JSON.stringify(options.readyToShowOptions));
      });
    }
    window.on('closed', function() {
        if(isMainWindow && typeof mainProcess?.onMainWindowClosed == "function"){
          mainProcess.onMainWindowClosed(window);
        }
        window = null;
    });
    window.webContents.on('context-menu',clipboadContextMenu);
    const url = isValidUrl(options.loadURL) || typeof options.loadURL ==='string' && options.loadURL.trim().startsWith("file://") ? options.loadURL : undefined;
    if(url){
      window.loadURL(url);
    } else if(options.file && fs.existsSync(path.resolve(options.file))){
      window.loadFile(path.resolve(options.file));
    } 
    return window;
}
  
app.whenReady().then(() => {
    createWindow();
    const readOpts = {toggleDevTools,browserWindow:mainWindow,mainWindow:mainWindow};
    if(typeof mainProcess.whenAppReady =='function'){
       mainProcess.whenAppReady(readOpts);
    }
    globalShortcut.register('CommandOrControl+F12', () => {
      return toggleDevTools();
    });
    app.on('activate', function () {
      if (mainWindow == null || (BrowserWindow.getAllWindows().length === 0)) createWindow()
    });
    appIsReady = true;
});

function createWindow () {
    // Créer le browser window
    mainWindow = createBrowserWindow({
      showOnLoad : false,
      loadURL : undefined,
      isMainWindow : true,
      registerDevToolsCommand : false,
      file : indexFilePath,
      url : pUrl,
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
    mainWindow.on('show', () => {
      //mainWindow.blur();
      setTimeout(() => {
        mainWindow.focus();
        mainWindow.moveTop();
        mainWindow.webContents.focus(); 
        if(!hasInitWindows){
          hasInitWindows = true; 
          mainWindow.webContents.send('appReady');
        } 
      }, 200);
    });
  
    mainWindow.on("focus",()=>{
      if(mainWindow && hasInitWindows){
        mainWindow.webContents.send("main-window-focus");
      }
    });
    mainWindow.on("blur",()=>{
      if(mainWindow && hasInitWindows){
        mainWindow.webContents.send("main-window-blur");
      }
    });
    mainWindow.once("ready-to-show",function(){
        if(typeof mainProcess.onMainWindowReadyToShow ==='function'){
            mainProcess.onMainWindowReadyToShow(mainWindow);
        }
        mainWindow.minimize()
        try {
          if(splash && splash instanceof BrowserWindow){
            splash.destroy();
          }
        } catch{ }
        mainWindow.restore();
        mainWindow.show();
    })    
   
    mainWindow.on('close', (e) => {
        if (mainWindow) {
          if(typeof mainProcess.onMainWindowClose == "function"){
            mainProcess.onMainWindowClose(mainWindow);
          }
          e.preventDefault();
          mainWindow.webContents.send('before-app-exit');
        }
    });
    
    mainWindow.on('unresponsive', async () => {
      const { response } = await dialog.showMessageBox({
        title: "L'application a cessé de répondre",
        message : 'Voulez vous relancer l\'application?',
        buttons: ['Relancer', 'Arrêter'],
        cancelId: 1
      });
      if (response === 0) {
        mainWindow.forcefullyCrashRenderer()
        mainWindow.reload()
      } else {
        mainWindow.forcefullyCrashRenderer()
        app.exit();
      }
    });
    
    // Émit lorsque la fenêtre est fermée.
    mainWindow.on('closed', () => {
      mainWindow = null
    })
    mainWindow.setMenu(null);
  
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
        mainWindow.setSize(sizeW.width,sizeW.height);
        if(isNumber(sPositions.x) && isNumber(sPositions.y)){
            mainWindow.setPosition(sPositions.x,sPositions.y);
        }
    }
    const onWinResizeEv =  debounce(function () {
        if(mainWindow){
            let wSize = mainWindow.getSize();
            if(Array.isArray(wSize) && wSize.length == 2){
                let [width,height] = wSize;
                if(width && height){
                    session.set(mWindowSessinName,{width,height});
                }
                let [x,y] = mainWindow.getPosition();
                session.set(mWindowPositionSName,{x,y});
            }
        }
    }, 100);
    mainWindow.off('resize',onWinResizeEv);
    mainWindow.on('resize',onWinResizeEv);
    mainWindow.off('move',onWinResizeEv);
    mainWindow.on('move',onWinResizeEv);
    if(typeof mainProcess.onCreateMainWindow =='function'){
       mainProcess.onCreateMainWindow(mainWindow);
    }
    return mainWindow;
}
  
  const toggleDevTools = (value)=>{
    if(mainWindow !==null && mainWindow.webContents){
      const isOpen= mainWindow.webContents.isDevToolsOpened();
      value = value === undefined ? !isOpen : value;
      if(value && !isOpen){
          mainWindow.webContents.openDevTools();
          return mainWindow.webContents.isDevToolsOpened();
      } else {
          if(isOpen) mainWindow.webContents.closeDevTools();
      }
      return mainWindow.webContents.isDevToolsOpened();
    }
    return false;
  }
  ipcMain.on("toggle-dev-tools",function(event,value) {
    return toggleDevTools(value);
  });
  
  ipcMain.handle("create-browser-windows",function(event,options){
    if(typeof options =='string'){
      try {
        const t = JSON.parse(options);
        options = t;
      } catch{}
    }
    options = Object.assign({},options);
    createBrowserWindow(options);
  });
  
  ipcMain.on("restart-app",x =>{
    app.relaunch();
  });
  let tray = null;
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
           if(mainWindow && mainWindow.webContents) mainWindow.webContents.send("click-on-system-tray-menu-item",{
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
  });
  
  ipcMain.on("get-path",(event,pathName)=>{
    const p = app.getPath(pathName);
    event.returnValue = p;
    return p;
  });
  ipcMain.on("get-project-root",(event)=>{
    event.returnValue  = projectRoot;
    return event.returnValue;
  });
  ipcMain.on("get-electron-project-root",(event)=>{
    event.returnValue = projectRoot;
    return event.returnValue ;
  });
  
  ipcMain.on("get-package.json",(event)=>{
    event.returnValue = JSON.stringify(packageJSON);
    return event.returnValue ;
  });
    
  ipcMain.on("get-app-name",(event)=>{
    event.returnValue = appName;
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
    event.returnValue = mainWindow != mainWindow && mainWindow.getIcon && mainWindow.getIcon();
  });
  ipcMain.on("set-app-icon",(event,iconPath)=>{
     if(iconPath && mainWindow != null){
        mainWindow.setIcon(iconPath);
        event.returnValue = iconPath;
     } else {
        event.returnValue = null;
     }
  });
    
  ipcMain.on('minimize-main-window', () => {
    if(mainWindow !== null && mainWindow){
       mainWindow.blur();
       mainWindow.minimize();
    }
  })
  ipcMain.on('restore-main-window', () => {
    if(mainWindow && mainWindow !== null){
      mainWindow.restore()
      mainWindow.blur();
      setTimeout(() => {
        mainWindow.focus();
        mainWindow.moveTop();
        mainWindow.webContents.focus();   
      }, 200);
    }
  })
  ipcMain.on('close-main-render-process', _ => {
    if(mainWindow){
      mainWindow.destroy();
    }
    mainWindow = null;
    if(typeof gc =="function"){
      gc();
    }
    quit();
  });
  
  const powerMonitorCallbackEvent = (action)=>{
    if(!mainWindow || !mainWindow.webContents) return;
    if(action =="suspend" || action =="lock-screen"){
        mainWindow.webContents.send("main-app-suspended",action);
        return;
    }
    mainWindow.webContents.send("main-app-restaured",action);
    mainWindow.webContents.focus();  
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
    if(mainWindow !== null){
        mainWindow.setTitle(title);
    }
  });
  
  ipcMain.handle("show-open-dialog",function(event,options){
    if(typeof options =="string"){
      try {
         const t = JSON.parse(options);
         options = t;
      } catch{}
    }
    if(!isObj(options)){
       options = {};
    }
    return dialog.showOpenDialog(mainWindow,options)
  })
  
  ipcMain.handle("show-save-dialog",function(event,options){
    if(!isObj(options)){
       options = {};
    }
    return dialog.showSaveDialog(mainWindow,options)
  });
  
  ipcMain.on("is-dev-tools-open",function(event,value) {
    if(mainWindow !==null && mainWindow.webContents){
      return mainWindow.webContents.isDevToolsOpened();
    }
    return false;
  });
  
  ipcMain.on("window-set-progressbar",(event,interval)=>{
     if(typeof interval !="number" || interval <0) interval = 0;
     interval = Math.floor(interval);
     if(mainWindow){
       mainWindow.setProgressBar(interval);
     }
  });
  
  /**** customisation des thèmes de l'application */
  ipcMain.handle('set-system-theme:toggle', (event,theme) => {
    theme = theme && typeof theme == "string"? theme : "light";
    theme = theme.toLowerCase().trim();
    if(theme !== 'system' && theme !=='dark'){
      theme = "light";
    }
    nativeTheme.themeSource = theme;
    session.set("os-theme",theme);
    return nativeTheme.shouldUseDarkColors
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
  
// Quitte l'application quand toutes les fenêtres sont fermées.
app.on('window-all-closed', () => {
    // Sur macOS, il est commun pour une application et leur barre de menu
    // de rester active tant que l'utilisateur ne quitte pas explicitement avec Cmd + Q
    if (process.platform !== 'darwin') {
      quit();
    }
});

if(mainProcess.enableSingleInstance !== false){
    const gotTheLock = app.requestSingleInstanceLock()
    if (appIsReady && !gotTheLock) {
        quit();
    } else {
      app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        //pour plus tard il sera possible d'afficher la gestion multi fenêtre en environnement electron
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
      })
    }
}