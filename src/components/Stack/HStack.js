import View from "$ecomponents/View";
import {forwardRef} from "react";
import { StyleSheet } from "react-native";

const HStackComponent = forwardRef(({style,...props},ref)=>{
    return <View ref={ref} style={[styles.container,style]} {...props}/>
});

HStackComponent.displayName = "HStackComponent";

export default HStackComponent;

const styles = StyleSheet.create({
    container : {
        flexDirection:"row",
        flexWrap : "wrap",
        columnGap : 5,
        alignItems : "center",
        justifyContent : "flex-start",
    }
})