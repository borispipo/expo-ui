import tables  from "$database/data/tables";
import Checkbox from "$components/Checkbox";
import React from "$react";
import { StyleSheet } from "react-native";
import {defaultVal,defaultObj,defaultBool,arrayValueExists} from "$utils";
import Auth from "$cauth";
import Label from "$ecomponents/Label";
import View from "$ecomponents/View";
import Expandable from "$ecomponents/Expandable";
import PropTypes from "prop-types";
import Grid,{Cell} from "$components/Grid";
import theme from "$theme";
import appConfig from "$capp/config";


let allPerms = {};
const defaultActions = {
    create : {
        text : 'Créer'
    },
    update : {
        text : 'Modifier'
    },
    delete : {
        text : 'Supprimer'
    },
    read : {
        text : 'Consulter',
    },
}
const expandIconProps = {
    //size : 20,
}
export const PermText = (props)=>{
    const {isMasterAdmin} = props;
    const {user} = props;
    const isAllowed = isMasterAdmin ? true : React.useRef(Auth.isTableDataAllowed({table:'users',user,action:'assignPerms'})).current;
    const {text,label,checked,labelStyle,table,type,onToggle,actions,action,resource,tooltip} = props;
    return <Checkbox
        title = {tooltip}
        disabled = {!isAllowed || isMasterAdmin}
        defaultValue = {checked || isMasterAdmin?1 : 0}
        style  = {[theme.styles.noPadding,theme.styles.noMarging,labelStyle !== false && styles.checkbox]}
        labelStyle = {[labelStyle !== false && styles.label,labelStyle && labelStyle]}
        label = {defaultVal(label,text)}
        onPress = {(args)=>{
            React.stopEventPropagation(args?.event);
            if(onToggle){
                onToggle({...args,checked:!!!checked,resource,actions,action,table,type})
            }
            return false;
        }}
    />
}



