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
import theme,{defaultDarkTheme,Colors,defaultLightTheme,lightColors,darkColors} from "$theme";
import Provider from "$ecomponents/Form/FormData/DialogProvider";
import Dropdown from "$ecomponents/Dropdown";
import {defaultObj} from "$cutils";
import Icon from "$ecomponents/Icon";
import {open,close} from "$preloader";
import {fields,getThemeData} from "$theme/utils";
import {modes} from "$ecomponents/TextField/utils";
import { useColorScheme } from "react-native";
import {createMaterial3Theme,getMaterial3Theme} from "@pchmn/expo-material3-theme";
import notify from "$cnotify";

const mColors = [
    {
        light: '#FFE082',
        dark: '#FFE082',
    },
    {
        light: '#3E8260',
        dark: '#ADF2C7',
    },
    {
        light: '#756FAB',
        dark: '#E5DFFF',
    },
     {
        light: '#9F6C2C',
        dark: '#FDDDB9',
    },
]

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
    const colorScheme = useColorScheme();
    const prepareTheme = (_theme)=>{
        if(!isObj(_theme)) return _theme;
        const dark = _theme.dark;
        const cols = dark ? darkColors : lightColors;
        _theme.divider = Colors.isValid(_theme.divider)? _theme.divider : cols.divider;
        _theme.text = Colors.isValid(_theme.text) ? _theme.text : _theme.onBackground || _theme.onSurface;
        ["primary","secondary"].map((p)=>{
            const k = `on${p.ucFirst()}`;
            if(_theme[k] && _theme[p]){
                if(Colors.getContrast(_theme[k]) === Colors.getContrast(_theme[p])){
                    _theme[k] = dark ? Colors.lighten(_theme[k]) : Colors.darken(_theme[k]);
                } 
            }
        });
        ["warning","error","info","success","divider"].map((c)=>{
            if(!Colors.isValid(_theme[c])){
                _theme[c] = cols[c];
            }
            const onKey = `on${c.ucFirst()}`;
            _theme[onKey] = _theme[onKey] || cols[onKey];
        });
        if(!Colors.isValid(_theme.primaryOnSurface)){
            if( Colors.getContrast(_theme.primary) === Colors.getContrast(_theme.onSurface)){
                _theme.primaryOnSurface = _theme.primary;
            } else {
                _theme.primaryOnSurface = _theme.onSurface;
            }
        }
        if(!Colors.isValid(_theme.secondaryOnSurface)){
            if(Colors.getContrast(_theme.secondary) == Colors.getContrast(_theme.onSurface)){
                _theme.secondaryOnSurface = _theme.secondary
            } else {
                _theme.secondaryOnSurface = _theme.onSurface;
            }
        }
        return _theme;
    }
    const customColors = React.useMemo(()=>{
        const colors = getColors({withNamed:false});
        const namedColors = getColors({withDefaults:false});
        const nColors = {};
        mColors.map((c,index)=>{
            try {
                const name = `custom${index+1}`;
                ['light','dark'].map((sheme)=>{
                    const n = `${name}-${sheme}`;
                    const t = getMaterial3Theme(c[sheme]);
                    nColors[n] = prepareTheme({
                        name:n,
                        primaryName : c[sheme],
                        secondaryName : n,
                        ...t[sheme],
                        dark:sheme ==="dark",
                    });
                });
            } catch(e){console.log(e," preparing theme")}
        });
        return {...colors,...nColors,...namedColors};
    },[]);
    const itemsRef = React.useRef({...defaultObj(user.customThemes),...customColors});
    fields.textFieldMode = {
        type : 'select',
        items : {...modes,none:{code:'',label:'Dynamique'}},
        text : 'Mode d\'affichage des champs de texte'
    }
    fields.dark =  Object.assign({},fields.dark);
    fields.dark.defaultValue = colorScheme =="dark"? 1 : 0;
    const showThemeExplorer = (data)=>{
        const dat2 = data = defaultObj(data,defTheme);
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
                    itemsRef.current = {...customThemes,...customColors};
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
            return Provider.open({
                title : "Ajouter un theme personnalisé",
                fields : {
                    color : {
                        type :"color",
                        text : 'A partir de la couleur',
                        required : true,
                    },
                    name : fields.name,
                    dark : fields.dark,
                },
                onSuccess : ({data})=>{
                    try {
                        const theme = createMaterial3Theme(data.color)
                        const dat = prepareTheme({...data,...Object.assign({},(data.dark? theme.dark : theme?.light))});
                        delete dat.color;
                        setTimeout(()=>{
                            showThemeExplorer(dat);
                        },200);
                    } catch(e){
                        notify.error(e);
                        Provider.close();
                    }
                }
            })
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
                <Label style={[getStyle(primary),{height:'100%',borderLeftWidth:10,borderLeftColor:dark?"black":"white"}]}>
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