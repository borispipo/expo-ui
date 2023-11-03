import { FAB} from 'react-native-paper';
import React from "$react";
import {StyleSheet,useWindowDimensions,Modal} from "react-native";
import {defaultStr,isNonNullString,isObj,defaultObj} from "$cutils";
import PropTypes from "prop-types";
import {MENU_ICON} from "$ecomponents/Icon";
import theme,{Colors} from "$theme";
import Group from "./GroupComponent";
import {Portal} from "react-native-paper";
import {isAllowedFromStr} from "$cauth/perms";

const activeRef = {current:null};

export const isValid = (context)=>{
    if(!isObj(context) || !isNonNullString(context.fabId) || typeof context.show !=="function" || context.hide !="function") return false;
    return true;
}
/*** retourne le fab d'ont l'id est passé en paramètre */
export const getFab = (fabId)=>{
    if(!isNonNullString(fabId)) return null;
    return isValid(allFabs[fabId])? allFabs[fabId] : null;
}
const allFabs = {};
///les ids des fabs
const fabIdRefs = {current:[]};

//ajoute l'id du fab dans la lite des fabActif
export const activateFabId = (fabId)=>{
    if(!isNonNullString(fabId)) return fabIdRefs.current;
    const nIds = desactivateFabId(fabId);
    ///le fab active devient en top des id
    nIds.push(fabId);
    fabIdRefs.current = nIds;
}

export const desactivateFabId = (fabId)=>{
    if(!isNonNullString(fabId)) return fabIdRefs.current;
    const nIds = [];
    for(let i in fabIdRefs.current){
        if(fabIdRefs.current[i] != fabId){
            nIds.push(fabIdRefs.current[i]);
        }
    }
    fabIdRefs.current = nIds;
    return nIds;
}

export const isActive = (fabId)=>{
    return isNonNullString(fabId) && fabIdRefs.current[fabIdRefs.current.length-1] == fabId && isValid(getFab(fabId));
}

export const MANAGER = {
    get active (){
        return activeRef.current;
    },
    ///la liste des fabs
    get all (){
        return allFabs;
    },
    ///la liste des fabs Id
    get fabIds (){
        return fabIdRefs.current;
    },
    set active(active){
        active = isValid(active)? active : null;
        if(active){
            ///on désactive l'ancien fab qui était actif
            if(isValid(activeRef.current)){
                activeRef.current.hide();
            }
            activateFabId(active.fabId);
            activeRef.current = active;
        } else {
            //l'ancien fab devient active
            let length = fabIdRefs.current.length-1;
            let prevActive = null,prevFabId = null;
            ///ça veut dire que l'ancien fab active a été démonté
            if(isValid(activeRef.current)){
                prevFabId = activeRef.current.fabId
            }
            while(length >=0 && !isValid(prevActive)){
                const fId = fabIdRefs.current[length];
                if(isNonNullString(fId) && fId !== prevFabId){
                    prevActive = allFabs[fId];
                    if(isValid(prevActive)){
                        break;
                    }
                }
                length --;
            }   
            if(!prevActive){
                fabIdRefs.current = [];
                Object.map(allFabs,(f,i)=>{
                    delete allFabs[i];
                })
            }
            if(isValid(prevActive)){
                prevActive.show();
                activateFabId(prevActive.fabId);
            }
            activeRef.current = prevActive;
        }
    },
    get hasActive(){
        return isValid(activeRef.current);
    },
    get get (){
        return getFab;
    }
};

