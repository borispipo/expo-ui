// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
/****Le composant TableLink est utilisé pour les liens cliquable vers les tables de données */
import {Pressable,StyleSheet} from "react-native";
import React from "$react";
import View from "$ecomponents/View";
import PropTypes from "prop-types";
import Label from "$ecomponents/Label";
import {defaultStr,isPromise,defaultObj} from "$cutils";
import {open as openPreloader,close as closePreloader} from "$preloader";
import {styles as _styles} from "$theme";
import Tooltip from "$ecomponents/Tooltip";
import {navigateToTableData,navigateToStructData} from "$enavigation/utils";
import Auth from "$cauth";
import fetch from "$capi/fetch";
import useContext from "$econtext/hooks";
/***** la fonction fetchForeignData permet de spécifier s'il s'agit d'une données de structure où non 
    dans le champ isStructData
*/
const TableLinKComponent = React.forwardRef((props,ref)=>{
    const {components:{tableLinkPropsMutator}} = useContext();
    let {disabled,readOnly,labelProps,server,containerProps,isStructData,type,perm,id,fetchForeignData,foreignKeyTable,foreignKeyColumn,data,testID,Component,routeName,routeParams,component,primary,triggerProps,onPress,children, ...rest} = tableLinkPropsMutator(props);
    testID = defaultStr(testID,"RN_TableDataLinkContainer")
    foreignKeyTable = defaultStr(foreignKeyTable).trim();
    foreignKeyColumn = defaultStr(foreignKeyColumn).trim();
    isStructData = isStructData || defaultStr(type).toLowerCase().replaceAll("_","").replaceAll("-","").includes("structdata");
    rest = defaultObj(rest);
    containerProps = defaultObj(containerProps)
    labelProps = defaultObj(labelProps);
    data = defaultObj(data);
    id = typeof id =='number'? String(id) : defaultStr(id);
    if(!id || !foreignKeyTable){
        readOnly = true;
    }
    const pointerEvents = disabled || readOnly ? 'none' : 'auto';
    const onPressLink = (event)=>{
        React.stopEventPropagation(event);
        if((isNonNullString(perm))){
            if(!Auth.isAllowedFromString(perm))return;
        } else {
            if(!Auth[isStructData?"isStructDataAllowed":"isTableDataAllowed"]({table:foreignKeyTable,action:'read'})) return;
        }
        const args = {...React.getOnPressArgs(event),...rest,type,columnType:type,isStructData,fetch,foreignKeyTable,foreignKeyColumn,data,id,value:id};
        let r = typeof onPress =='function'? onPress(args) : undefined;
        if(r === false) return;
        const cb = (a)=>{
            const r2 = typeof fetchForeignData === 'function'? fetchForeignData({...args,...defaultObj(a)}) : undefined;
            if(isPromise(r2)){
                return r2.then((data)=>{
                    const nav = isStructData ? navigateToStructData : navigateToTableData;
                    if(isObj(data) && (isNonNullString(foreignKeyColumn) ? data[foreignKeyColumn] !== undefined:true)){
                        nav({tableName:foreignKeyTable,isStructData,data});
                    }
                });
            }
            return Promise.reject({msg:'type de données retournée par la fonction fetchForeignKeyData invalide',fetchForeignData,foreignKeyTable,foreignKeyColumn,id,data});
        }
        openPreloader("traitement de la requête...");
        if(isPromise(r)){
            r.then(cb).finally(closePreloader);
        } else {
            cb().finally(closePreloader);
        }
    }
    rest.style = [rest.style,{pointerEvents},_styles.cursorPointer];
    const CP = disabled || readOnly ? View : Pressable;
    return <CP testID={testID} onLongPres={(e)=>React.stopEventPropagation(e)} {...containerProps} onPress={disabled || readOnly? undefined : onPressLink} style={[styles.container,containerProps.style]}>
        <Tooltip testID={testID+"_Tooltip"} {...rest} Component={Component}  onPress={disabled || readOnly?undefined:onPressLink} ref={ref} pointerEvents={pointerEvents} readOnly={readOnly} disabled = {disabled}>
            <Label testID={testID+"_Label"} underlined primary {...labelProps} style={[_styles.lh15,labelProps.style]} disabled={disabled} readOnly={readOnly}>{children}</Label>
        </Tooltip>
    </CP>
});

export default TableLinKComponent;


TableLinKComponent.propTypes = {
    foreignKeyColumn : PropTypes.string,//le nom de la colonne de la clé étrangère
    foreignKeyTable : PropTypes.string, //le nom de la table référencée
    fetchForeignData : PropTypes.func, // la fonction permettant de chercher la données à distance
    server : PropTypes.string,//le serveur sur lequel rechercher les données
    primary : PropTypes.bool,//si le composant sera stylé en theme primary de react
    ///les props à utiliser pour afficher la table de données en cas de click sur le lien
    triggerProps : PropTypes.object,
    /*** l'id de la données à récupérer en cas de clic sur le lien */
    id : PropTypes.oneOfType([PropTypes.number,PropTypes.string]),
    routeName : PropTypes.string,///la route via laquelle on devra naviguer
    routeParam : PropTypes.object,///les props à passer à la route en question
    children : PropTypes.node
}

const styles = StyleSheet.create({
    container : {
        alignSelf : 'flex-start',
        flexGrow : 0,
        paddingRight : 5,
        paddingVertical : 5,
    }
})

TableLinKComponent.displayName = "TableLinKComponent";