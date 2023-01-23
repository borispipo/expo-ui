
import {defaultStr,isObj} from "$utils";
import {Dialog} from "react-native-paper";
import {isNonNullString,defaultVal,defaultNumber,defaultObj,defaultBool } from "$utils";
import {StyleSheet,ScrollView} from "react-native";
//import ScrollView  from "$ecomponents/ScrollView";
import Modal from "$ecomponents/Modal";
import PropTypes from "prop-types";
import React from "$react";
import theme,{Colors} from "$theme";
import AppBarDialog from "./AppBarDialog";
import DialogActions from "./DialogActions";
import DialogTitle from './DialogTitle';
import {MAX_WIDTH,SCREEN_INDENT,MIN_HEIGHT} from "./utils";
import {isMobileOrTabletMedia,isMobileMedia} from "$cplatform/dimensions"; 
import Platform,{isMobileNative} from "$cplatform";
import Portal from "$ecomponents/Portal";
import Icon,{BACK_ICON} from "$ecomponents/Icon";
import {ACTION_ICON_SIZE} from "$ecomponents/AppBar";
import DialogFooter from "./DialogFooter";
import { Dimensions } from "react-native";
import Surface from "$ecomponents/Surface";

export const FOOTER_HEIGHT = 50;
export const HEADER_HEIGHT = 50;
export const CONTENT_MARGIN_TOP = 24;

export const measureInWindow = (ref)=>{
    if(!ref||!ref.current || !ref.current.measureInWindow) return Promise.resolve({width:0,height:0,top:0,left:0});
    return new Promise((resolve,reject)=>{
        ref.current.measureInWindow((x, y, width, height)=>{
            resolve({left:x,top:y,width,height});
        })
    })
}

