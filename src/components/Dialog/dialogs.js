import {isFunction,defaultArray,isNonNullString} from "$cutils";

const isDialog = dialog => dialog && typeof dialog !='boolean' && dialog.getId && dialog.getId() ? true : false;
const dialogs = {
    current : null, //la boîte de dialogue actuelle
    previous : null, //la boîte de dialogue précédente,
    all : [], //la liste des Dialogs overts,
    /*** retourne la dernière boîte de dialogue */
    get current (){
        dialogs.all = defaultArray(dialogs.all);
        if(dialogs.all.length > 0) return dialogs.all[dialogs.all.length-1]
        return null;
    },
    /*** définit la boîte de dialogue active */
    set current(dialog){
        return setCurrentDialog.call(APP,dialog)
    },
    /*** Démonte la boîte de dialogue passée en paramètre
     *  @param dialog, si dialog est omi alors c'est la boîte de dialogue active qui est supprimée
    */
    unmount :function(dialog){
        return unmountDialog.call(APP,dialog);
    },
    isDialog,
    isValid : isDialog,
    isCurrentActive :(dialog)=>{
        return dialogs.current && dialogs.current.isVisible()? true : false;
    },
    /**** si la boîte de dialogue passé en paramètre est active */
    isActive : (dialog)=>{
        return isDialog(dialogs.current) && isDialog(dialog) && dialog.getId() === dialogs.current.getId() && dialog.isVisible()? true : false;
    }
};


export const setCurrentDialog = dialogs.mount = dialogs.setCurrent = (dialog)=>{
    if(isDialog(dialog) && dialog.isVisible() && dialogs.current !== dialog){
        let _d = [];
        dialogs.all = defaultArray(dialogs.all);
        for(let i in dialogs.all){
            if(dialogs.all[i] && dialogs.all[i].getId() != dialog.getId() && dialogs.all[i].isVisible()){
                _d.push(dialogs.all[i]);
            }
        }
        _d.push(dialog);
        dialogs.all = _d;
        return true;
    }
    return false;
}

export const unmountDialog = window.unmountDialog = (dialog) =>{
    let _d = [];
    dialog = isDialog(dialog) && isFunction(dialog.isVisible) ? dialog : dialogs.current;
    let hasFound = false;
    if(dialog){
        dialogs.all = defaultArray(dialogs.all);
        for(let i in dialogs.all){
            if(dialogs.all[i] && dialogs.all[i].getId() == dialog.getId()){
                hasFound = true;
            } else if(dialogs.all[i] && dialogs.all[i].isVisible()){
                _d.push(dialogs.all[i]);
            }
        } 
    }
    dialogs.all = _d;
    return hasFound;
}

export default dialogs;