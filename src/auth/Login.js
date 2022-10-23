import React from "$react";
import {isNonNullString,isObj,defaultNumber,defaultStr,uniqid,extendObj,isFunction} from "$utils";
import {navigate} from "$cnavigation";
import FormData from "$ecomponents/Form/FormData/FormData";
import {getForm} from "$ecomponents/Form/utils";
import Button from "$ecomponents/Button";
import notify from "$notify";
import {StyleSheet} from "react-native";
import { useAuth } from "$cauth/AuthProvider";
import Preloader from "$epreloader";
import Dimensions from "$cplatform/dimensions";
import theme from "$theme";
import Label from "$ecomponents/Label";
import View from "$ecomponents/View";
import Avatar from "$ecomponents/Avatar";
import Surface from "$ecomponents/Surface";
import {Provider as DialogProvider} from "$ecomponents/Dialog";
import ScreenWithoutAuthContainer from "$escreen/ScreenWithoutAuthContainer";
import {getTitle} from "$escreens/Auth/utils";
import {isWeb} from "$cplatform";

import getLoginProps from "$getLoginProps";
const getProps = typeof getLoginProps =='function'? getLoginProps : x=>null;

const WIDTH = 400;

export default function LoginComponent(props){
    let {formName,step,appBarProps,onSuccess,withPortal,testID} = props;
    const loginTitle = getTitle();
    testID = defaultStr(testID,"RN_Auth.LoginComponent");
    formName = React.useRef(uniqid(defaultStr(formName,"login-formname"))).current;
    const nextButtonRef = React.useRef(null);
    const previousButtonRef = React.useRef(null);
    const dialogProviderRef = React.useRef(null);
    const backgroundColor = theme.colors.surface;
    const Wrapper = withPortal ? ScreenWithoutAuthContainer  : View;
    const _getForm = x=> getForm(formName);
    const isMounted = React.useIsMounted();
    
    const auth = useAuth();
    const notifyUser = (message,title)=> {
        if(isObj(message)){
            return notify.error({...message,position:'top'})
        } else if(typeof message =='object') return false;
        return notify.error({message,title,position:'top'});
    }
    const [state,_setState] = React.useState({
        step : defaultNumber(step,1),
        data : defaultObj(props.data),
    });
    const setState = (state2)=>{
        if(!isMounted()) return;
        state2 = isObj(state2)? state2 : {};
        return _setState({...state,...state2});
    }
    const getData = ()=>{
        const form = _getForm();
        if(form && form.getData){
            return extendObj({},state.data,form.getData());
        }
        return defaultObj(props.data);
    }
    const goToFirstStep = ()=>{
        setState({...state,step:1,data:getData()});
    }
    const focusField = (fieldName)=>{
        const form = _getForm();
        if(form){
            const field = form.getField(fieldName);
            if(field){
                field.focus();
            }
        }
    }
    
    
    if(withPortal){
        appBarProps = defaultObj(appBarProps);
        appBarProps.backAction = false;
    }
    React.useEffect(()=>{
        if(withPortal && isWeb() && typeof document !== 'undefined'){
            setTimeout(()=>{
                document.title = loginTitle
            },1000)
        }
    },[withPortal])
    const {header,children,initialize,data:loginData,canGoToNext,keyboardEvents,onSuccess:onLoginSuccess,canSubmit:canSubmitForm,onStepChange,...loginProps} = defaultObj(getProps({
        ...state,
        setState,
        state,
        showError : notifyUser,
        notifyUser,
        notify,
        getForm,
        getData,
        focusField,
        formName,
        nextButtonRef,
        previousButtonRef,
    }));
    React.useEffect(()=>{
        /*** pour initializer les cordonnées du composant login */
        if(typeof initialize =='function'){
            initialize();
        }
        Preloader.closeAll();
    },[]);
    const prevStep = React.usePrevious(state.step);
    React.useEffect(()=>{
        /*** lorsque le state du composant change */
        if(typeof onStepChange =='function'){
            return onStepChange({...state,previousStep:prevStep,focusField,nextButtonRef})
        }
    },[state.step]);
    /****la fonction à utiliser pour vérifier si l'on peut envoyer les données pour connextion
     * par défaut, on envoie les données lorssqu'on est à l'étappe 2
     * **/
    const canSubmit = typeof canSubmitForm =='function'? canSubmitForm : ({step})=>step >= 2;
    const goToNext = ()=>{
        let step = state.step;
        const data = getData();
        const form = _getForm();
        if(!form){
            notifyUser("Impossible de valider le formulaire car celui-ci semble invalide")
            return;
        }
        const args = {data,form,state,step,nextButtonRef,previousButtonRef};
        if(nextButtonRef.current && nextButtonRef.current.isDisabled()){
            return;
        }
        if(typeof canGoToNext =='function'){
            const s = canGoToNext(args);
            if(s === false) {
                nextButtonRef.current?.disable();
                return;
            }
            if(isNonNullString(s)){
                notifyUser(s);
                nextButtonRef.current?.disable();
                return
            }
            nextButtonRef.current?.enable();
        }
        if(step > 1){
            if(!form.isValid()){
                notifyUser(form.getErrorText());
                return;
            }
            if(canSubmit(args)){
                Preloader.open("vérification ...");
                return auth.signIn(data).then((a)=>{
                    if(typeof onLoginSuccess =='function' && onLoginSuccess(a)=== false) return;
                    if(isFunction(onSuccess)){
                        onSuccess(data);
                    } else {
                        navigate("Home");
                    } 
                }).finally(()=>{
                    Preloader.close();
                })
            }
        } else {
            setState({...state,step:step+1,data})
        }
    }
    
    const wrapperProps = withPortal ? {appBarProps,authRequired:false,title:loginTitle} : { style:styles.wrapper};
    return <Wrapper testID = {testID+"_Wrapper" }{...wrapperProps}>
        <DialogProvider ref={dialogProviderRef}/>
        <Surface style={[styles.container,{backgroundColor}]} testID={testID}>
            <Surface elevation = {0} mediaQueryUpdateNativeProps = {(a)=>{
                return {style:updateMediaQueryStyle()}
            }} testID={testID+"_Content"} style={[styles.content,updateMediaQueryStyle(),{backgroundColor}]}>
                <FormData 
                    formName = {formName}
                    testID = {testID+"_FormData"}
                    style = {[styles.formData,{backgroundColor}]}
                    header = {<View style = {[styles.header]}>
                        <Avatar testID={testID+"_Avatar"} size={50} secondary icon = 'lock'/>
                        <Label testID={testID+"_HeaderText"} bool style={{color:theme.colors.primaryOnSurface,fontSize:18,paddingTop:10}}>Connectez vous SVP</Label>
                        {React.isValidElement(header)? header : null}
                    </View>}
                    responsive  = {false}
                    {...loginProps}
                    formProps = {{
                        keyboardEvents : {
                            ...defaultObj(keyboardEvents),
                            enter : ({formInstance})=>{
                                goToNext();
                            }
                        }
                    }}
                    data = {extendObj(state.data,loginData)}
                >
                    <View testID={testID+"_ButtonsContainer"} style={[styles.buttonWrapper]}>
                        <Button 
                            ref = {nextButtonRef}
                            primary
                            mode = "contained"
                            rounded
                            style = {styles.button}
                            onPress = {goToNext}
                            icon = {state.step == 1? 'arrow-right':'login'}
                            surface
                        >
                            {state.step == 1? 'Suivant' : 'Connexion' }
                        </Button>
                        {state.step>=2 ? <Button 
                            onPress = {goToFirstStep}
                            ref = {previousButtonRef}
                            mode = "contained"
                            rounded
                            raised
                            style = {styles.button}
                            secondary
                            surface
                            icon = {'arrow-left'}
                        >
                            Précédent
                        </Button> : null}
                    </View>
                </FormData>
                {React.isValidElement(children) ? children : null}
            </Surface>
        </Surface>
    </Wrapper>;
}   


