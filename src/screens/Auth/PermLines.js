import React from "$react";
import { StyleSheet } from "react-native";
import {defaultObj,extendObj} from "$cutils";
import Auth from "$cauth";
import Expandable from "$ecomponents/Expandable";
import PropTypes from "prop-types";
import theme from "$theme";
import {defaultActions as mDefaultAction,hasResource} from "./utils";
import PermLine from "./PermLine";
import Grid from "$ecomponents/Grid";

const PermLines = React.forwardRef(({user,gridProps,defaultActions:cDefaultActions,disabled,isUserMasterAdmin:cIsMasterAdmin,permLineProps,cellProps,containerProps,style,tablePermPrefix,tables,title,testID,perms,onChange:cOnChange,...props},ref)=>{
    const isUserMasterAdmin = !!cIsMasterAdmin;
    user = defaultObj(user,Auth.getLoggedUser());
    gridProps = defaultObj(gridProps);
    containerProps = defaultObj(containerProps);
    containerProps.style = [theme.styles.w100,containerProps.style]
    cellProps = defaultObj(cellProps);
    permLineProps = defaultObj(permLineProps);
    const allPerms = React.useRef({}).current;
    const dataRef = React.useRef(defaultObj(perms));
    const defaultActions = React.useRef(extendObj(true,{},mDefaultAction,defaultActions)).current;
    const data = dataRef.current;
    disabled = !!disabled || isUserMasterAdmin;
    tablePermPrefix = defaultStr(tablePermPrefix,"table/").toLowerCase();
    const  onChange = disabled ? undefined : (arg)=>{
        let {data,resource} = arg;
        if(!isNonNullString(resource)) return;
        const sData = dataRef.current;
        data = defaultObj(data);
        for(let i in allPerms){
            if(hasResource(i,resource)){
                if(isUndefined(data[i])){
                    delete sData[i];
                } else {
                    sData[i] = data[i]
                }
            }
        }
        dataRef.current = sData;
        if(cOnChange){
            cOnChange({...arg,data:sData});
        }
    }
    testID = defaultStr(testID,"RN_PermsLines");
    const context = React.useRef({}).current;
    context.getData = x=> data;
    React.setRef(ref,context);
    React.useEffect(()=>{
        return ()=>{
            React.setRef(ref,null);
        }
    },[]);
    
    const content = React.useMemo(()=>{
        const content = [];
        Object.map(tables,(table,tableName)=>{
            if(!isObj(table) || !isObj(table.perms)) return null;
            tableName = defaultStr(table.tableName,table.table,tableName).toLowerCase().trim();
            const text = defaultStr(table.text,table.label)
            const resource = (tablePermPrefix+tableName.ltrim(tablePermPrefix)).toLowerCase();
            const perms = {};
            Object.map(table.perms,(perm,i)=>{
                if(perm ===false) {
                    perms[i] = false;
                    return;
                }
                if(!isObj(perm)) return;
                const iLower = i.toLowerCase();
                if(iLower == 'defaultactions' || iLower =='defaultaction'){
                    perms.defaultActions = perm;
                }
                if(perm.defaultActions){
                    perm.actions = {
                        ...Object.clone(defaultActions),
                        ...defaultObj(perm.actions)
                    }
                }
                i = i.toLowerCase();
                i = (resource+"/"+i.ltrim(resource)).ltrim("/").replaceAll("//","/").rtrim("/").ltrim("/");
                perms[i] = perm;
            });
            content.push(<PermLine 
                cellProps={cellProps}
                {...permLineProps}
                allPerms = {allPerms}
                isUserMasterAdmin = {isUserMasterAdmin}
                disabled = {disabled}
                table = {tableName}
                tablePermPrefix = {tablePermPrefix}
                perms  = {perms}
                data = {data}
                defaultActions = {defaultActions}
                onChange = {onChange}
                text = {text}
                resource = {resource}
                key = {resource}
                index = {resource}
                user = {user}
            />);
        })
        return content;
    },[tables,allPerms,isUserMasterAdmin,disabled,tablePermPrefix])
    return <Expandable {...props} testID={testID} style={[theme.styles.w100,style]} containerProps={containerProps} titleProps = {{style:[styles.expandable,theme.styles.w100]}} title={title}>
        <Grid testID={testID+"_Grid"} {...gridProps}>
            {content }
        </Grid>
    </Expandable>
});

PermLines.displayName = "AuthPermsLinesComponent";
const PermTextType = PropTypes.shape({
    text : PropTypes.string,//le texte de la permission
    label : PropTypes.string,
    title : PropTypes.string, //le tooltip associé à la permission
    tooltip : PropTypes.string, //alias à title,
    actions : PropTypes.objectOf(PermTextType),//les actions supportées par la permission
    defaultAction : PropTypes.bool,//si les actions par défaut seront associés à la permission en cours
});

PermLines.propTypes = {
    data : PropTypes.object,
    gridProps : PropTypes.object,//les props du composant Grid, wrapper au contentu expandable
    isUserMasterAdmin : PropTypes.bool,//si l'utilisateur pour lequel on modifie la permission est un master admin
    ///les tables associées aux permissions
    tables : PropTypes.objectOf(
        PropTypes.shape({
            table : PropTypes.string,
            tableName : PropTypes.string,
            perms : PropTypes.object,
        })
    ).isRequired,
    perms : PropTypes.object,//la liste des permissions qui peuvent associer au compte d'un utilisaters
    /*** si les élements de permissions seront modifiable où non */
    disabled : PropTypes.bool,
    tablePermPrefix : PropTypes.string,/*** le prefixe de permission à jouter à chaque permissions de table de donénes, exemple : 'table/', pour le prefix des permissions de type table de données */
    title : PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.element,
        PropTypes.string,
    ]), //le titre des permission liés à la table de données
    defaultActions : PropTypes.object,//les actions par défaut aux permissions
}

export default PermLines;

const styles = StyleSheet.create({
    expandableContent : {
        paddingLeft : 30,
    },
    expandable : {
        paddingLeft : 10,
    },
    label : {fontSize:14},
    permChildren : {
        paddingLeft : 20,
    },
    checkbox : {
        //width : 20,
        //height : 20,
        margin : 0,
        padding: 0,
    }
});