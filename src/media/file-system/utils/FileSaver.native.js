import { Directories,FileSystem } from "./native";
import {defaultStr} from "$cutils";
import p from "../path";

export const saveBlob = ({content,fileName,path,timeout,delay})=>{
    path = defaultStr(path,Directories.DOCUMENTS).trim().rtrim("/");
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
    return FileSystem.writeAsStringAsync(path,content?.toString())
}