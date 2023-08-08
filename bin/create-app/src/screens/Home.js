import Screen from "$eScreen";
import Label from "$ecomponents/Label";
import { StyleSheet } from "react-native-web";
export default function HomeScreen(props){
    return <Screen {...props} style={[styles.container,props.style]}>
        <Label style={[styles.label]}>Hello world!</Label>
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