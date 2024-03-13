import React from "$react";
import {Dialog} from "react-native-paper";
import Label from "$ecomponents/Label";
import {isNonNullString,defaultObj} from "$cutils";
import View from "$ecomponents/View";
import theme from "$theme";
import { StyleSheet } from "react-native";
import {useWindowDimensions} from "$cdimensions/utils";

const DialogTitleComponent = React.forwardRef(({responsive,containerProps,title,titleProps,isFullScreen,fullScreen,...rest},ref)=>{
    useWindowDimensions();
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
        fontWeight : '500',
    }
})