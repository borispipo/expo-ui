import React from "$react";
import {isNonNullString,isObj,defaultNumber,defaultStr,uniqid,extendObj,isFunction} from "$cutils";
import {navigate} from "$cnavigation";
import FormData from "$ecomponents/Form/FormData/FormData";
import { Action } from "$ecomponents/Form";
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
import ScreenWithoutAuthContainer from "$escreen/ScreenWithoutAuthContainer";
import {getTitle} from "$escreens/Auth/utils";
import {isWeb} from "$cplatform";
import ProviderSelector from "./ProviderSelector";
import { ScrollView } from "react-native";
import PropTypes from "prop-types";
import useContext from "$econtext/hooks";

const WIDTH = 400;

export default function LoginComponent(props){
    let {formName,step,appBarProps,onSuccess,withPortal,testID} = props;
    const {auth:{loginPropsMutator,Login}} = useContext();
    let loginTitle = getTitle();
    testID = defaultStr(testID,"RN_Auth.LoginComponent");
    formName = React.useRef(uniqid(defaultStr(formName,"login-formname"))).current;
    const nextButtonRef = React.useRef(null);
    const previousButtonRef = React.useRef(null);
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
    },[withPortal]);
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
    const getButtonAction = React.useMemo(()=>{
        return (buttonRef)=>{
            buttonRef = buttonRef || React.createRef();
            return {
                ref : buttonRef,
                isDisabled : x=> typeof buttonRef?.current?.isDisabled ==="function" && buttonRef.current?.isDisabled(),
                enable : x=>{
                    return typeof buttonRef?.current?.enable =="function" && buttonRef.current.enable();
                },
                disable : x=> {
                    return typeof buttonRef?.current?.disable =="function" && buttonRef?.current.disable()
                },
            }
        }
    },[]);
    const nextButton = getButtonAction(nextButtonRef),
    prevButton = getButtonAction(previousButtonRef);
    const setIsLoading = (buttonRef,bool)=>{
        if(typeof buttonRef?.current?.setIsLoading == 'function'){
            return buttonRef.current?.setIsLoading(bool)
        }
    }
    const beforeSubmitRef = React.useRef(null);
    const canSubmitRef = React.useRef(null);
    const onSuccesRef = React.useRef(null);
    const signIn = ()=>{
        const form = _getForm();
        if(!form){
            notifyUser("Impossible de valider le formulaire car celui-ci semble invalide")
            return;
        }
        if(!form.isValid()){
            notifyUser(form.getErrorText());
            return;
        }
        const data = getData();
        const canSubmit = typeof canSubmitRef.current == 'function'? canSubmitRef.current : w=>true;
        const beforeSubmit = typeof beforeSubmitRef.current === 'function' ? beforeSubmitRef.current : ()=> true;
        const args = {...state,data,form,state,setState,nextButtonRef,previousButtonRef};
        const cS = canSubmit(args);
        if(typeof cS === 'string' && cS){
            return notifyUser(cS);
        }
        if(cS !== false && beforeSubmit(args) !== false){
            Preloader.open("vérification ...");
            setIsLoading(nextButtonRef,true);
            return auth.signIn(data).then((result)=>{
                if(typeof onSuccesRef.current =='function' && onSuccesRef.current({data,result})=== false) return;
                if(isFunction(onSuccess)){
                    onSuccess({data,result});
                } else {
                    navigate("Home");
                } 
            }).finally(()=>{
                Preloader.close();
                setIsLoading(nextButtonRef,false);
            })
        }
    }
    const mediaQueryUpdateStyle = ()=>{
        return StyleSheet.flatten([updateMediaQueryStyle()]);
    };
    const withScrollView = typeof customWithScrollView =='boolean'? customWithScrollView : true;
    const Wrapper = withPortal ? ScreenWithoutAuthContainer  : withScrollView ? ScrollView: View;
    if(React.isComponent(Login)) return <Login
        {...props}
        withScreen = {withPortal}
        withScrollView = {withScrollView}
        Wrapper = {Wrapper}
        wrapperProps = {withPortal ? {appBarProps,authRequired:false,title:loginTitle,withScrollView} : {style:[styles.wrapper]}}
        appBarProps = {appBarProps}
        onSuccess = {onSuccess}
        auth = {auth}
        formName = {formName}
        /***
         * permet de connecter un utilisatgeur au backend
         * @param {object} data, la données liée à l'utilisateur à connecter
         * @param {object} options, les options de connexion
         * @return {object}, la données résultat à la fonction de connexion de l'utilisateur
         */
        signIn = {(data,options,...rest)=>{
            options = defaultObj(options);
            if(!isObj(data) || !Object.size(data,true)){
                data = getData();
            }
            Preloader.open("Connexion ...");
            return auth.signIn(data,...rest).then((result)=>{
                if(typeof options.onSuccess === "function"){
                    if(options.onSuccess({data,result}) === false) return;
                } else if(typeof options.callback === "function" && options.callback({data,result}) === false){
                    return;
                } 
                if(isFunction(onSuccess) && onSuccess({data,result}) === false){
                } else {
                    navigate("Home");
                } 
                return result;
            }).finally(()=>{
                Preloader.close();
            });
        }}
        mediaQueryUpdateStyle={mediaQueryUpdateStyle}
    />
    const callArgs = {
        ...state,
        getButtonAction,
        data : getData(),
        mediaQueryUpdateStyle,
        signIn,
        setState,
        setIsLoading,
        state,
        nextButton,
        prevButton,
        previousButton:prevButton,
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
    };
    const {header : Header,
        headerTopContent:HeaderTopContent,
        containerProps : customContainerProps,
        contentProps : customContentProps,
        formProps,
        wrapperProps : cWrapperProps,
        title : customTitle,
        withScrollView:customWithScrollView,children,initialize,renderNextButton,renderPreviousButton,data:loginData,canGoToNext,keyboardEvents,onSuccess:onLoginSuccess,beforeSubmit:beforeSubmitForm,canSubmit:canSubmitForm,onStepChange,...loginProps} = loginPropsMutator(callArgs);
    if(isNonNullString(customTitle)){
        loginTitle = customTitle;
    }
    const containerProps = defaultObj(customContainerProps);
    const contentProps = defaultObj(customContentProps);
    /****la fonction à utiliser pour vérifier si l'on peut envoyer les données pour connextion
     * par défaut, on envoie les données lorssqu'on est à l'étappe 2
     * **/
    canSubmitRef.current = typeof canSubmitForm =='function'? canSubmitForm : ({step})=>step >= 2;
    beforeSubmitRef.current  = typeof beforeSubmitForm =='function'? beforeSubmitForm : x=> true;
    onSuccesRef.current = onLoginSuccess;
    
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
            signIn();
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
    
    
    const wProps = defaultObj(typeof cWrapperProps =="function"? cWrapperProps({...callArgs,withPortal,withScreen:withPortal,withScrollView,state,formName}) : cWrapperProps);
    const wrapperProps = withPortal ? {appBarProps,authRequired:false,title:loginTitle,withScrollView,...wProps} : { ...wProps,style:[styles.wrapper,wProps.style]};
    const sH = React.isComponent(HeaderTopContent)? <HeaderTopContent mediaQueryUpdateStyle = {mediaQueryUpdateStyle} /> : React.isValidElement(HeaderTopContent)? HeaderTopContent : null;
    const header = React.isComponent(Header) ? <Header mediaQueryUpdateStyle = {mediaQueryUpdateStyle}/> : React.isValidElement(Header)? Header : null;
    return <Wrapper testID = {testID+"_Wrapper" }{...wrapperProps}>
        {sH}
        <Surface {...containerProps} {...defaultObj(loginProps?.containerProps)} style={[styles.container,{backgroundColor},containerProps.style,loginProps?.containerProps?.style]}  testID={testID+"_LoginContainer"}>
            <Surface elevation = {0} {...contentProps} mediaQueryUpdateStyle = {mediaQueryUpdateStyle} {...contentProps} testID={testID+"_LoginContent"} style={[styles.content,{backgroundColor},contentProps.style]}>
                <FormData 
                    formName = {formName}
                    testID = {testID+"_FormData"}
                    style = {[styles.formData,{backgroundColor}]}
                    header = {React.isValidElement(header)? header : <View testID={`${testID}_HeaderContainer`} style = {[styles.header]}>
                        <Avatar testID={testID+"_Avatar"} size={50} secondary icon = 'lock'/>
                        <Label testID={testID+"_HeaderText"} bool style={{color:theme.colors.primaryOnSurface,fontSize:18,paddingTop:10}}>Connectez vous SVP</Label>
                    </View>}
                    responsive  = {false}
                    {...loginProps}
                    fields = {loginFields}
                    formProps = {extendObj(true,{},{
                        keyboardEvents : {
                            enter : ({formInstance})=>{
                                goToNext();
                            },
                        }
                    },formProps)}
                    data = {extendObj(state.data,loginData)}
                >
                    <>
                        {renderNextButton !== false || renderPreviousButton !== false ? <>
                                {hasLoginFields?<View testID={testID+"_ButtonsContainer"} style={[styles.buttonWrapper]}>
                                {renderNextButton !== false ? <Action
                                    ref = {nextButtonRef}
                                    primary
                                    formName={formName}
                                    mode = "contained"
                                    rounded
                                    style = {styles.button}
                                    onPress = {goToNext}
                                    icon = {state.step == 1? 'arrow-right':'login'}
                                    surface
                                    testID = {testID+"_NextButton"}
                                >
                                    {state.step == 1? 'Suivant' : 'Connexion' }
                                </Action> : null}
                                {renderPreviousButton !== false && state.step>=2 ? <Button
                                    onPress = {goToFirstStep}
                                    ref = {previousButtonRef}
                                    mode = "contained"
                                    rounded
                                    raised
                                    style = {styles.button}
                                    secondary
                                    surface
                                    icon = {'arrow-left'}
                                    testID = {testID+"_PrevButton"}
                                >
                                    Précédent
                                </Button> : null}
                            </View> : null}
                        </> : null}
                        {React.isValidElement(children) ? children : null}
                    </>
                </FormData>
                 {React.isValidElement(contentProps.children) ? contentProps.children : null}
            </Surface>
            {React.isValidElement(containerProps.children) ? containerProps.children : null}
        </Surface>
        {React.isValidElement(wrapperProps.children) ? wrapperProps.children : null}
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
    /****
        les props du composant Wrapper, peut être une fonction où un objet
        - s'il s'agit d'une fonction : elle est définie comme suit : 
            ({withScreen<boolean>,withPortal<boolean>,withScrolView<boolean>})=> <object>,
        
    */
    wrapperProps : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.object,
    ]),
    /***
        les props du composant Container, enfant  hiérachique au composant Wrapper
        idem aux props du composant Surface
    */
    containerProps : PropTypes.shape(defaultObj(Surface.propTypes)),
    //les props du composant Surface, parent direct du composant FormData utile pour le rendu du form
    contentProps : PropTypes.shape(defaultObj(Surface.propTypes)),
    //les props du form data, idem à ceux du composant FormData
    formProps : PropTypes.object,
    headerTopContent : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.node,
        PropTypes.element,
    ]),
    header : PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.element,
        PropTypes.func,
    ]),
    onSuccess : PropTypes.func, //la fonctino appelée lorsque l'utilisateur a été connecté, lorsque l'action liée à la fonction signIn de auth s'est terminée correctement
    renderNextButton : PropTypes.bool,//si le bouton next sera rendu
    renderPreviousButton : PropTypes.bool,//si le bouton previous sera rendu
}

