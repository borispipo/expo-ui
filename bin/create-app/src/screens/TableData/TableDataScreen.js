// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import TableData from "$eScreen/TableData";
import notify from "$cnotify";
import {defaultStr} from "$cutils";
import getTable from "$database/tables/getTable"


export default class TableDataScreenItem extends TableData{
    /**** cette méthode est très utile pour la vérification des id de type unique en base de données
        Elle est valable pour les champs de type id, de type piece, ou dont la propriété primaryKey est à true ou la proprité unique est à true,
        Elle est appelée pour les champs de type id en cas d'ajout d'un élément de la table data; Lorsque l'évènement onBlur est appelé sur le champ de type id, 
        La fonction suivante est appelée dans le but de vérifier s'il existe déjà en base de données une valeur idenetique à celle renseignée par l'utilisateur. 
        par exemple, vous avez une table en base de données dont l'id est le code et en création de la nouvelle données, vous vérifiez si celle entrée par l'utilisateur existe déjà en base ou non
        Cette fonction doit retourner une promise, qui lorsque la donnée existe, elle doit retourner l'objet correspondant à l'id recherché en bd ou généer une exception si elle n'existe pas
        @return {Promise<object>}
    */
    fetchUniqueId ({value,field,fieldName,foreignKeyColumn,table:customTable,tableName:customTableName,foreignKeyTable}){
        const tableObj = this.getTableObj(); //tableObj représente la table data, enreigstré dans $src/database/tables dont le nom est passé à l'item en cours
        let tableName = defaultStr(foreignKeyTable,this.tableName,customTable,customTableName).trim().toUpperCase();
        const foreignTableObj = tableName !== this.tableName ? getTable(tableName) : tableObj
        foreignKeyColumn = defaultStr(foreignKeyColumn,field,fieldName);
        if(!foreignKeyColumn){
            return Promise.reject({message:"Impossible de faire un fetch de l'id unique  pour la  table"+foreignKeyTable+", de valuer :  "+value})
        }
        if(!foreignTableObj){
            return Promise.reject({message:`Impossible de récupérer la données d'id unique lié à la table ${foreignKeyTable}, colonne ${foreignKeyColumn} car la table data est invalide`})
        }
        tableName = defaultStr(foreignTableObj.tableName,this.tableName,foreignTableObj.table,tableName).toUpperCase();
        //il s'agit là de récupérer une données en base de données, ayant dont la colonne [foreignKeyColumn.trim()] = value;
        const where = {
            [foreignKeyColumn.trim()] : value //la condition d'appel de la données à récupérer en base de données
        };
        /***
            implémenter votre propre logique afin de récupérer la données, au backend; il est à noter que l'objet à retourner, si existant en bd doit être avoir au moins un champ définit de la forme : {[foreignKeyColmn]:[valuerEnBD]}
            Si une exception est généré, alors cette exception doit avoir un champ status = 404, pour signifier que l'objet n'existe pas en bd
        */
        return Promise.reject({
            message : `Veuillez implémenter votre logique de récupération en bd du champ ${foreignKeyColumn} pour la valeur ${value} de la table data ${tableName}. Consultez le fichier $src/screens/TableDataScreen afin d'implémenetr la fonction fetchUniqueId`
        });
    }
    /*** implémenter la routine beforeSave, avant l'enregistrement de la données liée à la table encours
        -si cette fonction retourne une chaine de caractère, alors cette chaine est considérée comme une erreur et elle est affichée via une notification à l'utilisateur
        -si cette fonction retourne false, alors la donnée en cours de modification ne peut être enregistrée
    */
    beforeSave({data,tableName,...rest}){
        return data;
    }
    /*** implémenter la logique d'isertion ou de mise à jour de la données, en cours d'enregistrement en base de données distante
        @return {Promise<object>} la données insérée ou mise à jour issue de la base de données
    */
    upsertToDB({data,tableName,...rest}){
        notify.error("Consultez le fichier : $src/screens/TableData/TableDataScreen.js afin d'implémenter la logique d'enregistrement en base de données de la données : "+JSON.stringify(data));
        return false;
        return Promise.resolve({data});
    }
    prepareComponentProps (...rest){
        return super.prepareComponentProps(...rest); //pour preparer les props qui seront rendu par le composant
    }
    /****
        la fonction permet de préparer les champs du composant TableData avant qu'ils ne soient envoyés au composant FormData
        Si cette fonction retourne false, alors le champ en question ne sera pas pris en compte dans le formulaire lors de l'enregistrement des données
        Cette fonction est très utile pour non seulement filtrer les champs qui peuvent appraitre dans le formulaire, mais aussi modifier dynamiquement le status du champ en fonction des situatioins
            - le champ isUpdate <boolean>, détermine s'il s'agit d'une mise à jour de la données (data) en cours 
            - le champ name <string>, représente le nom du champ dans le formulaire, la clé du champ dans la props fields du table data
            - le champ field <object>, représente l'objet field, l'une des valeurs de la propriétés fields du table data
            - le champ data <object>, représente la donnée du table data en cours de traitement. Lorsque isUpdate est à false, data est un objet non vide et non null
    */
    prepareField({name,field,isUpdate,data,...rest}){
        return super.prepareField({name,field,isUpdate,data,...rest});
    }
}

TableDataScreenItem.Modal = true; //spécifiez si cet écran s'affiche en model ou non