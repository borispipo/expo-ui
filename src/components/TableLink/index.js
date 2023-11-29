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
const TableLinKComponent = React.forwardRef(({containerProps,children,labelProps,...props},ref)=>{
    const {testID,onPressLink,disabled,readOnly,fetchData,navigate,isAllowed:checkIfAllowed,Component,...rest} = usePrepareProps(props);
    containerProps = defaultObj(containerProps);
    labelProps = defaultObj(labelProps);
    const CP = disabled || readOnly ? View : Pressable;
    return <CP testID={testID} onLongPres={(e)=>React.stopEventPropagation(e)} {...containerProps} onPress={disabled || readOnly? undefined : onPressLink} style={[styles.container,containerProps.style]}>
        <Tooltip testID={testID+"_Tooltip"} {...rest} style={[rest.style,{pointerEvents: disabled || readOnly ? 'none' : 'auto'}]} Component={Component}  onPress={disabled || readOnly?undefined:onPressLink} ref={ref}  readOnly={readOnly} disabled = {disabled}>
            <Label testID={testID+"_Label"} underlined primary {...labelProps} style={[_styles.lh15,labelProps.style]} disabled={disabled} readOnly={readOnly}>{children}</Label>
        </Tooltip>
    </CP>
});

export const usePrepareProps = (props)=>{
    const {components:{tableLinkPropsMutator}} = useContext();
    let {disabled,readOnly,labelProps,server,isStructData,type,perm,isAllowed,id,fetchForeignData,foreignKeyTable,foreignKeyColumn,data,testID,Component,routeName,routeParams,component,primary,triggerProps,onPress, ...rest} = tableLinkPropsMutator(props);
    testID = defaultStr(testID,"RN_TableDataLinkContainer")
    foreignKeyTable = defaultStr(foreignKeyTable).trim();
    foreignKeyColumn = defaultStr(foreignKeyColumn).trim();
    isStructData = isStructData || defaultStr(type).toLowerCase().replaceAll("_","").replaceAll("-","").includes("structdata");
    data = defaultObj(data);
    id = typeof id =='number'? String(id) : defaultStr(id);
    if(!id || !foreignKeyTable){
        readOnly = true;
    }
    const fetchArgs = {type,columnType:type,isStructData,fetch,foreignKeyTable,foreignKeyColumn,data,id,value:id};
    const checkIfAllowed = ()=>{
        if((isNonNullString(perm))){
            if(!Auth.isAllowedFromString(perm))return false;
        } else {
            if(typeof isAllowed ==="function"){
                if(!isAllowed(args)) return false;
            } else if(!Auth[isStructData?"isStructDataAllowed":"isTableDataAllowed"]({table:foreignKeyTable,action:'read'})) return false;
        }
        return true;
    }
    const navigate = (data)=>{
        const nav = isStructData ? navigateToStructData : navigateToTableData;
        if(isObj(data) && (isNonNullString(foreignKeyColumn) ? data[foreignKeyColumn] !== undefined:true)){
            nav({tableName:foreignKeyTable,isStructData,data});
            return Promise.resolve({data,foreignKeyTable});
        }
        return Promise.reject({msg:`type de données retournée par la fonction fetchForeignKeyData invalide, paramètres : table:${foreignKeyTable}, value:${id}`,fetchForeignData,foreignKeyTable,foreignKeyColumn,id,data});
    }
    const fetchData = (opts)=>{
        return Promise.resolve(typeof fetchForeignData === 'function'? fetchForeignData({...fetchArgs,...defaultObj(opts)}) : undefined).then(navigate)
    }
    const onPressLink = (event)=>{
        React.stopEventPropagation(event);
        const args = {...React.getOnPressArgs(event),...fetchArgs};
        if(checkIfAllowed() !== true) return;
        const r = typeof onPress =='function'? onPress(args) : undefined;
        if(r === false) return;
        openPreloader("traitement de la requête...");
        Promise.resolve(r).then((opts)=>fetchData({...args,...defaultObj(opts)})).finally(closePreloader);
    }
    rest.style = [rest.style,_styles.cursorPointer];
    return {...rest,id,disabled,fetchData,navigate,isAllowed:checkIfAllowed,readOnly,testID,onPressLink}
}

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