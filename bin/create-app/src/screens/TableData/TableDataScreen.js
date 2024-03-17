// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import TableData from "$eScreen/TableData";
import notify from "$cnotify";


export default class TableDataScreenItem extends TableData{
    /**** cette méthode est très utile pour la vérification des id de type unique en base de données
        par exemple, vous avez une table en base de données dont l'id est le code et en création de la nouvelle données, vous vérifiez si celle entrée par l'utilisateur existe déjà en base ou non
        Cette fonction doit retourner une promise, qui lorsque la donnée existe, elle doit retourner l'objet correspondant à l'id recherché en bd ou généer une exception si elle n'existe pas
           
    */
    fetchUniqueId ({value,field,fieldName,foreignKeyColumn,table:customT,foreignKeyTable}){
        return Promise.resolve({});
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