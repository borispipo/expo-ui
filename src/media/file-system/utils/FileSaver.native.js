import { Directories,FileSystem } from "./native";
import {defaultStr} from "$cutils";
import p from "../path";
import * as Sharing from 'expo-sharing';

export const saveBlob = ({content,share,directory,fileName,path})=>{
    path = defaultStr(path,directory,Directories.DOCUMENTS).trim().rtrim("/");
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
    return new Promise((resolve,reject)=>{
        const fr = new FileReader();
        fr.onload = () => {
          return FileSystem.writeAsStringAsync(path, fr.result.split(',')[1], { encoding: FileSystem.EncodingType.Base64 }).then((r)=>{
            setTimeout(()=>{
                if(share){
                    Sharing.shareAsync(path);
                }
            },0);
            resolve({fileName,path});
          }).catch(reject);
        };
        fr.onerror(reject);
        fr.readAsDataURL(content);
    });
}