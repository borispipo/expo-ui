import {isObj} from "$utils";
import {notify} from "$components/Dialog";
import Camera from "./camera";
import {isMobileNative} from "$platform";
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

const ImagePicker = {
    MediaTypeOptions : {},
    mediaTypes : {},
};
///import * as ImagePicker from 'expo-image-picker';

export const MEDIA_TYPES = {
    ALL : ImagePicker.MediaTypeOptions.All,
    IMAGES : ImagePicker.MediaTypeOptions.Images,
    VIDEOS : ImagePicker.MediaTypeOptions.Videos,
}

export {ImagePicker};

export function checkPermission (){
    return new Promise((resolve,reject)=>{
        ImagePicker.requestMediaLibraryPermissionsAsync().then((r)=>{
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

/**** @see : https://docs.expo.dev/versions/latest/sdk/imagepicker/#imagepickeroptions 
 *  form more options.
 */
export const pickImageOrVideo = (options)=>{
    return checkPermission().then(()=>{
        return new Promise((resolve,reject)=>{
            ImagePicker.launchImageLibraryAsync(extendObj({},{
                allowsEditing : true,
                allowsMultipleSelection : false,///web only
                aspect : [4,3], //[number, number]An array with two entries [x, y] specifying the aspect ratio to maintain if the user is allowed to edit the image (by passing allowsEditing: true). This is only applicable on Android, since on iOS the crop rectangle is always a square.
                base64 : false, //Whether to also include the image data in Base64 format.
                exif : false, //Whether to also include the EXIF data for the image. On iOS the EXIF data does not include GPS tags in the camera case.
                mediaTypes : ImagePicker.MediaTypeOptions.All, //@see : https://docs.expo.dev/versions/latest/sdk/imagepicker/#mediatypeoptions
                quality : 1, //Specify the quality of compression, from 0 to 1. 0 means compress for small size, 1 means compress for maximum quality.
            },options)).then((result)=>{
                if(!result.cancelled) resolve(result);
                else {
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
    const canTake = await Camera.isAvailableAsync();
    return canTake;
    return isMobileNative() || canTake;
}

export const takePhoto = (options)=>{
    console.log(cameraRef," is camera ref")
    if(!cameraRef){
        return Promise.reject({
            msg : "Camera non initialisée"
        })
    }
    return new Promise((resolve,reject)=>{
        (async ()=>{
            let takeP = await canTakePhoto();
            if(takeP){
                //const types = await Camera.getAvailableCameraTypesAsync();
                //console.log(types," is stypes hein")
                const permission = await Camera.requestCameraPermissionsAsync();
                if(permission.status === 'granted' || permission.granted){
                    return cameraRef.takePictureAsync(options).then(resolve).catch(reject);
                } else {
                    notify.error("Impossible d'utiliser l'appareil photo car vous avez interdit l'utilisation de votre camera.")
                    reject(permission)
                }
            }
        })();
    })
}

