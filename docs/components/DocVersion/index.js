import {H6} from "$ecomponents/Typography";
import appConfig from "$capp/config";
import Label from "$ecomponents/Label";
import Chip from "$ecomponents/Chip";
import View from "$ecomponents/View";
import { StyleSheet } from "react-native";
import theme from "$theme";

export default function DocVersionComponent(props){
    return <Label fontSize={12} primary style = {[styles.label,props.style]} children={`Version ${appConfig.version}`} textBold 
    {...props}/>
}

const styles = StyleSheet.create({
    label : {
        borderRadius : 5,
        padding : 2,
        flexGrow : 0,
        flex : 0,
    }
})