const DialogComponent = React.forwardRef((props,ref)=>{
    let {content,id,responsive,dismissable,onBackActionPress,propsMutator,children,
        controlledProps,
        cancelButton,///ça permet de spécifier si on ajoutera dynamiquement un bouton cancel, pour le rendu mobile du composant Dialog
        onCancelButtonPress,no,yes,
        onDismiss:customOnDismiss,backAction,onShow,backActionProps,
        fullScreen:customFullScreen,appBarProps,contentProps,actionsProps,
        title,subtitle,onMount,onUnmount,mediaQueryUpdateNativeProps,
        titleProps,
        visible,
        scrollViewProps,withScrollView,
        footerProps,footer,actionMutator,actions,overlayProps,
        ModalComponent,
        isProvider,
        isAlert,
        onAlertRequestClose,
        isFormData,
        isPreloader,
        borderRadius,
     ...modalProps
    } = props;
     withScrollView = typeof withScrollView =='boolean'? withScrollView : false;
    ModalComponent = React.isComponent(ModalComponent)? ModalComponent : Modal;
    modalProps = Object.assign({},modalProps);
    overlayProps = defaultObj(overlayProps);
    contentProps = defaultObj(contentProps);
    scrollViewProps = defaultObj(scrollViewProps);
    title = defaultVal(modalProps.title,title);
    actionsProps= defaultObj(actionsProps);
    footerProps = Object.assign({},footerProps);
    const [context] = React.useState({});
    content = content || children;
    let fullScreen = typeof customFullScreen =='boolean'? customFullScreen  : undefined;
    let cFulllScreen = undefined;
    const isResponsive = typeof responsive === "boolean" ? responsive : true;
    if(isResponsive){
        cFulllScreen = isMobileOrTabletMedia();
    }
    if(typeof fullScreen !=='boolean'){
        fullScreen = cFulllScreen;
    }
    const isFullScreenDialog = context.isFullScreen = x => isAlert ? false : typeof customFullScreen =='boolean'? customFullScreen : typeof responsive ==='boolean' ? (responsive ? isMobileOrTabletMedia():false) : isMobileOrTabletMedia();
    fullScreen = isAlert ? false : defaultBool(fullScreen,responsive !== false ? isMobileOrTabletMedia() : false);
    const dimensions = Dimensions.get("window");
    if(typeof propsMutator ==='function'){
        modalProps.fullScreen = fullScreen;
        propsMutator(modalProps);
    }
    controlledProps = defaultObj(controlledProps);
    appBarProps = defaultObj(appBarProps);
    subtitle = subtitle !== false ? defaultVal(appBarProps.subtitle,modalProps.subtitle,subtitle) : null;
    backActionProps = Object.assign({},backActionProps);
    backActionProps.color =  Colors.isValid(backActionProps.color)? backActionProps.color : theme.colors.primaryText;
    cancelButton = cancelButton === false ? null : isObj(cancelButton)? {...cancelButton} : {};
    if(isNonNullString(no)){
        no = {label:no};
    }
    if(isObj(no) && (no.label||no.text)){
        cancelButton = cancelButton ? {...no,...cancelButton} : no;
        backActionProps = {...no,...backActionProps};
    }
    context.isVisible = context.isOpen = x => visible ? true : false;
    context.isClosed = x=> !visible ? true : false;
    const isDimissable = defaultBool(dismissable,false);
    const handleBack = (args,force)=>{
        args = {...React.getOnPressArgs(args),isProvider,isFullScreen:isFullScreenDialog(),isPreloader,context,props};
        if(typeof onBackActionPress =='function' && onBackActionPress(args) === false) return true;
        if(typeof backActionProps.onPress =='function' && backActionProps.onPress(args)=== false) return true;
        if(force === false && !isDimissable) return true;
        if(isAlert && typeof onAlertRequestClose =='function'){
            return onAlertRequestClose(args);
        }
        if(typeof customOnDismiss =='function'){
            const r = customOnDismiss(args);
            return typeof r =='boolean'? r : true;
        }
        return true;
    }
    
     if(backAction === false){
        backAction = null;
     } else {
        backAction = <Icon 
            icon = {BACK_ICON}
            size = {ACTION_ICON_SIZE}
            {...backActionProps}
            onPress = {(e)=>{
                handleBack(e,true);
            }}
        />
    }
    const appBarRef = context.appBarRef = React.useRef(null);
    const titleRef = context.titleRef = React.useRef(null);
    const contentRef = context.contentRef = React.useRef(null);
    const footerRef = context.footerRef = React.useRef(null);
    const overlayRef = context.overlayRef = React.useRef(null);
    const footerContentRef = context.footerContentRef = React.useRef(null);
    const scrollViewRef = React.useRef(null);
    const modalRef = context.modalRef = React.useRef(null);
    const getMaxWidth = ()=>{
        const {width} = Dimensions.get("window");
        return Math.min(MAX_WIDTH,80*width/100);
    }
    const getMaxHeight = ()=>{
        const {height} = Dimensions.get("window");
        return Math.max((height>600?(50):70)*height/100,MIN_HEIGHT);
    }
    const modalStyle = React.useMediaQueryUpdateStyle({
        mediaQueryUpdateStyle : (args)=>{
            return null;
        }
    });
   const onModalShown = (a)=>{
      if(onShow){
        onShow(a);
      }
   }
   React.useEffect(()=>{
        return ()=>{
            React.setRef(ref,null);
        }
    },[]);
    React.setRef(ref,context);
    actionsProps = {...modalProps,context,dialogRef:context,...controlledProps}
    const contentContainerProps = Object.assign({},modalProps.contentContainerProps);
    const testID = defaultStr(modalProps.testID,"RN_DialogComponent");
    const maxHeight = getMaxHeight(),maxWidth = getMaxWidth();
    const backgroundColor = theme.surfaceBackgroundColor;
    borderRadius = fullScreen  || !(isMobileNative() || isMobileMedia()) || isPreloader ? 0 : typeof borderRadius =='number'? borderRadius : 5*theme.roundness;
    const fullScreenStyle = fullScreen ? {width:dimensions.width,height:dimensions.height,marginHorizontal:0,paddingHorizontal:0}: {
        maxWidth,
        maxHeight,
        borderRadius,
        paddingLeft : borderRadius,
        paddingRight : borderRadius,
        paddingVertical : borderRadius?10:0,
    };
    const alertContentStyle = isAlert ? {paddingHorizontal:15} : null;
    content = <Surface ref={contentRef} testID = {testID+"_Content11"} {...contentProps} style={[fullScreen? {flex:1}:{maxWidth,maxHeight:maxHeight-Math.min(SCREEN_INDENT*2+50,100)},isPreloader && {paddingHorizontal:10},{backgroundColor},alertContentStyle,contentProps.style]}>
        {content}
    </Surface>
    if(withScrollView){
        content = <ScrollView centerContent 
            contentContainerStyle={{ flexGrow: 0, justifyContent: 'flex-start' }}
        ref={scrollViewRef} testID={testID+"_ScrollViewContent"} {...scrollViewProps}>
            {content}
        </ScrollView>
    }
    return <Portal>
            <ModalComponent
                onDismiss={(e)=>{
                    return handleBack(e,false);
                }}
                {...modalProps} 
                isPreloader = {isPreloader}
                dismissable = {isDimissable}
                onShow = {onModalShown}
                visible={visible} 
                style = {[styles.modal,modalProps.style,modalStyle]}
                ref={modalRef}
                testID = {testID}
                contentContainerProps = {contentContainerProps}
            >
                <Surface 
                    testID = {testID+"_Overlay"}
                    ref={overlayRef}
                    {...overlayProps} 
                    style={[styles.overlay,isAlert && styles.overlayAlert,{backgroundColor},overlayProps.style,fullScreenStyle]}
                >
                    {(!isAlert && (actions || title || subtitle)) ? <AppBarDialog
                        actionsProps = {actionsProps}
                        testID = {testID+"_AppBar"}
                        {...appBarProps}
                        actions = {actions}
                        actionMutator = {actionMutator}
                        ref = {appBarRef}
                        responsive = {isResponsive}
                        isFullScreen = {isFullScreenDialog}
                        fullScreen = {customFullScreen}
                        backAction = {backAction}
                        backActionProps = {{...backActionProps,onPress:(a)=>{
                            handleBack(a,true);
                        }}}
                        title = {title}
                        subtitle = {subtitle}
                        titleProps = {titleProps}
                    />:null}
                    <DialogTitle 
                        testID = {testID+"_Title"}
                        {...titleProps} 
                        ref = {titleRef}
                        title = {title}
                        responsive = {isResponsive}
                        isFullScreen = {isFullScreenDialog}
                        fullScreen = {customFullScreen}
                    />
                    {content}
                    {actions ? <DialogActions
                        testID = {testID+"_Footer"}
                        {...footerProps}
                        ref = {footerRef}
                        isAlert = {isAlert}
                        onAlertRequestClose = {onAlertRequestClose}
                        actionsProps = {actionsProps}
                        responsive = {isResponsive}
                        isFullScreen = {isFullScreenDialog}
                        fullScreen = {customFullScreen}
                        actions = {actions}
                        style = {[{backgroundColor},footerProps.style]}
                        actionMutator = {actionMutator}
                        cancelButton = {isAlert || !cancelButton || isPreloader ? null : {
                            icon : 'cancel',
                            mode : 'contained',
                            error : true,
                            ...cancelButton,
                            text : undefined,
                            label : defaultVal(cancelButton.label,cancelButton.text,"Annuler"),
                            onPress : (a1,a2)=>{
                                if(onCancelButtonPress && onCancelButtonPress(a1,a2) === false) return;
                                else if(cancelButton.onPress && cancelButton.onPress(a1,a2) === false) return;
                                return handleBack(a1,true);
                            }
                        }}
                        menuProps = {defaultObj(appBarProps.menuProps)}
                     /> : null}
                     {(!isAlert && footer) ? <DialogFooter
                        {...footerProps}
                        style = {[{backgroundColor},footerProps.style]}
                        testID = {testID+"_FullPageFooter"}
                        ref = {footerContentRef}
                        responsive = {isResponsive}
                        isFullScreen = {isFullScreenDialog}
                        fullScreen = {customFullScreen}
                        children = {footer}
                     /> : null}
                </Surface>
            </ModalComponent>
        </Portal>
});
export default DialogComponent;