export const PermLine = (props)=>{
    const [state,setState] = React.useState({
        data : defaultObj(props.data),
        expanded : defaultBool(props.expanded,false)
    });
    let {text,user,isMasterAdmin,perms,table,index,onChange,type,keyname,actions,testID,...rest} = props; 
    testID = defaultStr(testID,"RN_AuthPermLineComponent_"+index);
    table = defaultStr(table).toLowerCase();
    type = defaultStr(type).toLowerCase();
    perms =  Object.assign({},perms);
    let resource = undefined;
    if(arrayValueExists(['table','structdata','struct_data'],type)){
        if(type === 'struct_data'){
            type = 'structdata';
        }
        resource = type+"/"+table;
        if(perms.defaultActions !== false || (isObj(perms[resource]) && Object.size(perms[resource],true)>0)){
            let _acts = {};
            if(perms.defaultActions !== false) {
                _acts = {...defaultActions};
            } 
            if(perms[resource]){
                perms[resource] = {
                    text,
                    actions : {..._acts,...defaultObj(perms[resource])}
                }
            } else {
                perms[resource] = {
                    text,
                    actions : {..._acts,...defaultObj(perms[resource])}
                }
            }
        } 
    }
    let allChecked = true;
    let checked = isMasterAdmin;
    const onToggleSingle = ({resource,checked,action})=>{
        if(isMasterAdmin || !isNonNullString(action) || !isNonNullString(resource) || !isNonNullString(allPerms[resource])){
            return;
        }
        const data = {...state.data};
        const allAction = defaultStr(allPerms[resource]);
        if(allAction == "all"){
            if(checked){
                data[resource] = allAction;
            } else delete data[resource];
        } else  {
            data[resource] = defaultStr(data[resource]).toLowerCase();
            let spl = data[resource].split("2");
            if(checked){
                if(action !== 'read' && arrayValueExists(allAction.toLowerCase().split("2"),'read') && !arrayValueExists(spl,'read')){
                    spl.push('read');
                }
                if(!arrayValueExists(spl,action,true)){
                    spl.push(action);
                }
            } else {
                let s1 = [];
                for(let i in spl){
                    if(spl[i].toLowerCase() !== action.toLowerCase()){
                        s1.push(spl[i]);
                    }
                }
                spl = s1;
            }
            if(spl.length>0){
                data[resource] = spl.join("2").ltrim("2").rtrim("2");
            } else delete data[resource];
        }
        setState({...state,data});
        if(onChange){
            onChange({data,resource,table,type});
        }
    }
    const toggleAll = (arg)=>{
        if(!isNonNullString(type) || !isNonNullString(table) || !isNonNullString(resource)){
            return;
        }
        const {checked} = arg;
        const data = {...state.data};
        for(let i in allPerms){
            if(i.toLowerCase().startsWith(resource)){
                if(!checked){
                    delete data[i];
                } else {
                    data[i] = allPerms[i];
                }
            }
        }
        setState({...state,data});
        if(onChange){
            onChange({data,resource,table,type});
        }
    }
    const content = [];
    Object.map(perms,(perm,i)=>{
        const pText = defaultStr(perm.text,perm.label);
        if(!isObj(perm.actions)){
            if(!isNonNullString(pText)) return null;
            allPerms[i] = "all";
            checked = isMasterAdmin? true : isNonNullString(state.data[i]);
            if(!checked){
                allChecked = false;
            }
            content.push(<PermText user={user} isMasterAdmin={isMasterAdmin} key = {i} table={table} tooltip={defaultStr(perm.tooltip,perm.title,perm.desc)} onToggle={onToggleSingle} text={pText} checked ={checked} resource={i} action ={'all'}/>);
            return;
        } 
        allPerms[i] = "";
        const splitP = defaultStr(state.data[i]).toLowerCase().split("2");
        const pContent = []
        Object.map(perm.actions,(p,j)=>{
            if(!isObj(p) || !isNonNullString(p.text)) return null;
            allPerms[i] = (isNonNullString(allPerms[i])?(allPerms[i]+"2"):"")+j;
            checked = isMasterAdmin? true : arrayValueExists(splitP,j,true);
            if(!checked){
                allChecked = false;
            }
            pContent.push(<PermText  user={user}  labelStyle ={styles.permChildren} isMasterAdmin={isMasterAdmin}  key={j} table={table} onToggle={onToggleSingle} tooltip={defaultStr(p.tooltip,p.title,p.desc)} text = {p.text} checked ={checked} actions={perm.actions} resource={i} action ={j}/>)
        });
        if(pContent.length){
            const hasS = isNonNullString(text) && isNonNullString(pText) && pText.toLowerCase() != text.toLowerCase()
            content.push(<View key={i} testID={testID+"_Content_"+i}>
                {hasS ? <Label testID={testID+'_Label'}>{pText}</Label> : null}
                {pContent}
            </View>)
        }

    });
    return <Expandable  
        expandIconProps = {expandIconProps}
        expandedIcon ={'chevron-right'} 
        unexpandedIcon = {'chevron-down'}
         {...defaultObj(rest)} 
        testID = {testID}
        expandIconPosition = {"left"}
        onPress={(e)=>{
            setState({...state,expanded:!state.expanded})
        }}
        contentProps = {{style:styles.expandableContent}}
        expanded={state.expanded} 
        title = {
            <PermText 
                user={user} 
                table={table} 
                labelStyle = {false}
                checked = {allChecked} 
                type={type} resource={resource} action={allPerms[resource]} 
                text={text} 
                testID = {testID+"_"+table}
                isMasterAdmin = {isMasterAdmin}
                onToggle = {toggleAll}
            />
        }
    >
            {content}
    </Expandable>
}


PermLine.propTypes = {
    text : PropTypes.string.isRequired,
    type : PropTypes.string.isRequired,
}

