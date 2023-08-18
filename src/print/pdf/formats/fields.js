import formats from "./formats";
import {isObj,isNonNullString} from "$cutils";

export default {
    code : {
        label : 'Code du format',
        primaryKey : true,
        readOnlyOnEditing : true,
        validType : 'required',
        maxLength : 20
    },
    label : {
        text : "Intitulé du format",
        maxLength : 40
    },
    users : {
        type : "selecttabledata",
        text : "Accessible aux utilisateurs",
        multiple : true,
        foreignKeyColumn : 'code',
        foreignKeyTable : "users",
        dbName : "users"
    },
    displayLogo : {
        text : 'Afficher le logo société',
        type : 'switch',
        defaultValue : 1,
        checkedTooltip : 'Oui',
        uncheckedTooltip : 'Non',
    },
    displaySocialReason : {
        text : 'Entêtes société',
        type : 'switch',
        checkedTooltip : 'Oui',
        uncheckedTooltip : 'Non',
        defaultValue : 1,
    },
    displayIdentifier : {
        text : 'Afficher les ID Société',
        type : 'switch',
        checkedTooltip : 'Oui',
        uncheckedTooltip : 'Non',
        defaultValue : 0,
        //checkedTooltip : 'Afficher les identifiants société à l\'instar du registre de commerce et bien d\'autres',
        //uncheckedTooltip : 'Ne pas afficher les identifiants société à l\'instar du registre de commerce et bien d\'autres',
    },
    displayThirdPartiesIdentifier : {
        text : 'Afficher les ID Tiers',
        type : 'switch',
        checkedTooltip : 'Oui',
        uncheckedTooltip : 'Non',
        defaultValue : 0,
    },
    signatories : {
        type : 'selectstructdata',
        table : 'signatories',
        multiple : true,
        text : 'Signataires',
    },
    signatoriesMargin : {
        type : 'number',
        format : 'number',
        validType : 'number',
        text : 'Nbrs sauts de lignes après signataires',
        tooltip : 'Entrez le nombre de sauts de lignes à laisser sur la page après la ligne des signataires',
        defaultValue : 3,
    },
    footerNote : {
        text : 'Note de bas de page',
        format : 'hashtag',
        maxLength : 500,
    },
    footerCopyRight : {
        text : 'Pied de page',
        format : 'hashtag',
        maxLength : 500,
    },
    pageFormat : {
        text : 'Format de la page',
        defaultValue : require("./defaultPageFormat").default,
        type : 'select',
        items : formats,
        required : true,
        multiple : false,
        itemValue : ({item})=>{
            return formats[item] || item;
        }
    },
    pageWidth : {
        text : 'Largeur de la page en pts(pt)',
        tooltip : 'Spécifiez une valeur de la largeur de la page à imprimer, si cette valeur vaut zéro, la valeur du format de la page sera utilisée',
        defaultValue : 0,
        type : 'number',
        format : 'number',
        validType : 'decimal',
    }, 
    pageHeight : {
        text : 'Hauteur de la page en pts(pt)',
        tooltip : 'Spécifiez une valeur de la hauteur de la page à imprimer, si cette valeur vaut zéro, la valeur du format de la page sera utilisée',
        defaultValue : 0,
        type : 'number',
        format : 'number',
        validType : 'decimal',
    }, 
    pageOrientation : {
        text : 'Orientation de la page',
        type : 'select',
        items : [{code:'portrait',label:'Portrait'},{code:'landscape',label:'Paysage'}],
        defaultValue : require("./defaultPageOrientation"),
        required : true,
    },
    leftMargin : {
        type : 'number',
        format : 'number',
        validType : 'number',
        text : 'Marge [Gauche]',
        defaultValue : 20
    },
    topMargin : {
        type : 'number',
        format : 'number',
        validType : 'number',
        text : 'Marge [Haut]',
        defaultValue : 20,
    },
    rightMargin : {
        type : 'number',
        text : 'Marge [Droite]',
        validType : 'number',
        defaultValue : 20
    },
    bottomMargin : {
        type : 'number',
        format : 'number',
        validType : 'number',
        text : 'Marge [Bas]',
        defaultValue : 30
    },
}
