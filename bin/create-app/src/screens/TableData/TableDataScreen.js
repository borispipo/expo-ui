// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import TableData from "$eScreen/TableData";


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
        return Promise.resolve({data});
    }
}

TableDataScreenItem.Modal = true; //spécifiez si cet écran s'affiche en model ou non