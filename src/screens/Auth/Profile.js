import FormDataScreen from "$elayouts/Screen/FormData";
import {defaultStr,defaultObj,isObjOrArray,extendObj,isObj} from "$cutils";
import Auth from "$cauth";
import {navigate} from "$cnavigation";
import SelectTheme from "$ethemeSelectorComponent";
import Preloader from "$epreloader";
import {SignIn2SignOut} from "$cauth";
import React from "$react";
import avatarProps from "$eauth/avatarProps";
import useContext from "$econtext/hooks";
import PropTypes from "prop-types";
import APP from "$capp/instance";
import {isElectron} from "$cplatform";
import {isValidUrl} from "$cutils/uri";
import {screenName} from "./utils";

export default function UserProfileScreen({fields,...p}){
    const {auth:{profilePropsMutator}} = useContext();
    fields = extendObj({},fields,{
        avatar : {
            ...avatarProps,
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
            ...defaultObj(fields?.avatar),
        },
    })
    const p2 = {...p,fields};
    const props = typeof profilePropsMutator =='function'? extendObj({},p,profilePropsMutator(p2)) : p2;
    const user = defaultObj(props.user,Auth.getLoggedUser());
    const testID = defaultStr(props.testID,"RN_UserProfile_FormData");
    const themeRef = React.useRef(defaultObj(user.theme));
    const hasChangeRef = React.useRef(false);
    const formFields = isObj(props.fields)? props.fields : fields;
    Object.map(fields,(field,i)=>{
        if(i !='avatar' && isObj(field)){
            formFields[i] = field;
        }
    });
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
    if(isElectron() && typeof ELECTRON !=='undefined' && window?.ELECTRON && ELECTRON.session && typeof ELECTRON.session?.get =='function'){
        fields.mainElectronAppUrl = {
            label : "Url de l'application",
            onValidatorValid : ({value})=>{
                if(value && !isValidUrl(value)){
                    return "Vous devez spécifier une adresse url valide";
                } 
            },
            defaultValue : ELECTRON.appUrl,
        };
    }
    const onSaveProfile = ({data,goBack,...rest})=>{
        data.theme = themeRef.current;
        Preloader.open("Modification en cours...");
        const toSave = {...user,...data};
        return Auth.upsertUser(toSave,true).then((response)=>{
            if(isValidUrl(data.mainElectronAppUrl) && isElectron()){
                ELECTRON.appUrl = data.mainElectronAppUrl;
            }
            setTimeout(()=>{
                APP.trigger(APP.EVENTS.UPDATE_THEME,user.theme);
                APP.trigger(APP.EVENTS.AUTH_UPDATE_PROFILE,toSave);
            },100);
            if(typeof props.onSave ==='function' && props.onSave({...rest,data:toSave,response,goBack,navigate}) === false) return;
            if(props.navigateToHomeOnSave !== true && typeof goBack =='function' && !hasChangeRef.current){
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
        title = {(user.label?(user.label+" ["+Auth.getLoginId(user)+"]  | "):"")+"Profil : Modifier"}
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

UserProfileScreen.propTypes = {
    navigateToHomeOnSave : PropTypes.bool,//pour forcer la navigation à l'écran d'acceuil une fois qu'on est enregistrée les préférences, peut importe si le profil utilisateur a été mis à jour
    
}