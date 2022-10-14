import APP from "$capp/instance";
import i18n from "$i18n";

export const getTitle = x => APP.name+" "+APP.version+"/"+i18n.lang("login");
export const title = getTitle();