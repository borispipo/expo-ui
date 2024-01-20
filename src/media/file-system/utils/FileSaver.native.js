import { Directories,FileSystem } from "./native";
import {defaultStr,defaultBool,isBase64} from "$cutils";
import p from "../path";
import * as Sharing from 'expo-sharing';

export const save = ({content,isBase64:isB64,share,directory,fileName,path})=>{
    path = defaultStr(path,directory,Directories.DOCUMENTS).trim().rtrim("/");
    share = defaultBool(share,true);
    let foundDirectory = null,dirToMake = null;
    for(let i in Directories){
        if(path.includes(Directories[i].rtrim("/"))){
           foundDirectory = Directories[i];
           break;
        }
    }
    if(!foundDirectory){
       path = Directories.DOCUMENTS;
    } else {
        dirToMake = path.split(foundDirectory)[1];
        path = foundDirectory;
        if(dirToMake){
            const dd = [];
            dirToMake = dirToMake.replaceAll("\\","/").trim().split("/").filter((d)=>{
                d = d.trim().rtrim("/").ltrim("/");
                if(d){
                    dd.push(d);
                    return true;
                }
                return false;
            });
            dirToMake = dd;
        } else dirToMake = null;
    }
    const success = ()=>{
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
    if(Array.isArray(dirToMake) && dirToMake.length){
        return new Promise((resolve,reject)=>{
            const next = ()=>{
                if(!dirToMake.length){
                    return success().then(resolve).catch(reject);
                }
                const dir = dirToMake.shift();
                path = p.join(path,dir);
                return FileSystem.makeDirectoryAsync(path,{ intermediates: true }).then(next).catch(reject);
            }
            return (typeof FileSystem.requestDirectoryPermissionsAsync == "function"? FileSystem.requestDirectoryPermissionsAsync: ()=>Promise.resolve(({directoryUri:path,granted:true})))(path).then(({directoryUri,granted})=>{
                if(granted){
                    path = directoryUri;
                    return next();
                }
                return {message:`Accès au repertoire ${path} non autorisé par l'utilisateur`}
            }).catch(reject);
        });
    }
    return success();
}