// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
///permet de sélectionner un theme utilisateur
import React from "$react";
import Label from "$ecomponents/Label";
import Auth,{login,getLoginId} from "$cauth";
import View from "$ecomponents/View";
import { StyleSheet } from "react-native";
import defaultTheme,{getColors} from "$theme/defaultTheme";
import theme,{defaultDarkTheme,Colors,defaultLightTheme} from "$theme";
import Provider from "$ecomponents/Form/FormData/DialogProvider";
import Dropdown from "$ecomponents/Dropdown";
import {defaultObj} from "$cutils";
import Icon from "$ecomponents/Icon";
import {open,close} from "$preloader";
import {fields,getThemeData} from "$theme/utils";

const getStyle = (color)=>{
    if(!Colors.isValid(color)) return {};
    return {backgroundColor:color,paddingHorizontal:10,paddingVertical:5,color:Colors.getContrast(color)};       
}

const ThemeSelectorComponent = React.forwardRef((props,ref)=>{
    const innerRef = React.useRef(null);
    return <Dropdown
        {...getThemeFieldProps(props,innerRef)}
        ref = {React.useMergeRefs(innerRef,ref)}
    />
});


const isDocEditing = ({data})=>{
    return data && isNonNullString(data.name)? true : false;
};

export const getThemeFieldProps = (props,ref)=>{
    props = defaultObj(props);
    let {user,showAdd,onValidate,onChange,onUpsert,...rest} = props;
    const loggedUser = defaultObj(Auth.getLoggedUser());
    user = defaultObj(user,loggedUser); 
    const loginId = getLoginId(user);
    const hasLoginId = isNonNullString(loginId) || typeof loginId =='number';
    const isUserActive = getLoginId(loggedUser) == loginId && hasLoginId ? true : false;
    const userTheme = defaultObj(user.theme);
    const userThemeName = defaultStr(userTheme.name,defaultTheme.name);
    const isDark = theme.isDark() || theme.isDarkUI();
    const defTheme = isDark ? {...defaultDarkTheme.colors,dark:true} : {...defaultLightTheme.colors,dark:false};
    const itemsRef = React.useRef({...defaultObj(user.customThemes),...getColors()});
    const showThemeExplorer = (data)=>{
        data = defaultObj(data,defTheme);
        fields.name.disabled = ({data})=> data && isNonNullString(data.name);
        const title = data && data.name ? ("Modifier ["+data.name+"]") : ('Nouv theme['+loginId+"]");
        const isEditing = isDocEditing(data);
        fields.textFieldMode.defaultValue = theme.textFieldMode;
        fields.profilAvatarPosition.defaultValue = theme.profilAvatarPosition;
        Provider.open({
            cancelButton : true,
            dialogProps : {
                withScrollView : true,
                fullScreen : true,
            },
            data,
            title,
            isDocEditing,
            actions : [{
                text : 'Enregistrer',
                primary : true,
                icon : "check",
                onPress : ({data,formName,...args})=>{
                    ///un utilisateur doit avoir au max 10 Thème personnalisés
                    const customThemes = defaultObj(user.customThemes);
                    let cKeys = [];
                    Object.map(customThemes,(cT,i)=>{
                        if(!isObj(cT) || !cT.custom){
                            delete customThemes[i];
                            return;
                        }
                        cKeys.push(i);
                    });
                    const counter = cKeys.length;
                    if(counter > 10){
                        delete customThemes[cKeys[0]]
                    }
                    data.custom = true;
                    customThemes[data.name] = data;
                    itemsRef.current = {...customThemes,...getColors()};
                    user.customThemes = customThemes;
                    open((isEditing?"Modification ":"Enregistrement ")+"du thème...");
                    Auth.upsertUser(user,false).then(()=>{
                        if(Auth.getLoginId(Auth.getLoggedUser()) == getLoginId(user)){
                            login(user,false);
                        }
                        if(ref && ref.current && ref.current.refresh){
                            ref.current.refresh(true);
                        }
                        if(typeof onUpsert =='function'){
                            onUpsert({data,theme:data,value:data});
                        }
                    }).finally(()=>{
                        Provider.close();
                        close();
                    });
                }
            }],
            fields,
        });
    }
    rest = {
        multiple : false,
        ...defaultObj(rest),
        showAdd : typeof showAdd =='boolean'? showAdd : isUserActive || Auth.isTableDataAllowed({table:'users',action:'"changeTheme"'}),
        addIconTooltip : "Cliquez pour ajouter un nouveau thème",
        onAdd : ()=>{
            showThemeExplorer();
        },
        onChange : (args)=>{
            args = defaultObj(args);
            const {value} = args
            if(!value) return;
            const {theme,value:validValue} = getThemeData(value);
            args.theme = theme;
            args.realValue = value;
            args.value = validValue;
            if(typeof onValidate =='function'){
                onValidate(args);
            } 
            if(typeof onChange =='function'){
                onChange(args);
            }
        },
        defaultValue : userThemeName,
        items : x =>{
            return itemsRef.current;
        },
        compare : (item,selected)=>{
            if(isNonNullString(selected)){
                if(isObj(item) && item.name == selected) {
                    return true;
                }
                if(isNonNullString(item)) return item === selected ? true : false;
            }
            return isObj(item) && isObj(selected) && item.name == selected.name ? true : false;
        },
        itemValue : ({item})=>{return item;},
        renderText : ({item,index}) =>{ return defaultStr(item?.name,index+"")},
        renderItem : ({item,index}) =>{
            let {primary,secondary,name,primaryName,secondaryName,dark} = item
            let split = index.split("-")
            let pText = defaultStr(item.custom?name:primaryName,split[0],name,primary)
            let sText = defaultStr(secondaryName,split[1],secondary);
            //<Icon icon={dark?'brightness-6':'brightness-4'} size={15} title={dark?'Sombre':'Clair'}/> 
            return <View style={[styles.buttonContainer]}>
                <Label style={[getStyle(primary),{height:'100%',borderLeftWidth:10,borderLeftColor:dark?defaultDarkTheme.colors.surface:defaultLightTheme.colors.background}]}>
                    {pText}
                </Label>
                <View style={[styles.labelRight]}>
                    <Label style={[getStyle(secondary)]}>
                        {sText}
                    </Label>
                    {<Icon size={20} 
                        name={item.custom?'pencil':'plus'} 
                        title={(item.custom?'Cliquer pour modifier le thème': ' Ajouter un thème basé sur le thème')+' ['+item.name+"]"} 
                        onPress = {(e)=>{
                            React.stopEventPropagation(e);
                            showThemeExplorer({...Object.clone(item),name:item.custom?item.name:undefined,primaryName:item.custom ? item.primaryName : undefined, secondaryName : item.custom ? item.secondaryName:undefined});
                        }} 
                    />}
                </View>
            </View>
        }
    }
    rest.text = defaultStr(rest.text,rest.label,'Thème');
    return rest;
}

ThemeSelectorComponent.displayName = "ThemeSelectorComponent";


export default ThemeSelectorComponent;

const styles = StyleSheet.create({
    theme : {
        padding : 2,
        marginBottom : 2,
    },
    itemContainer : {
        width : '100%',
    },
    buttonContainer : {
        width : '100%',
        flexDirection :'row',
        alignItems :'center',
    },
    labelRight : {
        width : '100%',
        flex : 1,
        flexDirection :'row',
        alignItems :'center',
    }
});