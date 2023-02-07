import APP from "$capp/instance";
import i18n from "$i18n";
import {isNonNullString} from "$cutils";

export const getTitle = x => APP.name+" "+APP.version+"/"+i18n.lang("login");
export const title = getTitle();

export const screenName = "UserProfile";

export const hasResource = (permAction,resource)=>{
    if(!isNonNullString(permAction) || !isNonNullString(resource)) return false;
    permAction = permAction.toLowerCase().trim();
    resource = resource.toLowerCase().trim();
    return permAction == resource || permAction.startsWith(resource.rtrim("/")+"/");
}

export const defaultActions = {
    create : {
        text : 'Créer',
    },
    update : {
        text : 'Modifier',
        alias : 'edit',
    },
    delete : {
        text : 'Supprimer',
        alias : 'remove'
    },
    read : {
        text : 'Consulter',
    },
    exporttoexcel : {
        text : "Exporter au format Excel",
        tooltip : "Peut exporter au format excel",
        alias : 'exportexcel'
    },
    exporttopdf : {
        text : "Exporter au format pdf",
        tooltip : "Peut exporter au format pdf",
        alias : 'exportpdf'
    },
}