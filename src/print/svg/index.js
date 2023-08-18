import {isClientSide,isWeb} from "$cplatform";
import {isDOMElemnet} from "$cutils";
export const  outlineText = function(text,options) {
    if(!isWeb() || !isDOMElemnet()) return null;
    if(isObj(text)){
        options = text;
        text = defaultStr(options.text);
    } 
    options = defaultObj(options);
    if(!isNonNullString(text)) return null;
    var ctx, canvas = document.createElement('canvas');
    canvas.width = 17*text.length;
    canvas.height = 22;
    ctx = canvas.getContext('2d');
    ctx.font = "25px Verdana";
    ctx.lineWidth = 1.5;
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop("0", "magenta");
    gradient.addColorStop("0.5", "blue");
    gradient.addColorStop("1.0", "red");
    ctx.strokeStyle = gradient;
    ctx.strokeText(text, 0, 20);
    ctx.restore();
    return canvas.toDataURL();
};