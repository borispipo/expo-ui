import BottomSheet from "./Sheet";
import {isMobileMedia} from "$cplatform/dimensions";
import Menu,{renderItems} from "$ecomponents/Menu";
import React from "$react";
import {defaultObj,defaultDecimal,defaultStr,isDecimal,defaultBool} from "$cutils";
import View from "$ecomponents/View";
import PropTypes from "prop-types";
import {getContentHeight} from "./utils";
import Dimensions from "$dimensions";

const BottomSheetMenuComponent = React.forwardRef((props,ref)=>{
    let {anchor,anchorProps,screenIndent,height:customHeight,bindResizeEvent,onDismiss,testID,visible:customVisible,controlled,mobile,animateOnClose,renderMenuContent,sheet,children,...rest} = props;
    rest = defaultObj(rest);
    const isControlled = controlled ? true : false;
    const [state,setState] = React.useState({
        visible : false,
        height : undefined,
    });
    const [key,setKey] = React.useState(false);
    const visible = isControlled ? customVisible : state.visible;
    let height = state.height;
    const isMounted = React.useIsMounted();
    const anchorRef = React.useRef(null);
    const isMob = mobile || sheet === true || renderMenuContent === false || Dimensions.isMobileOrTabletMedia() ? true : false;
    testID = defaultStr(testID,'RN_BottomSheetMenuComponent');
    const innerRef = React.useRef(null);
    const open = (event)=>{
        React.stopEventPropagation(event);
        if(!isMounted()) return;
        getContentHeight(anchorRef,({height})=>{
            setState({...state,visible:true,height});
        },screenIndent);
    }, close = ()=>{
        if(!isMounted()) return;
        if(isControlled){
            if(onDismiss){
                onDismiss({});
            }
            return;
        }
        setState({...state,visible:false})
    }
    const prevIsMob = React.usePrevious(isMob);
    const Component = isMob ? BottomSheet : Menu;
    anchorProps = defaultObj(anchorProps);
    if(isMob){
        if(typeof anchor ==='function'){
            anchor = anchor(!isControlled?{onPress:open}:{});
        }
        if(React.isValidElement(anchor)){
            anchor = <View testID={testID+"_Anchor"} ref={anchorRef} {...anchorProps} collapsable={false}>{anchor}</View>
        }
        if(renderMenuContent !== false){
            children = renderItems({testID:testID+".Items",...props,closeMenu:close,openMenu:open,isBottomSheetItem:true});
        }
        rest.visible = visible;
        rest.onDismiss = close;
        if(!isDecimal(height)){
            height = undefined;
        }
        rest.animateOnClose = defaultBool(rest.animateOnClose,false);
        
    } else {
        children = undefined;
        delete rest.visible;
        height = undefined;
    }
    if(prevIsMob !== isMob){
        rest.visible = visible;
    }
    if(!isControlled){
        rest.onAnchorPress = ()=>{
            open();
            return false;
        }
        
    }
    React.useEffect(()=>{
        const closeModal = ()=>{
            if(!isMounted()) return;
            setKey(!key);
        }
        if(bindResizeEvent !== false){
            APP.on(APP.EVENTS.RESIZE_PAGE,closeModal);
        }
        return ()=>{
            APP.off(APP.EVENTS.RESIZE_PAGE,closeModal);
        }
    },[]);
    if(typeof children ==='function'){
        if(!visible) children = null;
        else {
            children = children({open,close});
        }
    }
    return <>
        {isMob && React.isValidElement(anchor)? anchor : null}
        <Component
            {...rest}
            key = {isMob?"mobile":"desktop"}
            testID = {testID}
            height = {controlled?customHeight:height}
            ref = {React.useMergeRefs(innerRef,ref)}
            anchor = {anchor}
            anchorProps = {anchorProps}
            children = {visible && (React.isValidElement(children) || Array.isArray(children))?children:undefined}
        />
    </>
})

BottomSheetMenuComponent.propTypes = {
    ...defaultObj(Menu.propTypes),
    ...defaultObj(BottomSheet.propTypes),
    screenIndent : PropTypes.number,
    controlled : PropTypes.bool,//si le composant est controllé
    sheet : PropTypes.bool, //si l'on veut que le bottom sheet soit rendu quel qu'en soit la taille de l'écran, passer ce paramètre à true
    renderMenuContent : PropTypes.bool, ///si le contenu est de type menu dont les items seront rendu
    children : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.node
    ]),
    mobile : PropTypes.bool, //si uniquement le bottom sheet sera rendu, quel qu'en soit la dimension de l'écran
}

export default BottomSheetMenuComponent;

BottomSheetMenuComponent.displayName = "BottomSheetMenuComponent";