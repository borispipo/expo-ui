/**** auto generated file 
 *  in this file, you can add all main process code you want for your electron application
 *  @export||@return {object}, with properties like this : 
 *  {
 *      splash || splashScreen {function|| instanceOf(BrowserWindow)}, if function, must return an instanceOf BrowserWindow wich will use as application splashcreen
 *      whenReady || appOnReady {function}, function called when electron app is ready 
 * }
*/

module.exports = {
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
        window : {BrowserWindow}, le browser window principal de l'application
    */
    whenReady : function({toggleDevTools,window,win}){
    
    }
}