import Screen from "$eScreen";
import Label from "$ecomponents/Label";
import { StyleSheet } from "react-native";
import appConfig from "$capp/config";

export default function HomeScreen(props){
    return <Screen {...props} style={[styles.container,props.style]}>
        <Label primary style={[styles.label]}>Hello world {appConfig.name}, version {appConfig.version}!</Label>
    </Screen>
}

HomeScreen.screenName = "Home"; //le nom de l'écran, utile pour la navigation
HomeScreen.Modal = false; //l'écran n'est pas modale, c'est à dire qu'il s'affiche à côté du drawer
HomeScreen.authRequired = false; //l'utilisateur doit être connecté pour accéder à l'application
HomeScreen.withNotifications = true; //pour le rendu des notificatios

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