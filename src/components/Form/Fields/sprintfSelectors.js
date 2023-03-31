import Date from "$lib/date";
import {defaultObj} from "$cutils";
import appConfig from "$capp/config";
const sprintfSelectors = defaultObj(appConfig.get("sprintfSelectors"));
export default  {
    ...sprintfSelectors,
    "&sdate&" : {
        title : 'Sélectionner une date',
        type : 'field',
        field : {
              type : 'date',
              text : 'Sélectionner une date',
              format : Date.defaultDateFormat
        },
        desc : "remplace le motif par la date qui sera sélectionnée par l'utilisateur au format jj/mm/aaaa",
     },
    "&date&" : "remplace le motif par la date actuelle au format : jj/mm/aaaa",
    "&heure&" : "remplace le motif par l'heure actuelle au format hh:mm:ss",
    "&dateheure&" : "remplace le motif par la date et l'heure actuelle au format : jj/mm/aaaa hh:mm:ss",
}