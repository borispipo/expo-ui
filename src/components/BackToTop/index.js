import Fab from "$ecomponents/Fab";
import {isObj,defaultStr,defaultVal,defaultObj} from "$utils";
import React from "$react";
import PropTypes from "prop-types";
import theme from "$theme";

const SCREEN_INDENT = 20;
export const isNativeScrollEvent = (nativeEvent)=>!isObj(nativeEvent) || !isObj(nativeEvent.layoutMeasurement) || !isObj(nativeEvent.contentOffset) ? false : true;
export const canBackToTop = (nativeEvent,check) => {
    if(check !== false && !isNativeScrollEvent(nativeEvent)) return false;
    const {layoutMeasurement, contentOffset, contentSize} = nativeEvent;
    return contentOffset.y >= layoutMeasurement.height+SCREEN_INDENT ? true : false || 
        layoutMeasurement.height + contentOffset.y >=  contentSize.height - SCREEN_INDENT ? true : false;
};

export const toggleVisibility = (scrollEvent)=>{
    const event = isObj(scrollEvent) && isNativeScrollEvent(scrollEvent.nativeEvent)? scrollEvent.nativeEvent : isNativeScrollEvent(scrollEvent)? scrollEvent : undefined;
    if(!event) return undefined;
    return canBackToTop(event,false);
}

const BackToTopComponent = React.forwardRef((props,ref)=>{
    const isMounted = React.useIsMounted();
    const {onPress,accessibilityLabel,onBackToTop,onVisibilityChange,position,icon,...rProps} = props;
    const rest = defaultObj(rProps);
    const [visible,setVisible] = React.useState(false);
    const open = ()=>{
        if(!isMounted() || visible)return;
        setVisible(true);
    }
    const close = ()=>{
        if(!isMounted() || !visible)return;
        setVisible(false);
    }
 
    const context = {open,close,
        toggleVisibility:(event)=>{
            if(!isMounted()) return;
            let v = toggleVisibility(event);
            if(typeof v =='boolean' && v !== visible){
                return v ? open() : close();
            }
            return undefined;
        }
    };
    
    React.useEffect(()=>{
        if(onVisibilityChange){
            onVisibilityChange({context,visible});
        }
    },[visible])
    const style = defaultStr(position).toLowerCase() =='right' ? {
        right: 0,
    }  : {left : 0};
    React.setRef(ref,context);
    React.useEffect(()=>{
        React.setRef(ref,context);
    },[])
    return !visible ? null :  <Fab
        {...rest}
        accessibilityLabel = {defaultStr(rest.accessibilityLabel,'Retour en haut')}
        onPress = {(e)=>{
            React.stopEventPropagation(e);
            if(onPress){
                onPress({...context,event:e});
            } else if(onBackToTop){
                onBackToTop({...context,e});
            }
        }}
        icon = {defaultVal(icon,'arrow-up')}
        style = {[theme.styles.ph1,rest.style,style]}
    />
});



BackToTopComponent.propTypes = {
    ...Fab.propTypes,
    onBackToTop : PropTypes.func,
    onPress : PropTypes.func,
    /*** lorque la visibilité du boutton change si isVisible est positif, alors le contenu est scrollToTopé*/
    onVisibilityChange : PropTypes.func,
}

export default BackToTopComponent;

BackToTopComponent.displayName = "BackToTopComponent";