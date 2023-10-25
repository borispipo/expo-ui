import Screen from "$eScreen";
import Label from "$ecomponents/Label";
import { StyleSheet } from "react-native";
import appConfig from "$capp/config";

export default function HomeScreen(props){
    return <Screen {...props} style={[styles.container,props.style]}>
        <Label primary style={[styles.label]}>Hello world {appConfig.name}, version {appConfig.version}!</Label>
    </Screen>
}

HomeScreen.screenName = "Home";
HomeScreen.Modal = false;
HomeScreen.authRequired = false;

const styles = StyleSheet.create({
    container : {
        flex : 1,
        justifyContent :"center",
        alignItems : "center",
    },
    label : {
        fontSize : 16,
        fontWeight : "bold",
    }
});