const PermLines = React.forwardRef((props,ref)=>{
    const isMasterAdmin = defaultBool(props.isMasterAdmin,false);
    const {user} = props;
    const dataRef = React.useRef(defaultObj(props.perms,defaultObj(props.data).perms));
    let {testID} = props;
    const data = dataRef.current;
    const  onChange = (arg)=>{
        if(isMasterAdmin) return;
        let {data,resource} = arg;
        if(!isNonNullString(resource)) return;
        const sData = dataRef.current;
        data = defaultObj(data);
        for(let i in allPerms){
            if(i.toLowerCase().startsWith(resource)){
                if(isUndefined(data[i])){
                    delete sData[i];
                } else {
                    sData[i] = data[i]
                }
            }
        }
        dataRef.current = sData;
        if(props.onChange){
            props.onChange({...arg,data:sData});
        }
    }
    
    testID = defaultStr(testID,"RN_PermsLines");
    const eProps = {style:[theme.styles.w100],containerProps:{style:[theme.styles.w100]}};
    const context = React.useRef({}).current;
    context.getData = x=> data;
    React.setRef(ref,context);
    React.useEffect(()=>{
        return ()=>{
            allPerms = {};
            React.setRef(ref,null);
        }
    },[]);
    
    return <Grid testID={testID}>
        <Cell tabletSize={10} desktopSize={6} phoneSize={12}>
            <Expandable expandIconProps = {expandIconProps} titleProps = {{style:styles.expandable}} title={"Table des données"} {...eProps}>
                <React.Fragment>
                {
                    Object.mapToArray(tables,(table,tableName)=>{
                    if(!isObj(table) || !isObj(table.perms)) return null;
                    tableName = tableName.toLowerCase().trim();
                    let text = defaultStr(table.text,table.label)
                    let key = ("table/"+tableName);
                    const perms = {};
                    Object.map(table.perms,(perm,i)=>{
                        const iLower = i.toLowerCase();
                        if(iLower == 'defaultactions' || iLower =='defaultaction'){
                            perms.defaultActions = perm;
                        }
                        if(!isObj(perm)) return ;
                        if(perm.defaultActions){
                            perm.actions = {
                                ...defaultActions,
                                ...defaultObj(perm.actions)
                            }
                        }
                        i = i.toLowerCase();
                        let k = key.toLowerCase();
                        i = (k+"/"+i.ltrim(k)).rtrim("/").replaceAll("//","/");
                        perms[i] = perm;
                    });
                    return <PermLine 
                        isMasterAdmin = {isMasterAdmin}
                        table = {tableName}
                        type = {"table"}
                        perms  = {perms}
                        data = {data}
                        onChange = {onChange}
                        text = {text}
                        resource = {key}
                        key = {key}
                        index = {key}
                        user = {user}
                    />
                })
            }
            </React.Fragment>
            <React.Fragment>
                {
                    Object.mapToArray(PERMS,(table,tableName)=>{
                        if(!isObj(table) || !isObj(table.perms)) return null;
                        tableName = tableName.toLowerCase().trim();
                        let text = defaultStr(table.text,table.label)
                        let key = ("table/"+tableName);
                        let perms = {};
                        perms[key] = {actions:{},text}
                        Object.map(table.perms,(perm,i)=>{
                            if(!isObj(perm)) return ;
                            if(perms.defaultActions){
                                perms[key].actions = {
                                    ...defaultActions,
                                    ...perms[key].actions
                                }
                            } else {
                                perms[key].actions[i] = perm;
                            }
                        })
                        return <PermLine 
                            isMasterAdmin = {isMasterAdmin}
                            table = {tableName}
                            type = {"extra"}
                            perms  = {perms}
                            data = {data}
                            onChange = {onChange}
                            text = {text}
                            resource = {key}
                            key = {key}
                            index = {key}
                            user = {user}
                        />
                    })
                }
            </React.Fragment>
            </Expandable>
        </Cell>
        <Cell tabletSize={8} desktopSize={6} phoneSize={12}  >
            <Expandable expandIconProps = {expandIconProps} titleProps = {{style:styles.expandable}} title="Données de structure" {...eProps}>
                {
                    Object.mapToArray(structData,(table,tableName)=>{
                        if(!isObj(table)) return null;
                        tableName = tableName.toLowerCase().trim();
                        let text = defaultStr(table.text,table.label)
                        let key = "structdata/"+tableName
                        let perms = {};
                        Object.map(table.perms,(perm,i)=>{
                            /**** l'on peut décider d'ajouter les actions par défaut à une permission
                             *  dans ce cas, il suffit dans la table des permissions, de préciser la valeur défault action
                             */
                            if(arrayValueExists(['defaultactions','defaultaction'],i.toLowerCase())){
                                perms.defaultActions = perm;
                            }
                            if(!isObj(perm)) return ;
                            if(perm.defaultActions){
                                perm.actions = {
                                    ...defaultActions,
                                    ...defaultObj(perm.actions)
                                }
                            }
                            i = i.toLowerCase();
                            let k = key.toLowerCase();
                            i = (k+"/"+i.ltrim(k)).rtrim("/").replaceAll("//","/");
                            perms[i] = perm;
                        })
                        return <PermLine 
                            isMasterAdmin = {isMasterAdmin}       
                            table = {tableName}
                            type = {"structdata"}
                            perms  = {perms}
                            data = {data}
                            onChange = {onChange}
                            text = {text}
                            resource = {key}
                            key = {key}
                            index = {key}
                            user = {user}
                        />
                    })
                }
            </Expandable>
        </Cell>
    </Grid>
});

PermLines.displayName = "PermsLines";

PermLines.propTypes = {
    data : PropTypes.object,
    perms : PropTypes.object
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