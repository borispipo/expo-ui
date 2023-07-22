// Copyright 2023 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import i18n from "$i18n";
export default {
    type : {
        text : 'Type',
        type : 'select',
        required : true,
        width : 150,
        items : {
            PSA : {code:'PSA',index:0,piece:'RVE',label:i18n.lang("payments_sales","Vente")},
            PPU : {code:'PPU',index:0,piece:'RAC',label:i18n.lang("payments_purchases","Achat")},
            PIN : {code:'PIN',index : 0,piece:'REN', label:i18n.lang("payments_increases","Encaissement")},
            PDE : {code:'PDE',index:0,piece:'RDE',label:i18n.lang("payments_decreases","Décaissement")},
            PTR : {code:'PTR',index:0,piece:'RTR',label:i18n.lang("payments_transfers","Transfert")},
        },
    },
    date : {
        text : 'Date',
        tooltip : 'La date',
        type : 'date',
        defaultValue : new Date(),
    },
    from : {
        tooltip : 'Le compte source',
        idfield  : 'code',
        //le point d'origine 
        text : 'Du/De',
    },
    to : {
        idfield  : 'code',
        tooltip : 'Le compte destination',
        text : 'Au/A',
    },
    amount : {
        text : 'Montant',
        type : 'number',
        format : 'money',
        defaultValue : 0,
    },
    mode : {
        type : 'selectstructdata',
        text : 'Mode',
        tableName : 'payments_methods',
        required : true,
        defaultValue : 'ESPECE',
    },
    cost : {
        text : 'Coût',
        type  : 'number',
        format : 'money',
        defaultValue : 0,
        validType : 'numberGreaterThanOrEquals[0]',
    },
    totalAmount : {
        text : 'Montant Total',
        type : 'number',
        format : 'money',
        defaultValue : 0,
        form : false,
    },
    imputedAmount : {
        text : 'Montant Imputé',
        form : false,
        type : 'number',
        format : 'money',
        import : false,
    },
    restToImpute :{
        text : 'Reste à Imputer',
        form : false,
        type : 'number',
        format : 'money',
        import : false,
    }, 
    code : {
        text : 'Numéro/pièce',
        type : 'piece',
        tableName : 'PAYMENTS',
        dbName : 'default',
        piece : '',
        width : 200,
    },
    reference : {
        tooltip : 'La référence ',
        text : 'Référence',
        width : 300,
        sortable : false,
        filter : false,
        import : false,
    },
    category : {
        text : 'Catégorie',
        type : 'selectStructData',
        table : 'payments_categories',
        width : 200
    },
    label : {
        text : 'Objet/Motif',
        tooltip : "L'objet ou le motif du règlement",
        format : 'hashtag',
        maxLength : 500,
        rows : 1,
        width : 300
    },
    approved : {
        type : 'switch',
        form : false,
        width : 100,
        text : 'Approuvé',
        defaultValue : 0,
        checkedTooltip : 'Oui',
        uncheckedTooltip : 'Non'
    },
    transferredAmount : {
        text : 'Montant transféré',
        title : "Le montant transféré dans le fichier de donné, si le document a été transféré",
        type : "number",
        format : 'money',
        visible : false,
        form : false,
    },
    netAmount : {
        text : 'Montant net',
        title : "Le montant net représente la différence entre le montant réglé et le montant transféré",
        type : "number",
        format : 'money',
        visible : false,
        filter : false,
        sortable : false,
        form : false,
    },
    tags : {
        text : 'Etiquettes',
        type : 'selectstructdata',
        table : 'tags',
        multiple : true,
        display : 'tags',
        width : 200
    },
    comment : {
        text : 'Note complémentaire',
        tootile : 'Note complémentaire au règlement',
        maxLength : 120,
        format : 'hashtag',
        rows : 1,
        width : 200
    },
}