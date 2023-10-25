import ExpoUIProvider from "$expo-ui"; 
import screens from "$screens";
import drawerItems from "$navigation/drawerItems";
import Logo from "$components/Logo";
import drawerSections from "$navigation/drawerSections";

export default function AppMainEntry(){
    return <ExpoUIProvider    
        navigation = { {
            /*{object}, les props à passer au composant NavigationContainer de react-navigation
                @see : https://reactnavigation.org/docs/navigation-container/
            */
            containerProps : {},
            /*** L'ensemble des écrans de l'application */
            screens,
            /** {object}, les options du composant Stack.Navigator, voir https://reactnavigation.org/docs/native-stack-navigator */
            screenOptions : {},
            drawerItems, //application main drawer items,
            drawerSections,
            /***** mutate drawerItems before rendering
                @param {object : {[drawerSection1]:{ label:section1Label,items:<Array>},[drawerSection2]:{}, ...[drawerSectionN]:{}}} drawerItems
                @return {object}
            */
            drawerItemsMutator : (drawerItems)=>{
                return drawerItems;
            },
            datagrid : {
                ///les props par défaut à passer au composant SWRDatagrid
            },
            screenOptions : {},//les options du composant Stack.Navigator de react-navigation, voir https://reactnavigation.org/docs/native-stack-navigator/
        }}
        components = {{
            /*** logo : ReactNode|ReactElement | ReactComponent | object {
               image{ReactComponent} :,text {ReactComponent}
            },*/
            logo : Logo,//logo component's properties
            loginPropsMutator : {},//({object})=><{object}>, la fonction permettant de muter les props du composant Login,
            authEnabled : true,//si le module d'authentification sera requis
            customFormFields : {},//custom form fields
            /*** la fonction permettant de muter les props du composant TableLink, permetant de lier les tables entre elles */
            tableLinkPropsMutator : (props)=>{ 
                return props;
            }
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
        ///fonction de rappel appelée avant d'exit l'application, doit retourner une promesse que lorsque résolue, exit l'application
        beforeExit = {()=>Promise.resolve(true)}    
        
        handleHelpScreen ={true} //si l'écran d'aide sera pris en compte, l'écran d'aide ainsi que les écrans des termes d'utilisations et autres
    />
}  