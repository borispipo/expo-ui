import APP from "$app";
import { screenName as aboutScreenName} from "$escreens/Help/About";
import i18n from "$i18n";
import theme from "$theme";

const refresh = (force)=>{
    const name = APP.getName();
    return [
        {
            label : name,
            icon : 'view-dashboard',
            title : 'Dashboard',
            routeName : "Home",
            divider : true,
        },
        {
            divider : true,
        },
        {
            key : 'dataHelp',
            label : 'Aide',
            section : true,
            divider : false,
            items : [
                /*{
                    icon : 'timeline-help',
                    label : name+", Mises à jour",
                },*/
                {
                    icon : 'help',
                    label : 'A propos de '+name,
                    routeName : aboutScreenName,
                }
            ]
        }
    ]
}

export default refresh;