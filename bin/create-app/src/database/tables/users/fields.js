
export default {
    userId : {
        primaryKey : true,
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
    },
    email : {
        type : "email",
        label : 'Email',
    },
    avatar : {
       type : "image",
       label: 'Avatar',
    },
    birthdate : {
        type : "date",
        label : "Date",
    },
}