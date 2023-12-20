/**** auto generated file 
 *  in this file, you can add all main process code you want for your electron application
 *  @export||@return {object}, with properties like this : 
 *  {
 *      splash || splashScreen {function|| instanceOf(BrowserWindow)}, if function, must return an instanceOf BrowserWindow wich will use as application splashcreen
 *      whenReady || appOnReady {function}, function called when electron app is ready 
 * }
*/

module.exports = {
    enableSingleInstance: true, // si l'application n'autorise qu'une seule instance active. ça sous entend qu'à l'instant t, une seule instance de l'application ne peut être exécutée sur le profil de l'utilisateur lambda
    /**** cette fonction est appelée à chaque fois que l'on désire créer une instance du BrowserWindow
        @param {object} BrowserWindowOptions
        Lors de la création de la fenêtre principal, BrowserWindowOptions continent la propriété isMainWindow à true
        la prop isMainWindow {boolean} spécifie s'il s'agit de la fenêtre principale
        la prop isPDFWindow {boolean}, spécifie s'il s'agit de la fenêtre destinée à l'affichage d'un fichier pdf
        l'objet retourné est utilisé pour étendre les options à utiliser pour la création du BrowserWidow
        @return {object};
    */
    beforeCreateWindow : function({isMainWindow,isPDFWindow,...BrowserWindowOptions}){
        return {};
    },
    /*** exécutée lorsque  l'évènement ready-to-show de la fenêtre principale BrowserWindow est appelée
        @param {Instance of BrowserWindow} mainBrowserWindow
    */
    onMainWindowReadyToShow : function(mainBrowserWindow){},
    /**** exécutée lorsque l'évènement close de la fenêtre principale est appelée
         @param {Instance of BrowserWindow} mainBrowserWindow
    */
    onMainWindowClose : function(mainBrowserWindow){},
    /**** exécutée lorsque  l'évènement closed de la fenêtre principale est appélée
        @param {InstanceOf BrowserWindow} mainBrowserWindow
    */
    onMainWindowClosed : function(mainBrowserWindow){},
    /***** 
        must return an Instance of Browser window
        width: 500, height: 400, transparent: true, frame: false, alwaysOnTop: true
        @param {width{number|500},{height{number|400}},transparent{boolean|true}, frame{boolean|false}, alwaysOnTop{boolean|true}}
        @return {InstanceOf(BrowserWindow)}
    */
    splashScreen : function({width, height, transparent, frame, alwaysOnTop}){
        return null;
    },
    /*** this function is called when app is ready 
        toggleDevTools : {function},la fonction permettant de toggle les outils de developements
        browserWindow|mainWindow : {BrowserWindow}, le browser window principal de l'application
    */
    whenAppReady : function({toggleDevTools,browserWindow,mainWindow}){},
    /*** exécutée une fois que la fonction createWindow est appelée pour créer le main Browser window de l'application
        @param {InstanceOf BrowserWindow} mainBrowserWindow
    */
    onCreateMainWindow : function(mainBrowserWindow){
    
    }
}