DialogComponent.propTypes= {
    ...Modal.propTypes,
    isAlert : PropTypes.bool,//si c'est le rendu alert, pour le rendu de l'alerte
    ModalComponent : PropTypes.element,
    withScrollView : PropTypes.bool,//si le modal utilisera un scrollView
    contentProps : PropTypes.object,///les props du contenu à rendre à la boîte de dialogue
    modalProps : PropTypes.object,//les props à paser au Modal react-native,
    responsive : PropTypes.bool,//si le contenu est responsive
    actions : PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
    propsMutator : PropTypes.func, ///la fonction permettant de muter les props de la boîte de de modalue en cours d'être rendu
    children : PropTypes.node,
    visible : PropTypes.bool,
    fullScreen : PropTypes.bool,
    onBackActionPress : PropTypes.func,//lorsque l'on clique sur le bouton backAction
    withScrollView : PropTypes.bool,
    title : PropTypes.any,
    subtitle : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool,
        PropTypes.node,
    ]), //le subtitle de l'appBar lorsque le modal est fullScreen
    appBarProps : PropTypes.object,//les props de l'appBar lorsque le modal est fullScreen
    backAction : PropTypes.any,//si le back action sera autorisé
    backActionProps : PropTypes.object, //les props du bouton backAction
    footer : PropTypes.node, ///le contenu du footer lorsque la boîte de dialogue est en plein écran
    footerProps : PropTypes.object, //les props du footer à appliquer aux actions de la bôite de dialogue en mode modal et au footer en mode plein écran
}