const updateMediaQueryStyle = ()=>{
    const isSmallPhone = Dimensions.isSmallPhoneMedia(),isTablet = Dimensions.isTabletMedia(),
    isMobile = Dimensions.isMobileMedia(),isDesktop = Dimensions.isDesktopMedia();
    const {width} = Dimensions.get("window");
    return {
        width : isSmallPhone ? "95%" : isMobile?"90%" : isTablet ? "50%" : Math.min(WIDTH,(35*width)/100),
        minWidth : isTablet || isDesktop ? WIDTH : undefined,
    };
}

const styles = StyleSheet.create({
    wrapper : {
        flex:1,
        width : '100%',
        height : '100%',
    },
    portalContainer : {
        ...StyleSheet.absoluteFillObject,
        flex:1,
        left:0,
        zIndex : 1000,
        top : 0,
    },
    container : {
        justifyContent : 'center',
        alignItems : 'center',
        width : '100%',
        height : '100%',
        paddingVertical : 15,
        flex : 1,
    },
    content : {
        width : 300,
        paddingVertical : 40,
        paddingHorizontal : 20,
        justifyContent : 'center',
        //alignItems : 'center',
        flex : 1,
    },
    button : {
        //maxWidth : 130,
        margin : 10,
    },
    header : {
        flexDirection:'column',
        width : '100%',
        alignItems : 'center',
    },
    formData : {
        justifyContent : 'flex-start',
        width : '100%',
    },
    buttonWrapper : {
        justifyContent : 'center',
        width : '100%'
    }
});

