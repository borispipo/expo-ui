import {get,set} from "./Common/session";
import Icon from "$components/Icon";
import {notify} from "$components/Dialog";
import {isDesktopMedia} from "$platform/dimensions";
import {defaultStr} from "$utils";
import {Menu} from "$components/BottomSheet";
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
    let type = defaultStr(get(typeKey),isDesk? "fixed":'accordion').toLowerCase().trim();
    const rTypes = [
        {...getActiveProps(type,'accordion'),title:"Les éléments de liste s'affichent de manière optimisé pour téléphone mobile",code:'accordion',icon:accordionIcon,label:'Mobile',labelText:'environnement optimisé pour téléphone mobile'},
        {...getActiveProps(type,'table'),title:"Les éléments de listes s'affichent dans un tableau rééel",code:'table',icon:tableIcon,label:'Tableau réel avec pagination'}
    ]  
    Object.map(rendersTypes,(t,i)=>{
        if(isObj(t)){
            if((isDesk && t.desktop) || (!isDesk && t.mobile)){
                rTypes.push({
                    ...t,
                    ...getActiveProps(type,i)
                })
            }
        }
    });
    let typeObj = {};
    Object.map(rTypes,(t)=>{
        if(isObj(t) && t.code == type){
            typeObj = t;
        }
    });
    return <Menu
        title = {"Type d'affichage du tableau"}
        sheet
        items = {rTypes}
        anchor = {(props)=><Icon {...props} name = {typeObj.icon} title={typeObj.title}/>}
        onPressItem = {({item})=>{
            if(isObj(item) && item.code){
                set(typeKey,item.code);
                notify.info("Les éléments de la liste s'afficheront dorénavant en ["+defaultStr(item.labelText,item.label)+"]");
            }
        }}
    />
}

export default DatagridRenderTypeComponent;