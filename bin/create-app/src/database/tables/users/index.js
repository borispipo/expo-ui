export default {
    table : require("./table").default,
    icon : 'material-people',
    fields : require("./fields").default,
    label : "Exemple table : Utilisateurs",
    datagrid : require("./datagrid").default,
    perms : require("./perms").default,
    newElementLabel : require("./newElementLabel").default,
    sortable : false, //la table n'est pas triable
    filterable : false,//la table n'est pas filterable
    drawerSection : "main",
}