export const DialogControlledComponent = React.forwardRef(({visible:dVisible,...props},ref)=>{
    const [visible,setVisible] = React.useState(defaultBool(dVisible,false));
    const {onDismiss,onClose,onVisibilityChanged,...rest} = props;
    React.useEffect(()=>{
        if(typeof dVisible =='boolean' && dVisible !== visible){
            setVisible(dVisible);
        }
    },[dVisible])
    const close = x=> setVisible(false);
    const open = x => setVisible(true);
    const isOpen=x=>visible,isClosed = x=>!visible;
    const ctx = {open,close,closeDialog:close,isOpen,isClosed,isDialogOpen:isOpen,isDialogClosed:isClosed,openDialog:open,setVisible};
    return <DialogComponent ref={(el)=>{
            if(el){
                for(let i in ctx){
                    el[i] = ctx[i];
                }
            }
            React.setRef(ref,el);
        }} 
        controlledProps = {{controlledContext:ctx}} 
        {...rest} 
        visible={visible} 
        onDismiss={(args)=>{
            if(typeof onDismiss ==='function' && onDismiss({...defaultObj(args),visible,open,close,setVisible}) ===false) return;
            setVisible(false);
        }}
    />
})

DialogControlledComponent.propTypes = {
    ...DialogComponent.propTypes,
    dismissable : PropTypes.bool, //si la boîte de modalue peut être fermée en cliquant sur le bouton backAction en environnement android
    onClose : PropTypes.func,
    onVisibilityChanged : PropTypes.func,
}

DialogComponent.Controlled = DialogControlledComponent;


DialogComponent.displayName = "AppDialogComponent"

export const isDialog = Dialog.isDialog = (Component)=> typeof Component ==="function" && Component.displayName == DialogComponent.displayName;

const styles = StyleSheet.create({
    modal : { 
        alignSelf : 'center',
        marginVertical : 0,
        marginHorizontal : 0,
        paddingHorizontal:0,
        paddingVertical : 0,
    },
    overlayAlert : {
        paddingVertical : 5,
    },
    overlay: {
        paddingHorizontal:0,
        paddingVertical : 0,
        marginHorizontal : 0,
        justifyContent: 'flex-start',
        flexGrow : 0,
        marginVertical : 0,
        ...Platform.select({
          /*android: {
            elevation: 2,
          },*/
          default: {
            shadowColor: 'rgba(0, 0, 0, .3)',
            shadowOffset: { width: 0, height: 1 },
            shadowRadius: 4,
          },
        }),
    },
})