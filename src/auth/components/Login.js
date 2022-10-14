import React from "$react";
import {isNonNullString,defaultNumber,defaultStr,uniqid,defaultFunc,isValidEmail,isFunction} from "$utils";
import {navigate} from "$enavigation/utils";
import FormData from "$ecomponents/Form/FormData/FormData";
import {getForm} from "$ecomponents/Form/utils";
import Button from "$ecomponents/Button";
import notify from "$notify";
import {StyleSheet} from "react-native";
import { useAuth } from "$cauth/AuthProvider";
import Preloader from "$preloader";
import Dimensions from "$cplatform/dimensions";
import theme from "$theme";
import Label from "$ecomponents/Label";
import View from "$ecomponents/View";
import Avatar from "$ecomponents/Avatar";
import Surface from "$ecomponents/Surface";
import {Provider as DialogProvider} from "$ecomponents/Dialog";
import Screen from "$escreen";
import {getTitle} from "$escreens/Auth/utils";
import {isWeb} from "$cplatform";

const WIDTH = 400;

const updateMediaQueryStyle = ()=>{
    const isSmallPhone = Dimensions.isSmallPhoneMedia(),isTablet = Dimensions.isTabletMedia(),
    isMobile = Dimensions.isMobileMedia(),isDesktop = Dimensions.isDesktopMedia();
    const {width} = Dimensions.get("window");
    return {
        width : isSmallPhone ? "95%" : isMobile?"90%" : isTablet ? "50%" : Math.min(WIDTH,(35*width)/100),
        minWidth : isTablet || isDesktop ? WIDTH : undefined,
    };
}

export default function LoginComponent(props){
    let {formName,step,appBarProps,title,onSuccess,company,onCancel,withPortal,testID,withAppBar} = props;
    const loginTitle = getTitle();
    testID = defaultStr(testID,"RN_Auth.LoginComponent");
    const formNameRef = React.useRef(uniqid(defaultStr(formName,"login-formname")));
    const passwordRef = React.useRef("");
    const auth = useAuth();
    const notifyUser = (message)=> notify.error({message,position:'top'})
    formName = formNameRef.current;
    const companyRef = React.useRef(defaultStr(company,"bijou"));
    const [state,setState] = React.useState({
        step : defaultNumber(step,1),
        username : undefined,
        company,
    });
    const getData = ()=>{
        const form = getForm(formName);
        if(form && form.getData){
            return form.getData();
        }
        return {};
    }
    const goToFirstStep = ()=>{
        const data = getData();
        setState({...state,step:1,password:defaultStr(data.password)});
    }
    const focusField = (fieldName)=>{
        const form = getForm(formName);
        if(form){
            const field = form.getField(fieldName);
            if(field){
                field.focus();
            }
        }
    }
    const goToNext = ()=>{
        let step = state.step;
        let data = getData();
        data.username = defaultStr(data.username, state.username);
        if(!isNonNullString(data.username)){
            notifyUser("Merci de renseigner un nom d'utilisateur valide");
            return;
        }
        if(step >= 2){
            if(!isNonNullString(data.password)){
                notifyUser("Merci de renseigner un mot de pass valide");
                return;
            }
            data = defaultObj(data);
            data.username = defaultStr(data.username).trim();
            Preloader.open("vérification ...");
            return auth.signIn(data).then((a)=>{
                if(isFunction(onSuccess)){
                    onSuccess(true);
                } else {
                    navigate("Home");
                } 
            }).finally(()=>{
                Preloader.close();
            })
        } else {
            setState({...state,step:step+1,...data})
        }
    }
    React.useEffect(()=>{
        Preloader.closeAll();
    },[]);
    React.useEffect(()=>{
        focusField(state.step === 2 ? "password" : "username");
    },[state.step]);
    const nextButtonRef = React.useRef(null);
    const dialogProviderRef = React.useRef(null);
    const backgroundColor = theme.colors.surface;
    const Wrapper = withPortal ? Screen  : View;
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
    const wrapperProps = withPortal ? {appBarProps,authRequired:false,title:loginTitle} : { style:styles.wrapper};
    return <Wrapper testID = {testID+"_Wrapper" }{...wrapperProps}>
        <DialogProvider ref={dialogProviderRef}/>
        <Surface style={[styles.container,{backgroundColor}]} testID={testID}>
            <Label>La vie de l'homme</Label>
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
                    </View>}
                    responsive  = {false}
                    formProps = {{
                        keyboardEvents : {
                            enter : ({formInstance})=>{
                                goToNext();
                            }
                        }
                    }}
                    data = {props.data}
                    fields = {{
                        company : {
                            text : 'Société',
                            type : 'select',
                            items : [{code:'bijou',label:'Bijou'}],
                            required : true,
                            defaultValue : companyRef.current,
                            onChange : ({value})=>{
                                companyRef.current = value;
                            },
                            inputProps : {enableCopy:false},
                            required : true,
                        },
                        username : {
                            text : 'Nom de l\'utilisateur',
                            visible : state.step == 1,
                            affix : false,
                            required : true,
                            defaultValue : state.username,
                            onValidatorValid : (args)=>{
                                if(nextButtonRef.current && nextButtonRef.current.enable){
                                    nextButtonRef.current.enable();
                                }
                            },
                            onNoValidate : (a)=>{
                                if(nextButtonRef.current && nextButtonRef.current.disable){
                                    nextButtonRef.current.disable();
                                }
                            },
                        },
                        password : {
                            type : 'password',
                            defaultValue : passwordRef.current,
                            onChange : ({value})=>{
                                passwordRef.current = value;
                            },
                            readOnly : false,
                            editable : true,
                            required : true,
                            visible : state.step >= 2,
                            text : 'Mot de pass',
                        }
                    }}
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
                            disabled = {!isNonNullString(state.username)}
                        >
                            {state.step == 1? 'Suivant' : 'Connexion' }
                        </Button>
                        {state.step>=2 ? <Button 
                            onPress = {goToFirstStep}
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
            </Surface>
        </Surface>
    </Wrapper>;
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