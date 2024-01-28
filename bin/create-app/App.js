import 'react-native-gesture-handler';//please do not remove this line
import "$session";//please do not remove this line
import { registerRootComponent } from 'expo';
import ExpoUIProvider from "$expo-ui"; 
import screens from "$screens";
import drawerItems from "$navigation/drawerItems";
import Logo from "$ecomponents/Logo";
import drawerSections from "$navigation/drawerSections";
import TableDataListScreen from "$screens/TableData/TableDataListScreen";
import TableDataScreen from "$screens/TableData/TableDataScreen";
import Notifications from "$ecomponents/Notifications";
import auth from "$src/auth";

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
            screenOptions : {},//les options du composant Stack.Navigator de react-navigation, voir https://reactnavigation.org/docs/native-stack-navigator/
        }}
        auth = {auth}
        components = {{
            /*** utilisé pour le renu du contenu des écran de type liste sur les tables de données */
            TableDataListScreen,
            /**** ce composant est utile pour le rendu du contenu des écrans de type formulaire d'enregistrement des tables de données*/
            TableDataScreen,
            /***
                le composant à utliser pour le rendu des notifications de l'application. 
                pour qu'une notification soit affichée à un écran, il suffit de défiir la propriété withNotifications de l'écran à true. Ceci à l'image de l'écran Home
            */
            Notifications, 
            datagrid : {
                ///les props par défaut à passer au composant SWRDatagrid
            },
            /**
             * ///le composant permettant de faire office de provider principal de l'application,
               //ce composatnn permet de wrapper le contenu principal de l'application, les utilitaires de navigation, de la boîte de dialogue et bien d'autre ne doivent pas être utilisé
               il peut être utilisé pour par exemple wrapper le contenu au travaer d'un store redux et bien d'autre 
        
                isLoaded {boolean}, est à true lorsque toutes les ressources de l'application ont été chargées, la fonction init de l'application a été appelée et l'application est prête à être rendu à l'utilisateur
                    Lorsque isLoaded est false, le Splashscreen est l'écran visible à l'utilisateur
                isInitialized {boolean}, est à true lorsque la fonction init de l'application a été appelée
                isLoading {boolean}, est à false lorsque les resources de l'application, notemment les fonts, polices, les assets sont en train d'être chargées
                hasGetStarted {boolean}, lorsque la fonction init est appelée, si cette fonction retourne une promesse qui est résolue, alors l'application est suposée comme get started sinon alors l'application est suposée comme non get started et l'écran GetStarted est affichée à l'écran                  
             * @param {*} param0 
             * @returns 
             */
            MainProvider : function({children,isLoaded,isLoading,isInitialized,hasGedStarted,...props}){
                return children;
            },
            /*** logo : ReactNode|ReactElement | ReactComponent | object {
               image{ReactComponent} :,text {ReactComponent}
            },*/
            logo : Logo,//logo component's properties
            /**** les form fields personnalisés doivent être définis ici */
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
        children = {function({children,appConfig}){
            return children;           
        }}
        ///fonction de rappel appelée avant d'exit l'application, doit retourner une promesse que lorsque résolue, exit l'application
        beforeExit = {()=>Promise.resolve(true)}    
        
        handleHelpScreen ={true} //si l'écran d'aide sera pris en compte, l'écran d'aide ainsi que les écrans des termes d'utilisations et autres
    />
}  

registerRootComponent(AppMainEntry);