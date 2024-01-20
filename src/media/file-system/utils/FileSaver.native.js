import { Directories,FileSystem } from "./native";
import {defaultStr,defaultBool,isBase64} from "$cutils";
import p from "../path";
import * as Sharing from 'expo-sharing';

export const save = ({content,isBase64:isB64,share,directory,fileName,path})=>{
    path = defaultStr(path,directory,Directories.DOCUMENTS).trim().rtrim("/");
    share = defaultBool(share,true);
    let foundDirectory = null,dirToMake = null;
    fileName = defaultStr(fileName).replaceAll("\\","/").trim();
    for(let i in Directories){
        const dir = Directories[i].rtrim("/");
        if(fileName.includes(dir)){
            path = Directories[i];
            const fName = fileName.split(Directories[i])[1];
            const spl = fName.trim().ltrim("/").rtrim("/").split("/");
            fileName = spl.pop();
            path = p.join(path,spl);
            break;
        }
        if(path.includes(dir)){
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
                const makeDir = ()=>FileSystem.makeDirectoryAsync(path,{ intermediates: true });
                // Checks if gif directory exists. If not, creates it
                return new Promise((r,err)=>{
                    return FileSystem.getInfoAsync(path).then((info)=>{
                        if(info.exists){
                            return r(info);
                        } else {
                            return makeDir().then(r);
                        }
                    }).catch((e)=>{
                        return makeDir().then(r).catch(err);
                    });
                }).then(next).catch(reject);
            }
            return next();
        });
    }
    return success();
}