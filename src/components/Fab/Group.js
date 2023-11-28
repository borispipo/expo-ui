import { FAB} from 'react-native-paper';
import React from "$react";
import {StyleSheet} from "react-native";
import {defaultStr,isNonNullString,isObj,defaultObj} from "$cutils";
import PropTypes from "prop-types";
import {MENU_ICON} from "$ecomponents/Icon";
import theme,{Colors} from "$theme";
import Group from "./GroupComponent";
import {Portal} from "react-native-paper";
import {isAllowedFromStr} from "$cauth/perms";
import { useIsScreenFocused } from '$enavigation/hooks';
import { useScreen } from '$econtext/hooks';

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
    const screenContext = useScreen();
    let isFocused = useIsScreenFocused(screenName);
    if(!isNonNullString(screenName)){
        isFocused = true;
    }
    if(screenContext && screenContext?.isFocused() === false){
        isFocused = false;
    }
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
    },[]);
    return <Portal>
        <Group
          {...rest}
          color = {color}
          style = {[rest.style,styles.container]}
          fabStyle = {[styles.fab,fabStyle,{backgroundColor},!display || !isFocused  && styles.hidden]}
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
    </Portal>
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