export const activate = (args)=>{
    const {context,fabId} = args;
    if(!isNonNullString(fabId)|| !isObj(context)) return false;
    let hasFound = false;
    for(let i in allFabs){
       if(allFabs[i]?.fabId == fabId){
         hasFound = true;
         break;
       }
    }
}
const FabGroupComponent = React.forwardRef((props,innerRef)=>{
    let {openedIcon,screenName,fabId,display:customDisplay,onMount,onUnmount,primary,actionMutator,secondary,onOpen,prepareActions,fabStyle,open:customOpen,onClose,onStateChange:customOnStateChange,closedIcon,color,actions:customActions,children,...customRest} = props;
    const fabIdRef = React.useRef(defaultStr(fabId,uniqid("fab-id-ref")));
    fabId = fabIdRef.current;
    const isMountedRef = React.useRef(false);
    const [state, setState] = React.useState({ 
        open: typeof customOpen =='boolean'? customOpen : false,
        display : typeof customDisplay ==='boolean'? customDisplay : true,
    });
    const onStateChange = ({ open,...rest}) => {
        if(state.open == open) return;
        setState({ ...state,open });
        if(customOnStateChange){
            customOnStateChange({open,...rest})
        } else if(!open && onClose){
            onClose({open,...rest})
        }
    };
    const context = {
        open:x=>setState({...state,open:true}),
        close : x=> {setState({...state,open:false})},
        fabId,
        id : fabId,
        hide : x=> {
            setState({...state,display:false})
        },
        show : ()=>{
            setState({...state,display:true})
        },
        isHidden : x => !state.display,
        isShown : x => state.display,
        isVisible : x=> state.display,
        isClosed : x => !state.open,
        isOpened : x => state.open,
    }
    allFabs[fabId] = context;
    const {open,display} = state;
    openedIcon = defaultStr(openedIcon,"close");
    closedIcon = defaultStr(closedIcon,MENU_ICON);
    const rest = defaultObj(customRest);
    fabStyle = Object.assign({},StyleSheet.flatten(fabStyle));
    let backgroundColor = Colors.isValid(fabStyle.backgroundColor)? fabStyle.backgroundColor : undefined;
    color = Colors.isValid(color)? color : undefined;
    if(!backgroundColor || primary){
        backgroundColor = theme.colors.primary;
        color = theme.colors.onPrimary;
    } else if(secondary){
        backgroundColor = theme.colors.secondary;
        color = theme.colors.onSecondary;
    }
    const actions = React.useMemo(()=>{
        if(!open) return []
        const actions =  prepareActions === false && Array.isArray(customActions)? customActions : [];
        if((prepareActions !== false || !actions.length)){
            Object.map(customActions,(act,i)=>{
                if(!isObj(act) || (!act.icon && !act.label && !act.text)) return null;
                act.label = defaultStr(act.label,act.text);
                const a = actionMutator ? actionMutator ({action:act,key:i,isFab:true,fab:true}) : act;
                if(!isObj(a) || !isNonNullString(a.label)) return null;
                const {perm,isAllowed,primary,secondary,...restItem} = a;
                if(typeof isAllowed =='function' && isAllowed() === false) return null;
                if(isNonNullString(perm) && !isAllowedFromStr(perm)) return false;
                if(primary){
                    restItem.style = StyleSheet.flatten([restItem.style,{color:theme.colors.onPrimary,backgroundColor:theme.colors.primary}])
                } else if(secondary){
                    restItem.style = StyleSheet.flatten([restItem.style,{color:theme.colors.onSecondary,backgroundColor:theme.colors.secondary}])
                }
                if(isAllowed === false) return null;
                actions.push(restItem);
            }); 
        }
        return actions;
    },[customActions,prepareActions,open]);
    
    React.useEffect(()=>{
        onMount && onMount(context);
        React.setRef(innerRef,context);
        isMountedRef.current = true;
        return ()=>{
            onUnmount && onUnmount({fabId});
            delete allFabs[fabId];
            desactivateFabId(fabId);
            isMountedRef.current = false;
            React.setRef(innerRef,null);
        }
    },[])
    React.useEffect(()=>{
        if(display){
            MANAGER.active = context;
        } else {
            MANAGER.active = null;
        }
    },[display]);
    return <Group
        {...rest}
        color = {color}
        style = {[rest.style,styles.container]}
        fabStyle = {[styles.fab,fabStyle,{backgroundColor},!display && styles.hidden]}
        open={open ?true : false}
        icon={open ? openedIcon : closedIcon}
        actions={actions}
        onStateChange={onStateChange}
        onPress={(e) => {
          context.opened = open;
          if (open && onOpen) {
            onOpen(e);
          }
        }}
      />
});
const actionType = PropTypes.shape({
    icon : PropTypes.string,
    label : PropTypes.string,
    text : PropTypes.string,
    primary : PropTypes.bool,
    secondary : PropTypes.bool,
    onPress : PropTypes.func,
    small : PropTypes.bool,
});
FabGroupComponent.propTypes = {
    ...defaultObj(FAB.Group.propTypes),
    fabId : PropTypes.string,//l'id du fab
    onMount : PropTypes.func, ///lorsque le composant est monté
    onUnmount : PropTypes.func, //lorsque le composant est démonté
    actionMutator : PropTypes.func,
    prepareActions : PropTypes.bool, //si un retraitement sera effectué sur les actions du FAB
    onOpen : PropTypes.func,
    onClose : PropTypes.func,
    onStateChange : PropTypes.func,
    color : PropTypes.string,
    openedIcon : PropTypes.string,
    closedIcon : PropTypes.string,
    actions : PropTypes.oneOfType([
        PropTypes.objectOf(actionType),
        PropTypes.arrayOf(actionType)
    ])
}

const styles = StyleSheet.create({
    container : {
        marginHorizontal:0,
        marginVertical : 0,
    },
    row: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    hidden : {
        display : 'none'
    },
    fab : {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    }
})

export default FabGroupComponent;

FabGroupComponent.displayName ="FabGroupComponent";