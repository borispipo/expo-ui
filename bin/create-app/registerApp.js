import registerApp from "$expo-ui-root-path"; 
import screens from "./src/screens";
import drawerItems from "./src/navigation/drawerItems";
import Logo from "./src/components/Logo";

registerApp({
    /**** application navigation */
    navigation : {
        //all application screeens
        screens,
        drawerItems, //application main drawer items
    },
    /**application components */
    components : {
        logo : Logo,//logo component's properties
        loginPropsMutator : {},//login props mutator
        authEnabled : true,//si le module d'authentification sera requis
    },
    /*** //for application initialization
        @param {
            appConfig : {object}, //application configuration manager imported from $capp/config
        }
        @return {Promise} if rejected, application is suposed to not be started, so we need to display getStarted Screen, il not, application logic is runned
    */
    init : function({appConfig}){ 
        return Promise.resolve("app is initialized");
    },
    /**
     * //when main application component is mounted
     */
    onMount : function(){},
    /****when main application component is unmounted*/
    onUnmount : function(){},
    /**** called any time main application's component is rendered */
    onRender : function(){},
    /*** if you need to wrap main application content with some custom react Provider */
    render : ({children})=>{
        return children;
    }
});    