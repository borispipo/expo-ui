module.exports = function(ELECTRON){
    ELECTRON = defaultObj(ELECTRON);
    let r = {
        file : require("./file"),
        printer : require("./printer"),
        email : require("./email")
    }
    for(let i in r) {
        let iU = i.toUpperCase();
        if((r[i]) && !ELECTRON[iU]){
            Object.defineProperties(ELECTRON,{
                [iU] : {
                    value : r[i],writable:false,override:false
                }
            })
        }
    }
    require("./desktopCapturer")(ELECTRON)
}
