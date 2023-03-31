import FormDataScreen from "$elayouts/Screen/FormData";
import {defaultStr,defaultObj,isObjOrArray,isObj} from "$cutils";
import Auth from "$cauth";
import {navigate} from "$cnavigation";
import SelectTheme from "$themeSelectorComponent";
import Preloader from "$epreloader";
import {SignIn2SignOut} from "$cauth";
import React from "$react";
import avatarProps from "$eauth/avatarProps";

import {screenName} from "./utils";

export default function UserProfileScreen(props){
    const user = defaultObj(props.user,Auth.getLoggedUser());
    const testID = defaultStr(props.testID,"RN_UserProfile_FormData");
    const themeRef = React.useRef(defaultObj(user.theme));
    const hasChangeRef = React.useRef(false);
    const authProfileFields = typeof SignIn2SignOut.authProfileFields =='function'?SignIn2SignOut.authProfileFields(props) : SignIn2SignOut.authProfileFields;
    const fields = isObj(authProfileFields)? Object.clone(authProfileFields) : {};
    const formFields = {
        avatar : {
            ...avatarProps,
            ...(isObj(fields.avatar)?fields.avatar:{}),
            text : undefined,
            label : undefined,
            responsive : false,
            responsiveProps : {
                style : {
                    width : '100%',
                    alignItems : 'center',
                    justifyContent : 'center',
                }
            },
        },
    }
    Object.map(fields,(field,i)=>{
        if(i !='avatar' && isObj(field)){
            formFields[i] = field;
        }
    })
    formFields.theme = {
        type  : 'html',
        text : 'Theme',
        onChange : ({value})=>{
            if(isObj(value) && value.name && value.primary && value.name !== themeRef.current.name){
                hasChangeRef.current = true;
                themeRef.current = value;
            }
        },
        onUpsert : ({value})=>{
            if(value.name === themeRef.current.name){
                hasChangeRef.current = true;
                themeRef.current = value;
            }
        },
        render : (p)=>{
            return <SelectTheme {...p} defaultValue = {themeRef.current.name}/>
        }
    }
    formFields.avatar.onChange = (args)=>{
        if(args.value === user.avatar) return;
        hasChangeRef.current = true;
    }
    const onSaveProfile = ({data,goBack,...rest})=>{
        data.theme = themeRef.current;
        Preloader.open("Modification en cours...");
        Auth.upsertUser({...user,...data},true).then(()=>{
            if(typeof goBack =='function' && !hasChangeRef.current){
                return goBack(true);
            }
            navigate('Home');
        }).finally(()=>{
            setTimeout(()=>{
                Preloader.close();
            },1000);
        });
    }
    
    return <FormDataScreen
        title = {(user.label?(user.label+" ["+user.code+"]  | "):"")+"Profil : Modifier"}
        {...props}
        modal
        withScrollView
        fields = {formFields}
        data = {user}
        testID = {testID}
        onSave = {onSaveProfile}
        subtitle = {false}
    />
}

UserProfileScreen.screenName = screenName;

UserProfileScreen.Modal = true;

UserProfileScreen.authRequired = true;