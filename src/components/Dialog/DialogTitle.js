import React from "$react";
import {Dialog} from "react-native-paper";
import Label from "$components/Label";
import {isNonNullString,defaultObj} from "$utils";
import View from "$components/View";
import theme from "$theme";
import { StyleSheet } from "react-native";

const DialogTitleComponent = React.forwardRef(({responsive,containerProps,title,titleProps,isFullScreen,fullScreen,...rest},ref)=>{
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
    if(responsive && isFullScreen() || fullScreen || !React.isValidElement(title,true)){
        return null;
    }
    titleProps = defaultObj(titleProps);
    containerProps = defaultObj(containerProps);
    let Title = null;
    if(isNonNullString(title)){
        Title = <Dialog.Title {...titleProps} style={[styles.container,{color:theme.colors.text},titleProps.style]}>{title}</Dialog.Title>
    } else if(React.isValidElement(title)){
        Title = <Label {...titleProps}>{title}</Label>
    }
    return <View ref={ref} {...defaultObj(rest)}>
        {Title}
    </View>
});

export default DialogTitleComponent;

DialogTitleComponent.displayName = "DialogTitleComponent";

const styles = StyleSheet.create({
    container : {
        marginTop:10,fontSize:16,marginHorizontal:10,lineHeight:25,marginBottom:10,
        fontWeight : '550',
    }
})