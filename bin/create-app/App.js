import 'react-native-gesture-handler';//please do not remove this line
import "$session";//please do not remove this line
import { registerRootComponent } from 'expo';
import ExpoUIProvider from "$expo-ui"; 
import screens from "$screens";
import drawerItems from "$navigation/drawerItems";
import Logo from "$components/Logo";
import drawerSections from "$navigation/drawerSections";
import TableDataListScreen from "$screens/TableData/TableDataListScreen";
import TableDataScreen from "$screens/TableData/TableDataScreen";
import Notifications from "$components/Notifications";
import auth from "$src/auth";
import tablesData, { getTable as getTableData } from "$database/tables";
import {defaultStr} from "$cutils";
import customFormFields from "$components/Form/customFields";


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
            drawerItems,  //application main drawer items,
            drawerSections, //les différentes sections du drawer principal de l'application
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
        tablesData={tablesData}
        getTableData={getTableData}
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
            /*** 
                le composant en charge du rendu du logo de l'application
                logo | Logo :  ReactNode | ReactComponent | object {
                   image{ReactComponent} :,
                   text {ReactComponent}
                },
            },*/
            logo : Logo,
            /****
                custom form fields
                les form fields personnalisés doivent être définis ici 
                de la forme : {
                    [typeCustomField1] : <ReactComponent>,
                    ...
                    [typeCustomFieldn] : <ReactComponent>
                }
                par exemple, si l'on souhaite définir un form field de type test, la déclaration sera de la forme : 
                {
                    test : Test, //ou test est le fom field associé au type test, ie le composant qui sera rendu pour ce type de Champ,
                }
            */
            customFormFields,
            /*** 
                la fonction permettant de muter les props du composant TableLink, permetant de lier les tables entre elles
                Le composant TableLink permet de lier les données d'une tableData, L'usage dudit composant est définit dans la documentation de l'application
            */
            tableLinkPropsMutator : (props)=>{ 
                return {
                    ...props,
                    /***
                        la fonction fetchForeignData est appelée lorsqu'on clique sur un élément du composant TableLink, permetant de lier un objet de la table table Data
                        foreignKeyTable {string} represente la table lié à la donnée
                        foreignKeyColumn {string} represenet le nom de la colonne qu'on souhaite récupérer la données
                        id {any}, represente la valeur actuelle sur laquelle on a cliqué
                    */
                    fetchForeignData : ({foreignKeyTable,foreignKeyColumn,tableName,table,id,...args})=>{
                        tableName = defaultStr(foreignKeyTable,table,tableName);
                        const tableObj = getTableData(tableName); //table object represente l'objet table, lié à la liste des tables data déclaré dans l'application
                        if (!tableObj) {
                            return Promise.reject({
                              message: `Impossible de récupérer la données associée à la table ${tableName}. Rassurez vous qu'elle figure dans la liste des tables supportées par l'application`,
                            });
                        }
                        //Vous pouvez dès cet instant accédes aux props de l'objet tableObj, notemment queryPath, qui permet de récupérer les données liés à la table data
                        const fieldName = defaultStr(foreignKeyColumn);
                        /*
                            implémenter votre logique pour récupérer l'objet associé à la table tableName, dont la colonne est fieldName, et la valeur est id.
                            //ajouter l'instruction d'importation de la fonction fetch : import fetch from "$capi/fetch";
                            exemple : return fetch(`${table.queryPath}/${id}${fieldName ? `?fieldName=${fieldName}`:""}`).then((resp) => resp.data);
                        */
                        return Promise.resolve(null);
                    },
                };
            },
            /***
                ({object})=><{object}>, la fonction permettant de muter les props du composant Fab, affiché dans les écrans par défaut
            */
            fabPropsMutator : (props)=>props,
            /****
                les props personnalisés à passer au composant ProfilAvatar
                @param {
                    user <Object>, l'objet en rapport à l'utilisateur connecté
                    canSignOut <boolean>, renseigne si l'utilisateur peut se déconnecté. est à false lorsque la gestion de l'authentification est désactivé,
                    renderedOnAppBar <boolean>, renseigne si l'avatar est rendu sur l'AppBar où sur le drawer
                    closeDrawer : (callback<function>)=><any>, la fonction permettant de fermer le drawer, lorsque celui-ci est en mode temporaire
                    navigateToPreferences : <func>, la fonction permettant de naviguer vers les préférences utilisateurs,
                    signOut <func>, la fonction permetant de déconnecter l'utilisateur 
                    ...rest,
                },
                @return <object> {
                    pseudo <string>, le pseudo à utiliser pour l'affichage du profil avatar
                    label <string>, le label, le sous nom à afficher juste en bas du pseudo
                    ...imageProps <object>, les props à utilser pour le rendu de l'avatar, idem au props du composant image,
                    menuItems : <array | object>, les items supplémentaires à afficher pour le rendu du menu,
                    preferencesMenuItem : <boolean>, si l'items préférence sera rendu dans les items du menu
                    signOutMenuItem : <boolean>, si l'item Déconnection sera rendu des les items de menu
                }
            */
            profilAvatarProps : ({user,renderedOnAppBar,closeDrawer,canSignOut})=>({}),
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
        /***
            Les filtres vers les icons Set
            @param {object} font, l'objet font parmis la liste des fonts icons supportés : voir : https://icons.expo.fyi/Index
            @param {string} fontName, le nom de la font
            @param {string} fontNameLower, le nom de la font en lowerCase
            @return {boolean}, si true, l'icon set sera pris en compte
        */
        FontsIconsFilter ={(font,fontName,fontNameLower)=>false}
    />
}  

registerRootComponent(AppMainEntry);