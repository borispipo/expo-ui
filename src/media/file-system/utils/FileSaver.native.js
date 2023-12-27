import { Directories,FileSystem } from "./native";
import {defaultStr,defaultBool,isBase64} from "$cutils";
import p from "../path";
import * as Sharing from 'expo-sharing';

export const save = ({content,isBase64:isB64,share,directory,fileName,path})=>{
    path = defaultStr(path,directory,Directories.DOCUMENTS).trim().rtrim("/");
    share = defaultBool(share,true);
    let hasFound = false;
    for(let i in Directories){
        if(path.includes(Directories[i].rtrim("/"))){
           hasFound = true;
           break;
        }
    }
    if(!hasFound){
       path = Directories.DOCUMENTS;
    }
    path = p.join(path,fileName);
    const cb = (r,resolve)=>{
        setTimeout(()=>{
            if(share){
                Sharing.shareAsync(path);
            }
        },0);
        const r2 = {fileName,path,result:r};
        typeof resolve =='function' && resolve(r2);;
        return r2;
    }
    if(isB64 || isBase64(content)){
        return FileSystem.writeAsStringAsync(path,content,{ encoding: FileSystem.EncodingType.Base64 }).then(cb);
    }
    return new Promise((resolve,reject)=>{
        const fr = new FileReader();
        fr.onload = () => {
          return FileSystem.writeAsStringAsync(path, fr.result.split(',')[1], { encoding: FileSystem.EncodingType.Base64 }).then((r)=>{
            return cb(r,resolve);
          }).catch(reject);
        };
        fr.onerror(reject);
        fr.readAsDataURL(content);
    });
}