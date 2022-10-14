import Date from "$lib/date";
const selectLabel = {
    title : 'Sélectionner un libelé',
    table : 'labels',
    dbName : 'struct_data',
    itemValue : ({item})=>defaultStr(item.label,item.code)
}
export default  {
    "&libele&" : selectLabel,
    "&vente&" : {
        title : 'Sélectionner une vente',
        table : 'sales',
    },
    "&achat&" : {
        title : 'Sélectionner un achat',
        table : 'purchases',
    },
    "&stock&" : {
        title : 'Sélectionner stock',
        table : 'stocks',
    },
    "&transfert&" : {
        title : 'Sélectionner mouvement de transfert',
        table : 'stocks_transfers',
    },
    "&reglement&" : {
        title : 'Sélectionner un règlement',
        table : 'payments',
    },
    "&tiers&" : {
        title : 'Sélectionner un tier',
        table : 'third_parties',
        dbName : 'third_parties',
    },
    "&projet&" : {
        title : 'Sélectionner un projet',
        table : 'projects',
        dbName : 'projects',
    },
    "&tache&" : {
        title : 'Sélectionner une tâche',
        table : 'tasks',
        dbName : 'projects',
    },
    "&commercial&" : {
        title : 'Sélectionner commercial',
        table : 'users',
        dbName : 'users',
        fetchDataOpts:{
            selector : {$and:[{isSeller:1}]}
        }
    },
    "&client&" : {
        title : 'Sélectionner client',
        table : 'third_parties',
        dbName : 'third_parties',
        fetchDataOpts:{
            selector : {$and:[{type:{$in:["customer"]}}]}
        }
    },
    "&fournisseur&" : {
        title : 'Sélectionner Fournisseur',
        table : 'third_parties',
        dbName : 'third_parties',
        fetchDataOpts:{
            selector : {$and:[{type:{$in:["provider"]}}]}
        }
    },
    "&utilisateur&" : {
        title : 'Sélectionner un utilisateur',
        table : 'users',
        dbName : 'users',
    },
    "&caisse&" : {
        title : 'Sélectionner une caisse',
        table : 'checkouts',
        dbName : 'common',
    },
    "&produit&" : {
        title : 'Sélectionner un produit/article',
        table : 'products',
        dbName : 'products',
    },
    "&categorie&" : {
        title : 'Sélectionner une catégorie de produit',
        table : 'products_categories',
        dbName : 'products',
    },
    "&taxe&" : {
        title : 'Sélectionner une taxe',
        table : 'taxes',
        dbName : 'common',
    },
    "&depot&" : {
        title : 'Sélectionner un dépôt',
        table : 'warehouses',
        dbName : 'common',
    },
    "&contact&" : {
        title : 'Sélectionner un contact',
        table : 'contacts',
        dbName : 'common',
    },
    "&sdate&" : {
        title : 'Sélectionner une date',
        type : 'field',
        field : {
            type : 'date',
            text : 'Sélectionner une date',
            format : Date.defaultDateFormat
        },
        desc : "remplace le motif par la date qui sera sélectionnée par l'utilisateur au format jj/mm/aaaa",
    },
    "&date&" : "remplace le motif par la date actuelle au format : jj/mm/aaaa",
    "&heure&" : "remplace le motif par l'heure actuelle au format hh:mm:ss",
    "&dateheure&" : "remplace le motif par la date et l'heure actuelle au format : jj/mm/aaaa hh:mm:ss",
}