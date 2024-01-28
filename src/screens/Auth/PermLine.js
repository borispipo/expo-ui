import PermText from "./PermText";
import React from "$react";
import Expandable from "$ecomponents/Expandable";
import {defaultObj,defaultStr,isNonNullString,defaultVal} from "$cutils";
import PropTypes from "prop-types";
import {hasResource} from "./utils";
import { StyleSheet } from "react-native";
import View from "$ecomponents/View";
import {Cell} from "$ecomponents/Grid";
import theme from "$theme";

const PermLine = ({text,cellProps,isUserMasterAdmin,withGrid,defaultActions,resource,perms:cPerms,disabled,allPerms,table,index,onChange,keyname,actions,testID,...rest})=>{
    const [state,setState] = React.useState({
        data : defaultObj(rest.data),
        expanded : defaultBool(rest.expanded,false)
    });
    allPerms = defaultObj(allPerms);
    cellProps = defaultObj(cellProps);
    testID = defaultStr(testID,"RN_AuthPermLineComponent_"+index);
    table = defaultStr(table).toLowerCase();
    resource = resource.toLowerCase();
    if(!table) {
        console.error("table non spécifiée pour la perm line ",table,rest);
        return null;
    }
    cPerms = defaultObj(cPerms);;
    const perms = React.useMemo(()=>{
        const perms = defaultObj(cPerms);
        if(perms.defaultActions !== false || (isObj(perms[resource]) && Object.size(perms[resource],true)>0)){
            const _acts = perms.defaultActions !== false ? {...defaultActions} : {};
            Object.map(_acts,(a,aa)=>{
                const aa2 = a && a.alias && typeof a.alias =='string' && a.alias;
                if(perms[aa] === false || perms[aa.toLowerCase()+'Action'] === false || (aa2 && (perms[aa2] === false || perms[aa2.toLowerCase()+'Action'] === false))){
                    delete _acts[aa];
                }
            });
            if(isObj(perms[resource])){
                perms[resource] = {
                   ...perms[resource],
                    actions : {
                        ..._acts,
                        ...defaultObj(perms[resource].actions)
                    }
                }
            } else {
                perms[resource] = {
                    text,
                    actions : _acts
                }
            }
        } 
        return perms;
    },[cPerms.defaultActions,cPerms[resource]])
    let allChecked = true;
    isUserMasterAdmin = !!isUserMasterAdmin;
    let checked = isUserMasterAdmin;
    const onToggleSingle = ({resource,checked,action})=>{
        if(!resource){
            console.error("Invalid resource toggle ",resource,checked,action);
            return;
        }
        if(isUserMasterAdmin || !isNonNullString(action) || !isNonNullString(resource) || !isNonNullString(allPerms[resource])){
            return;
        }
        const data = {...state.data};
        const allAction = defaultStr(allPerms[resource]);
        if(allAction === "all"){
            if(checked){
                data[resource] = allAction;
            } else delete data[resource];
        } else  {
            data[resource] = defaultStr(data[resource]).toLowerCase();
            let spl = data[resource].split("2");
            if(checked){
                if(action !== 'read' && allAction.toLowerCase().split("2").includes('read') && !spl.includes('read')){
                    spl.push('read');
                }
                if(!spl.includes(action)){
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
    }
    const toggleAll = (arg)=>{
        const {checked} = arg;
        const data = {...state.data};
        for(let i in allPerms){
            if(hasResource(i,resource)){
                if(!checked){
                    delete data[i];
                } else {
                    data[i] = allPerms[i];
                }
            }
        }
        setState({...state,data});
    }
    React.useEffect(()=>{
        if(onChange){
            onChange({data:state.data,resource,table});
        }
    },[state.data])
    const content = React.useStableMemo(()=>{
        const content = [];
        Object.map(perms,(perm,i)=>{
            const pText = defaultStr(perm.text,perm.label);
            if(!isObj(perm.actions)){
                if(!isNonNullString(pText)) return null;
                allPerms[i] = "all";
                checked = isUserMasterAdmin? true : isNonNullString(state.data[i]);
                if(!checked){
                    allChecked = false;
                }
                content.push(<PermText isUserMasterAdmin={isUserMasterAdmin} key = {i} table={table} tooltip={defaultStr(perm.tooltip,perm.title,perm.desc)} onToggle={onToggleSingle} text={pText} checked ={checked} resource={i} action ={'all'}/>);
                return;
            } 
            allPerms[i] = "";
            const splitP = defaultStr(state.data[i]).toLowerCase().split("2");
            const pContent = []
            const hasS = isNonNullString(text) && isNonNullString(pText) && pText.toLowerCase() != text.toLowerCase()
            Object.map(perm.actions,(p,j)=>{
                if(!isObj(p) || !isNonNullString(p.text)) return null;
                allPerms[i] = (isNonNullString(allPerms[i])?(allPerms[i]+"2"):"")+j;
                checked = isUserMasterAdmin? true : splitP.includes(j);
                if(!checked){
                    allChecked = false;
                }
                pContent.push(<PermText labelStyle ={hasS? styles.permChildren : undefined} isUserMasterAdmin={isUserMasterAdmin}  key={j} table={table} onToggle={onToggleSingle} tooltip={defaultStr(p.tooltip,p.title,p.desc)} text = {p.text} checked ={checked} actions={perm.actions} resource={i} action ={j}/>)
            });
            if(pContent.length){
                content.push(<View key={i} style={{backgroundColor:theme.colors.surface}} testID={testID+"_Content_"+i}>
                    {hasS ? <Label testID={testID+'_Label'}>{pText}</Label> : null}
                    {pContent}
                </View>)
            }
    
        });
        return content;
    },[perms,state.data,state.expanded]);
    if(!content.length) return null;
    return <Cell testID={testID+"_Cell"} tabletSize={6} desktopSize={4} phoneSize={12} {...cellProps}>
        <Expandable  
            expandedIcon ={'chevron-right'} 
            unexpandedIcon = {'chevron-down'}
            elevation = {5}
            {...rest} 
            testID = {testID}
            expandIconPosition = {"left"}
            onPress={(e)=>{
                setState({...state,expanded:!state.expanded})
            }}
            contentProps = {{style:styles.expandableContent}}
            expanded={state.expanded} 
            title = {
                <PermText 
                    table={table} 
                    labelStyle = {false}
                    checked = {allChecked} 
                    disabled = {disabled}
                    resource={resource} 
                    action={allPerms[resource]} 
                    text={text} 
                    testID = {testID+"_"+table}
                    isUserMasterAdmin = {isUserMasterAdmin}
                    onToggle = {toggleAll}
                />
            }
        >
            {content}
        </Expandable>
    </Cell>
}


PermLine.propTypes = {
    text : PropTypes.string,
    resource : PropTypes.string.isRequired,
    cellProps : PropTypes.object,//les props du composant Cell, wrappeur au composant PermLine
    defaultActions : PropTypes.object.isRequired,//les actions par défault
}

const styles = StyleSheet.create({
    expandableContent : {
        paddingLeft : 30,
    },
    permChildren : {
        paddingLeft : 20,
    },
});

PermLine.displayName = "AuthPermLineComponent";

export default PermLine;