import html2canvas from "html2canvas";
import { isNonNullString,defaultObj } from "$cutils";
/***
    @param : view, les options de la vie
    @param {object} : 
        options (object) --
        An optional map of optional options
        format (string) -- "png" | "jpg" | "webm", defaults to "png", "webm" supported only on Android.
        quality (number) -- Number between 0 and 1 where 0 is worst quality and 1 is best, defaults to 1
        result (string) -- The type for the resulting image. - 'tmpfile' -- (default) Return a temporary file uri. - 'base64' -- base64 encoded image. - 'data-uri' -- base64 encoded image with data-uri prefix.
        height (number) -- Height of result in pixels
        width (number) -- Width of result in pixels
        snapshotContentContainer (bool) -- if true and when view is a ScrollView, the "content container" height will be evaluated instead of the container height
*/
export async function captureRef(view, options) {
  options = defaultObj(options);
  if (options.result === "tmpfile") {
    return Promise.reject({message : `Tmpfile is not implemented for web. Try base64 or file.\nFor compatibility, it currently returns the same result as data-uri`})
  }
  if(!isNonNullString(options.format) || !["png","jpg","webm"].includes(options.format.toLowerCase())){
    options.format = "png";
  } else options.format = options.format.toLowerCase();
  options.quality = typeof options.quality =="number"? options.quality : 1;
  if(!isNonNullString(options.result) || !['base64','data-uri'].includes(options.result.toLowerCase())){
    options.result = "data-uri";
  } else options.result = options.result.toLowerCase();
  // TODO: implement snapshotContentContainer option
  const h2cOptions = {};
  if(typeof options.width =="number"){
    h2cOptions.width = options.width;
  }
  if(typeof options.height =="number"){
    h2cOptions.height = options.height;
  }
  if(typeof options.x =="number"){
    h2cOptions.x = options.x;
  }
  if(typeof options.y =='number'){
    h2cOptions.y = options.y;
  }
  return html2canvas(view, h2cOptions).then((renderedCanvas)=>{
    if (false && options.width && options.height) {
        // Resize result
        const resizedCanvas = document.createElement('canvas');
        const resizedContext = resizedCanvas.getContext('2d');
        resizedCanvas.height = options.height;
        resizedCanvas.width = options.width;
        console.log(options.width," is dddd ",options);
        resizedContext.drawImage(renderedCanvas, 0, 0, resizedCanvas.width, resizedCanvas.height);
        renderedCanvas = resizedCanvas;
      }
      const dataUrl = renderedCanvas.toDataURL("image/" + options.format, options.quality);
      console.log(dataUrl," is ddddddddddd")
      if (options.result === "data-uri" || options.result === "tmpfile") return dataUrl;
      return dataUrl.replace(/data:image\/(\w+);base64,/, '');
  });
}

export function captureScreen(options) {
  return captureRef(window.document.body, options);
}

export function releaseCapture(uri) {
  return null;
}

export default {
  captureRef,
  captureScreen,
  releaseCapture
}