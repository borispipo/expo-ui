import ExpoUIProvider from "$expo-ui"; 
import screens from "./src/screens";
import drawerItems from "./src/navigation/drawerItems";
import Logo from "./src/components/Logo";

export default function AppMainEntry(){
    return <ExpoUIProvider
        navigation = { {
            //all application screeens
            screens,
            drawerItems, //application main drawer items,
            screenOptions : {},//les options du composant Stack.Navigator de react-navigation, voir https://reactnavigation.org/docs/native-stack-navigator/
        }}
        components = {{
            logo : Logo,//logo component's properties
            loginPropsMutator : {},//login props mutator
            authEnabled : true,//si le module d'authentification sera requis
        }}
        /*** //for application initialization
            @param {
                appConfig : {object}, //application configuration manager imported from $capp/config
            }
            @return {Promise} if rejected, application is suposed to not be started, so we need to display getStarted Screen, il not, application logic is runned
        */
        init = {function({appConfig}){ 
            return Promise.resolve("app is initialized");
        }}
        /*** if you need to wrap main application content with some custom react Provider*/
        render = {function({render,appConfig}){
            return render;           
        }}
    />
}  