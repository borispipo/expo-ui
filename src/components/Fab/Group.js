import { FAB} from 'react-native-paper';
import React from "$react";
import {StyleSheet,useWindowDimensions,Modal} from "react-native";
import {defaultStr,isNonNullString,isObj,defaultObj} from "$utils";
import PropTypes from "prop-types";
import {MENU_ICON} from "$ecomponents/Icon";
import theme,{Colors} from "$theme";
import Group from "./GroupComponent";
import Portal from "$ecomponents/Portal";
import Auth from "$cauth";

const FabGroupComponent = React.forwardRef((props,innerRef)=>{
    let {openedIcon,screenName,display:customDisplay,primary,actionMutator,secondary,onOpen,prepareActions,fabStyle,open:customOpen,onClose,onStateChange:customOnStateChange,closedIcon,color,actions:customActions,children,...customRest} = props;
    const [state, setState] = React.useStateIfMounted({ 
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
        hide : x=> {
            setState({...state,display:false})
        },
        show : ()=>{
            setState({...state,display:true})
        },
        isHidden : x => !state.display,
        isShown : x => state.display,
        isClosed : x => !state.open,
        isOpened : x => state.open,
    }
    const {open,display} = state;
    openedIcon = defaultStr(openedIcon,"close");
    closedIcon = defaultStr(closedIcon,MENU_ICON);
    const rest = defaultObj(customRest);
    fabStyle = Object.assign({},StyleSheet.flatten(fabStyle));
    let backgroundColor = Colors.isValid(fabStyle.backgroundColor)? fabStyle.backgroundColor : undefined;
    color = Colors.isValid(color)? color : undefined;
    if(!backgroundColor || primary){
        backgroundColor = theme.colors.primary;
        color = theme.colors.primaryText;
    } else if(secondary){
        backgroundColor = theme.colors.secondary;
        color = theme.colors.secondaryText;
    }
    const actions = React.useCallback(()=>{
        if(!open) return []
        const actions =  prepareActions === false && Array.isArray(customActions)? customActions : [];
        if((prepareActions !== false || !actions.length)){
            Object.map(customActions,(act,i)=>{
                if(!isObj(act) || (!act.icon && !act.label && !act.text)) return null;
                act.label = defaultStr(act.label,act.text);
                const a = actionMutator ? actionMutator ({action:act,key:i,isFab:true,fab:true}) : act;
                if(!isObj(a) || !isNonNullString(a.label)) return null;
                a.small = typeof a.small =='boolean'? a.small : false;
                const {perm,isAllowed,primary,secondary,...restItem} = a;
                if(typeof isAllowed =='function' && isAllowed() === false) return null;
                if(isNonNullString(perm) && !Auth.isAllowedFromStr(perm)) return false;
                if(primary){
                    restItem.style = StyleSheet.flatten([restItem.style,{color:theme.colors.primaryText,backgroundColor:theme.colors.primary}])
                } else if(secondary){
                    restItem.style = StyleSheet.flatten([restItem.style,{color:theme.colors.secondaryText,backgroundColor:theme.colors.secondary}])
                }
                if(isAllowed === false) return null;
                actions.push(restItem);
            }); 
        }
        return actions;
    },[customActions,prepareActions,open])();
    
    React.useEffect(()=>{
        React.setRef(innerRef,context);
        return ()=>{
            React.setRef(innerRef,null);
        }
    },[])
    return <Portal>
        <Group
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