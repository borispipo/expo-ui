/****
    la liste des tables de donnéees à exporter, de la forme : 
    [tableName1] : {
       tableName <string>, le nom de la table name
       label | text <string>, le titre à donner à la table data
       icon : <string | ReactComponent>, l'icon de la table data,
       queryPath <string>, //le chemin lié à l'api REST utilisée pour effectuer un query sur les données liés à la table Data en question
       perms <object>, //l'objet perms définissant les permissions pouvant être assignés à l'utilisateur pour la table de donénes
       showInFab <boolean | function()=><boolean>, //si la table de données sera affiché dans le layout Fab, le composant Fab qui est rendu pour les écrans dont la propriété withFab est à true
       showInDrawer <boolean | function()=><boolean>, //détermine si la table data sera affichée dans le drawer principal de l'application
       datagrid <object>, //les props à passer au composant datagrid lié à la table de données
       drawerSection <string>, //le nom de la section associé au drawer dans lequel figurera le table data
       print <function ({data,...settings})>=> <Promise<{content:[],...rest}>, //la fonction utile pour l'impression de la tabel de données suivant les recommandation de la libraririe pdfmake
       printOptions <object>, //les options à passer à la fonction print,
       fabProps {object|function({tableName})}, retourne les props à appliquer au composant fab lié à la table data,si elle définit une propriété nomée actions de types tableau, alors, ces actions seront utilisées commes actions personnalisées du fab
    }
*/
export default {

}

export {default as getTable} from "./getTable";