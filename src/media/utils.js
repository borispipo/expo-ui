import { extendObj } from "$cutils";
import * as ImagePicker from 'expo-image-picker';
/*** retourne les optiosn pour la sélection d'un fchier ou d'un audio */
export const getFilePickerOptions = (options)=>{
    return extendObj({},{
        allowsEditing : true,
        allowsMultipleSelection : false,///web only
        aspect : [4,3], //[number, number]An array with two entries [x, y] specifying the aspect ratio to maintain if the user is allowed to edit the image (by passing allowsEditing: true). This is only applicable on Android, since on iOS the crop rectangle is always a square.
        base64 : false, //Whether to also include the image data in Base64 format.
        exif : false, //Whether to also include the EXIF data for the image. On iOS the EXIF data does not include GPS tags in the camera case.
        mediaTypes : ImagePicker.MediaTypeOptions.All, //@see : https://docs.expo.dev/versions/latest/sdk/imagepicker/#mediatypeoptions
        quality : 1, //Specify the quality of compression, from 0 to 1. 0 means compress for small size, 1 means compress for maximum quality.
    },options);
}
/*** retourne les ooptions pour la capture d'une photo
    @see : https://docs.expo.dev/versions/v49.0.0/sdk/camera/#camerapictureoptions,
*/
export const getTakePhotoOptions = (options)=>{
    const opts = extendObj({},{
        base64 : false, //Whether to also include the image data in Base64 format.
        quality : 0.8, //Specify the quality of compression, from 0 to 1. 0 means compress for small size, 1 means compress for maximum quality.
    },options);
    if(typeof opts.height !=="number"){
        delete opts.height;
    }
    return opts;
}  