import React from "$react";
import {isNonNullString,isObj,defaultNumber,defaultStr,uniqid,extendObj,isFunction} from "$cutils";
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
import ProviderSelector from "./ProviderSelector";
import { ScrollView } from "react-native";
import PropTypes from "prop-types";
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
        setState({step:1,data:getData()});
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
    const {header,
        headerTopContent:HeaderTopContent,
        containerProps : customContainerProps,
        withHeaderAvatar,
        contentProps : customContentProps,
        withScrollView:customWithScrollView,children,initialize,contentTop,data:loginData,canGoToNext,keyboardEvents,onSuccess:onLoginSuccess,mutateData,beforeSubmit:beforeSubmitForm,canSubmit:canSubmitForm,onStepChange,...loginProps} = defaultObj(getProps({
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
        ProviderSelector,
        previousButtonRef,
    }));
    const containerProps = defaultObj(customContainerProps);
    const contentProps = defaultObj(customContentProps);

    React.useEffect(()=>{
        Preloader.closeAll();
        /*** pour initializer les cordonnées du composant login */
        if(typeof initialize =='function'){
            initialize();
        }
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
    const beforeSubmit = typeof beforeSubmitForm =='function'? beforeSubmitForm : x=> true;
    const goToNext = ()=>{
        let step = state.step;
        const data = getData();
        const form = _getForm();
        if(!form){
            notifyUser("Impossible de valider le formulaire car celui-ci semble invalide")
            return;
        }
        if(!form.isValid()){
            notifyUser(form.getErrorText());
            return;
        }
        const args = {...state,data,form,state,step,setState,nextButtonRef,previousButtonRef};
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
            const cS = canSubmit(args);
            if(typeof cS === 'string' && cS){
                return notifyUser(cS);
            }
            if(cS && beforeSubmit(args) !== false){
                ///pour modifier automatiquement la données à mettre à jour
                if(typeof mutateData =='function'){
                    mutateData(data);
                }
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
    const loginFields = {};
    let hasLoginFields = false;
    Object.map(loginProps.fields,(field,i)=>{
        if(isObj(field)){
            if(typeof field.step ==='number' && field.step !== state.step){}
            else {
                loginFields[i] = Object.clone(field);
                hasLoginFields = true;
                if("autoFocusOnStep" in loginFields[i] && typeof loginFields[i].autoFocus !=='boolean'){
                    loginFields[i].autoFocus = !!loginFields[i].autoFocusOnStep;    
                }
            }
        }
    });
    const withScrollView = typeof customWithScrollView =='boolean'? customWithScrollView : true;
    const Wrapper = withPortal ? ScreenWithoutAuthContainer  : withScrollView ? ScrollView: View;
    const mQueryUpdateProps = (a)=>{
        const style = StyleSheet.flatten([updateMediaQueryStyle(),contentProps.style]);
        if(typeof contentProps.updateMediaQueryStyle =='function'){
            return contentProps.updateMediaQueryStyle({style})
        }
        return {style};
    };
    const wrapperProps = withPortal ? {appBarProps,authRequired:false,title:loginTitle,withScrollView} : { style:styles.wrapper};
    const sH = React.isComponent(HeaderTopContent)? <HeaderTopContent
        mediaQueryUpdateNativeProps = {mQueryUpdateProps}
    /> : React.isValidElement(HeaderTopContent)? HeaderTopContent : null;
    return <Wrapper testID = {testID+"_Wrapper" }{...wrapperProps}>
        <DialogProvider ref={dialogProviderRef}/>
        {sH}
        <Surface style={[styles.container,{backgroundColor}]} {...containerProps} testID={testID}>
            <Surface elevation = {0} {...contentProps} mediaQueryUpdateNativeProps = {mQueryUpdateProps} {...contentProps} testID={testID+"_Content"} style={[styles.content,updateMediaQueryStyle(),{backgroundColor},contentProps.style]}>
                <FormData 
                    formName = {formName}
                    testID = {testID+"_FormData"}
                    style = {[styles.formData,{backgroundColor}]}
                    header = {<View style = {[styles.header]}>
                        {withHeaderAvatar !== false && <Avatar testID={testID+"_Avatar"} size={50} secondary icon = 'lock'/> || null}
                        {
                            React.isValidElement(header)? header : 
                            <Label testID={testID+"_HeaderText"} bool style={{color:theme.colors.primaryOnSurface,fontSize:18,paddingTop:10}}>Connectez vous SVP</Label>
                        }
                    </View>}
                    responsive  = {false}
                    {...loginProps}
                    fields = {loginFields}
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
                    <>
                        {React.isValidElement(contentTop)? contentTop : null}
                        {hasLoginFields?<View testID={testID+"_ButtonsContainer"} style={[styles.buttonWrapper]}>
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
                        </View> : null}
                    </>
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

LoginComponent.propTypes = {
    withHeaderAvatar:PropTypes.bool,//si l'on affichera l'avatar de connexion
    headerTopContent : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.node,
        PropTypes.element,
    ]),
    header : PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.element,
    ]),
}
