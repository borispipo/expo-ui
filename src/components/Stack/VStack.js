import View from "$ecomponents/View";
import {forwardRef} from "react";
import { StyleSheet } from "react-native";

const VStackComponent = forwardRef(({style,...props},ref)=>{
    return <View ref={ref} style={[styles.container,style]} {...props}/>
});

VStackComponent.displayName = "VStackComponent";

export default VStackComponent;

const styles = StyleSheet.create({
    container : {
        flexDirection:"column",
        alignItems : "flex-start",
        justifyContent : "flex-start",
    }
})