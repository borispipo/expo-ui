import React from "$react";
import {defaultObj} from "$utils";;
import View from "$components/View";
import { StyleSheet } from "react-native";

const DialogFullPageFooter = React.forwardRef(({responsive,containerProps,children,isFullScreen,fullScreen,...rest},ref)=>{
    const forceRender = React.useForceRender();
    React.useEffect(()=>{
        const onResize = ()=>{
            forceRender();
         }
        if(responsive){
            APP.on(APP.EVENTS.RESIZE_PAGE,onResize);
        }
        return ()=>{
            APP.off(APP.EVENTS.RESIZE_PAGE,onResize);
        }
    },[])
    if(responsive && !isFullScreen() || (typeof fullScreen =='boolean' && !fullScreen) || !React.isValidElement(children)){
        return null;
    }
    rest = defaultObj(rest);
    return <View ref={ref} {...rest} style={[styles.container,rest.style]}>
        {children}
    </View>
});

export default DialogFullPageFooter;

const styles = StyleSheet.create({
    container : {
        paddingVertical : 10,
    }
})

DialogFullPageFooter.displayName = "DialogFullPageFooter";