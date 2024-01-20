import {isObj,isBase64} from "$cutils";
import notify from "$enotify";
import Camera from "./camera";
import {isMobileNative} from "$platform";
import {getFilePickerOptions} from "./utils";
import React from "react";

let cameraRef = null;

export {cameraRef}

export const createCameraRef = ()=>{
    const ref = React.useRef(null);
    React.useEffect(()=>{
        cameraRef = ref.current;
    },[ref.current])
    return ref;
}

import * as ImagePicker from 'expo-image-picker';

export const MEDIA_TYPES = {
    ALL : ImagePicker.MediaTypeOptions.All,
    IMAGES : ImagePicker.MediaTypeOptions.Images,
    VIDEOS : ImagePicker.MediaTypeOptions.Videos,
}

export {ImagePicker};

export function checkPermission (method){
    return new Promise((resolve,reject)=>{
        (typeof method =="function" && method || ImagePicker.requestMediaLibraryPermissionsAsync)().then((r)=>{
            if(isObj(r) && (r.granted || r.status =='granted')){
                resolve(r);
                return true;
            } else {
                reject(r);
            }
        }).catch((e)=>{
            console.log(e," unable to grand media permission");
            notify.error("Permission à l'accès aux médias refusée par l'utilisateur");
            reject(e);
        });
    })
}

export * from "./utils";

const prepareImageResult = (result)=>{
    if(!isObj(result)) return result;
    result.dataURL = result.dataUrl = isBase64(result.base64) ? ('data:image/jpeg;base64,'+result.base64) : undefined;
    return result;
}

/**** @see : https://docs.expo.dev/versions/latest/sdk/imagepicker/#imagepickeroptions 
 *  form more options.
 */
export const pickImageOrVideo = (options)=>{
    return checkPermission().then(()=>{
        return new Promise((resolve,reject)=>{
            ImagePicker.launchImageLibraryAsync(getFilePickerOptions(options)).then((result)=>{
                if(!result.cancelled) {
                    resolve(prepareImageResult(result));
                } else {
                    notify.warning("Opération annulée par l'utilisateur");
                    reject(result);
                }
                return null;
            }).catch(reject);
        })
    })
}

export const pickImage = (options)=>{
    options = defaultObj(options);
    options.mediaTypes = ImagePicker.MediaTypeOptions.Images;
    return pickImageOrVideo(options)
}

export const pickVideo = (options)=>{
    options = defaultObj(options);
    options.mediaTypes = ImagePicker.MediaTypeOptions.Videos;
    return pickImageOrVideo(options)
}

export const nonZeroMin = function(args){
    let arra = Array.prototype.slice.call(arguments,0).sort();
    let min = 0;
    for(let i in arra){
       if(isNumber(arra[i]) && arra[i] > 0) {
           if(min <= 0){
             min = arra[i]
           } else if(arra[i]< min ){
              min = arra[i]
           }
       }
    }
    return min;
};

export {Camera};

export async function canTakePhoto(){
    if(!isMobileNative()) return false;
    return true;
}

export const takePhoto = (options)=>{
    return new Promise((resolve,reject)=>{
        return checkPermission(ImagePicker.requestCameraPermissionsAsync).then((perm)=>{
            options = {base64:true,...Object.assign({},options)}
            return ImagePicker.launchCameraAsync({...getFilePickerOptions(options)}).then((result)=>{
                if(!result.cancelled) {
                    resolve(prepareImageResult(result));
                } else {
                    notify.warning("Opération annulée par l'utilisateur");
                    reject(result);
                }
                return null;
            })
        }).catch(reject);
    })
}

export const takePicture = takePhoto;