import {save as saveWeb} from "./Fsaver.web";
import {isElectron} from "$cplatform";

export const save = (options,...rest)=>{
    if(!isElectron() || typeof window?.ELECTRON =="undefined" || typeof window?.ELECTRON?.FILE !=="object" || typeof window?.ELECTRON?.FILE?.write !=="function") return saveWeb(options,...rest);
    return ELECTRON.FILE.write(options,...rest);
}