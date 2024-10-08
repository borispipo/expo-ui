import {get,set} from "./Common/session";
import Icon from "$ecomponents/Icon";
import notify from "$enotify";
import {isDesktopMedia} from "$cplatform/dimensions";
import {defaultStr} from "$cutils";
import {Menu} from "$ecomponents/BottomSheet";
import {accordionIcon,tableIcon,typeKey} from "./RenderTypes/utils";
import rendersTypes from "./RenderTypes";;

const getActiveProps = (type,currentType)=>{
    if(currentType == type){
        return {primary:true}
    }
    return {};
}
const DatagridRenderTypeComponent = (props)=>{
    const isDesk = isDesktopMedia();
    let type = defaultStr(get(typeKey),isDesk? "table":'accordion').toLowerCase().trim();
    if(!["accordion","table"].includes(type)){
        type = "auto";
    }
    const rTypes = [
        {...getActiveProps(type,'accordion'),tooltip:"Les éléments de liste s'affichent de manière optimisé pour téléphone mobile",code:'accordion',icon:accordionIcon,label:'Mobile',labelText:'environnement optimisé pour téléphone mobile'},
        {...getActiveProps(type,'table'),tooltip:"Les éléments de listes s'affichent dans un tableau",code:'table',icon:tableIcon,label:'Tableau'},
        {...getActiveProps(type,'auto'),tooltip:"Les éléments de listes s'affichent de fasson automatique en fonction de la taille de l'écran",code:'auto',icon:"material-wb-auto",label:'Automatique'}
    ]  
    let typeObj = {};
    Object.map(rTypes,(t)=>{
        if(isObj(t) && t.code == type){
            typeObj = t;
        }
    });
    return <Menu
        tooltip = {"Type d'affichage du tableau"}
        sheet
        items = {rTypes}
        anchor = {(props)=><Icon {...props} name = {typeObj.icon} tooltip={typeObj.tooltip}/>}
        onPressItem = {({item})=>{
            if(isObj(item) && item.code){
                set(typeKey,item.code);
                notify.info("Les éléments de la liste s'afficheront dorénavant en ["+defaultStr(item.labelText,item.label)+"]");
            }
        }}
    />
}

export default DatagridRenderTypeComponent;