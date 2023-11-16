import React from "$react";
import {defaultObj} from "$cutils";;
import View from "$ecomponents/View";
import { StyleSheet } from "react-native";
import {usePageDimensions} from "$cdimensions/utils";

const DialogFullPageFooter = React.forwardRef(({responsive,containerProps,children,isFullScreen,fullScreen,...rest},ref)=>{
    usePageDimensions();
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