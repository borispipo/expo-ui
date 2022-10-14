import Icon from "$ecomponents/Icon";
import React from "$react";
import sync from "$database/sync";
//import SyncInfos from "$ecomponents/Data/SyncInfos";

export default {
    icon : 'cloud-sync',
    label : 'Synchroniser',
    /*right :  (props) => <Icon 
        {...props}
        icon ="information-outline" 
        title="Cliquez pour afficher les informations relatives à la synchronisation des données." 
    />,*/
    onPress:(e)=>{
        React.stopEventPropagation(e);
        sync.run();
        return false;
        //mountDialog(<SyncInfos key={uniqid("sync-infos-k")}/>,"synch-data-dialog-id-mount")/>
    } ,
}