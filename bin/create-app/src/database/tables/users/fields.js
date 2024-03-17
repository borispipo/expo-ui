
export default {
    avatar : {
        type : "image",
        label: 'Avatar',
        withLabel : false,
        size : 150,//la taille de l'avatar
        datagrid : {
            size : 50,
        },
        responsiveProps : {
             style : [{width:"100%",padding:10,alignItems:"center"}]
        },
        sortable : false, //on ne peut trier les avatars
        filterable : false, //on ne peut également filtrer
        exportable : false,//le champ avatar n'est pas exportable
    },
    userId : {
        primaryKey : true,
        upper : false,
        text :"Id",
        type : "id", //il s'agit d'un champ de type id
        visibleOnlyOnEditing : true, //l'id de sera généré depuis la base de données, donc pas question d'afficher au moment de création de la table data
        width : 180, //spécifier la longueur de la colonne dans le composant datagrid
    },
    username : {
        text : "Name",
        width : 220,
    },
    amount : {
        type : "number",
        label : "Amount",
        format : "number",
    },
    email : {
        type : "email",
        label : 'Email',
        width : 180,
    },
    birthdate : {
        type : "date",
        label : "Date",
    },
}