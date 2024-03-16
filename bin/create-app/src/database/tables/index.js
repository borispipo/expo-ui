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
       newElementLabel : <string>, //le texte à utiliser pour le rendu du bouton lorsqu'il s'agit d'un nouvel element de la table data
       databaseStatistics <function ()=> <boolean> | boolean>, //si la table data figurera dans les Statistiques en BD, validable si le composant DatabaseStatistics est appélé dans l'application
       
       showInFab <boolean | function()=><boolean>, //spécifie si un bouton lié à la table sera affiché dans le composant Fab
       
       //le champ fabProps doit retourner les props à appliquer au composant fab lié à la table data,si elle définit une propriété nomée actions de types tableau, alors, ces actions seront utilisées commes actions personnalisées du fab
           // il doit s'agit d'un objet de la forme : {
                actions : <array<Item> | object <Item>>. Item doit être un objet avec les propriétés suivantes : 
                    Item : {
                        text | label <string> : "le texte à afficher au bouton fab",
                        icon <string | ReactComponent>, l'icone du bouton de fab,
                        backgroundColor <string, //la couleur d'arrière plan du bouton
                        color <string>, //la couleur du bouton de fab
                        onPress <func ()=>void>, //la fonction appelée lorsqu'on clique sur le bouton
                    }
           }  
       fabProps { boolean<false> | object|function({tableName})}, //si fabProps vaux false ou retourne false, alors le table data ne s'affichera pas dans le composant Fab
       fields : { //la liste des champs liés à la table de données
            [field1] : {
                label | text : <string | ReactComponent>, le texte ou libelé lié au champ
                type : <string>, le type de field  par exemple : text,password, email, switch, checkbox, tel, select, et bien d'autres
                sortable : <boolean>, //si la colonne sera triable
                filterable : <boolean> //si la colonne sera filterable
                form : <boolen> //si la colonne sera affiché et pris en compte dans le formulaire (FormData) lié à l'enregistrement des données de la table data
                datagrid : <boolean> //si la colonne sera affiché et pris en compte dans le composant Datagrid
                //cette fonction est appelée à chaque fois que les premiers règles de validations ont été conclus lors de la validation du champ. Elle doit retourner soit un boolean, une chaine de caractère, un objet ou une promesse
                    //si une chaine de caractère est retournée, alors la validation du champ considère qu'il s'agit d'une erreur et le message est affiché comme erreur de validation du champ
                    //si un objet est retourné et cet objet contient un champ message | msg de type string, alors le validateur considère qu'il s'agit d'une erreur et le champ en question est affiché comme message de l'erreur 
                    //si une promese est retournée, alors la fonction attendra que la promesse soit résolue 
                        1. si la promesse resoud une chaine de caractère ou un objet idem au cas précédent, ladite chaine est condisérée comme une erreur
                        2. si la promesse renvoie une erreur, alors le validateur considère comme un échec de validation et le message lié à l'erreur est affiché comme message d'erreur de validation
                    //si false est retournée, alors rien n'est fait et le status de ce champ reste toujours à invalide. il sera donc impossible d'enregistrer le formulaire form data
                    //si true est retourneé, alors la formField est valide 
                onValidatorValid : ({value,context,....rest}) => <boolean | object {} | string | Promise <boolean | object : {} | string>>,
                
                //Cette fonction est appélée à chaque échec de validation du form field
                onValidatorNoValid : ({value,context,...rest}) => <any>
                
                width : 180, //définit la longueur de la colonne dans le composant datagrid
                
                //si vous souhaitez personnaliser le rendu de la colonne dans le composant Datagrid
                datagrid : {
                    render : ({rowData,columnField,columnDef,...rest})=><ReactNode> 
                },
                visible : <boolean>, //si  le champ sera visible (par défaut dans le datagrid) et dans le formulaire d'enregistrement ou modification de la données lié à la table data
                readOnly : <boolean>, //si le champ sera en lecture seul dans le formulaire d'enregistrement d'une nouvelle données lié à la table data
                disabled : <boolean>, //si le champ sera désactivé dans le formulaire d'enregistrement/modification de la données liées à la table data
                readOnlyOnEditing : <boolean>, //si le champ sera en mode lecture seule au moment de la modification de la données liée à la table data
                visibleOnlyOnCreate : <boolean>, //si le champ est visible dans le formulaire uniquement en cas de création    
                visibleOnlyOnEditing : <boolean>, //si le champ sera visible uniquement au moment de la modification de la données liées à la table data
                disabledOnEditing : <boolean>, //si le champ est désactivé dans le formulaire lorsqu'il s'agit de la modification de la données liée à la table data
                
                primaryKey : <boolean>, //si le champ fait partie des clés primaire de la table data. Par défaut, tous les champs de type clé primaire sont en mode lecture seule en cas de modification de la données. il est indispensable pour chaque table de données de toujours spécifier au moins un champ comme clé primaire. tous les champs ayant cette propriétés à true sont utilisés à chaque fois pour évaluer l'identifiant unique lié àla table data mais aussi pour déterminer s'il s'agit d'une mise à jour où pas
            },
            ....
            [fieldN] : {....}
       }, 
        
    }
*/
export default {
    users : require("./users").default,
}

export {default as getTable} from "./getTable";