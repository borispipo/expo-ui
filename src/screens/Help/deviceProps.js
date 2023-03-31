import appConfig from "$capp/config";
import {defaultObj, extendObj} from "$cutils";
/*** par défaut, il est possible de spécifier les devices props personnalisés pour l'application.
 * Il suffit de les définir dans la props deviceProps du fichier de configuration de l'application
 */
const defaultProps = defaultObj(appConfig.get("deviceProps"));
export default  extendObj({
    computerName : "Nom de l'ordinateur",
    operatingSystem : "Système d'exploitation",
    osVersion : "Version",
    model : "Model", //le model du device
    platform : "Plateforme", 
    computerUserName : "Utilisateur connecté au système",
    deviceId : "ID du poste de travail",
    id : "Id application", //le bundle id de l'application
    name : "Nom de l'application", //display name of the app
    version : "Version de l'application",
    uuid : "Unique id du poste de travail",
},defaultProps);