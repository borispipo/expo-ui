import {save as saveWeb} from "./Fsaver.web";
import {save as saveEelectron} from "./FileSaver.electron";
import {isElectron} from "$cplatform";

export const save = (options,...rest)=> {
    if(isElectron()) return saveEelectron(options,...rest);
    return saveWeb(options,...rest);
}