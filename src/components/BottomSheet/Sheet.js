///@see : https://github.com/nysamnang/react-native-raw-bottom-sheet
import React from "$react";
import PropTypes from "prop-types";
import theme,{Colors} from "$theme";
import Label from "$ecomponents/Label";
import { renderActions } from "$ecomponents/Dialog";
import {isObjOrArray,defaultVal,defaultObj} from "$cutils";
import {renderSplitedActions} from "$ecomponents/AppBar/utils";
import {isWeb,isNativeMobile} from "$cplatform";
import Divider from "$ecomponents/Divider";
import {isMobileOrTabletMedia} from "$cplatform/dimensions";
import APP from "$capp/instance";
import KeyboardAvoidingView from "$ecomponents/KeyboardAvoidingView";
import {Elevations} from "$ecomponents/Surface";
import {defaultStr} from "$cutils";
import View from "$ecomponents/View";
import {Easing} from "react-native";
import Portal from "$ecomponents/Portal";
import { ScrollView } from "react-native";

import {
  BackHandler,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  Button,
  Platform
} from "react-native";

export const defaultHeight = 300;

const useNativeDriver = false;

const BottomSheetComponent = React.forwardRef((props,ref)=> {
    const {
        animationType,
        animationDuration,
        animationPosition,
        closeOnDragDown,
        //dragFromTopOnly,
        closeOnPressMask,
        closeOnPressBack,
        children,
        height:customHeight,
        visible : customVisible,
        minClosingHeight,
        openDuration,
        actionMutator,
        closeDuration, 
        childrenContainerProps:customChildrenContainerProps,
        onOpen,
        onClose,
        title,
        testID:customTestID,
        actions,
        animateOnClose,
        dismissable = true,
        onDismiss,
        modalProps,
        titleProps : _titleProps,
        withScrollView,
        bindResizeEvent,
        scrollViewProps : _scrollViewProps,
        actionTitle,
        elevation:customElevation,
        containerProps : customContainerProps,
        backdropProps : customBackdropProps,
        ...rest
    } = props;
    const {height:winHeight} = Dimensions.get("window");
    let height = typeof customHeight == 'number' && customHeight ? customHeight : 0;
    if(height){
        height = Math.max(height,defaultHeight);
    } else {
        height = Math.max(winHeight/3,defaultHeight);
    }
    const [state,setState] = React.useState({
        animatedHeight: new Animated.Value(0),
        pan: new Animated.ValueXY(),
        visible : typeof customVisible === 'boolean'?customVisible : false,
    });
    const isMounted = React.useIsMounted();
    const {pan,animatedHeight,visible} = state;
    const prevVisible = React.usePrevious(visible);
    const forceCloseModal = ()=>{
        setState({
            ...state,
            visible:false,
            animatedHeight: new Animated.Value(0)
        });
    }
    
    const open = ()=>{
        if(!isMounted() || visible)return;
        setState({...state,visible:true});
    };
    const getAnimValue = ()=>{
        return animatedHeight?.__getValue();
    }
    const subscription = React.useRef(null);
    const handleBack = React.useCallback((e)=>{
      if (dismissable) {
        closeModal(true);
      }
      return true;
    },[dismissable])
    const removeListeners = ()=>{
      if (subscription.current?.remove) {
        subscription.current.remove();
      } else {
        BackHandler.removeEventListener('hardwareBackPress', handleBack);
      }
    }
    const addListener = ()=>{
      removeListeners();
      subscription.current = React.addEventListener(
        BackHandler,
        'hardwareBackPress',
        handleBack
      );
    }
    const closeModal = ()=>{
        removeListeners();
        if(!isMounted()) return;
        const value = getAnimValue();
        if(animateOnClose === false || typeof value =='number' && value <= minClosingHeight){
            return forceCloseModal();
        }
        return Animated.timing(animatedHeight, {
            useNativeDriver,
            toValue: minClosingHeight,
            easing : Easing.linear,
            duration: closeDuration
        }).start(()=>{
            pan.setValue({ x: 0, y: 0 });
            forceCloseModal();
        });
    }
    const [panResponder] = React.useState(PanResponder.create({
        onStartShouldSetPanResponder: () => closeOnDragDown,
        onPanResponderMove: (e, gestureState) => {
            if (gestureState.dy > 0) {
                Animated.event([null, { dy: pan.y }], { useNativeDriver})(e, gestureState);
            }
        },
        onPanResponderRelease: (e, gestureState) => {
            if (height/3 - gestureState.dy < 0) {
                closeModal();
            } else {
                Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver}).start();
            }
        }
    }))
    
    React.useEffect(()=>{
        if(typeof customVisible !=='boolean' || customVisible === visible) return;
        if(customVisible){
            setState({...state,visible:true});
        } else {
            closeModal();
        }
    },[props])
    React.useEffect(()=>{
        if(!visible){
            removeListeners();
        }
        if(!isMounted() || prevVisible == visible) return;
        if(visible){
            addListener();
            pan.setValue({ x: 0, y: 0 });
            Animated.timing(animatedHeight, {
                useNativeDriver,
                toValue: height,
                duration: openDuration,
                easing : Easing.linear,
            }).start(()=>{
                if (typeof onOpen === "function") onOpen(props)
            });
        } else {
            if (typeof onClose === "function") onClose(props);
            else if(onDismiss){
                onDismiss(props);
            }
        }
    },[visible])    

    const panStyle = {
        transform: pan.getTranslateTransform()
    };
    const slideUp = animatedHeight.interpolate({ 
        inputRange: [0, 1], 
        outputRange: [0, height],
    });
    const actionProps = Object.assign({},rest.actionProps);
    const backdropProps = defaultObj(backdropProps);
    //actionProps.size = actionProps.size || 25;
    actionProps.style = [{marginVertical:0,paddingVertical:0},actionProps.style]
    const aStyle = {color:theme.colors.primaryOnSurface};
    actionProps.style = [actionProps.style,aStyle]
    actionProps.color = Colors.isValid(actionProps.color)? actionProps.color : theme.colors.primaryOnSurface;
    const splitedActions = !visible ? null : isObjOrArray(actions)? renderActions({...rest,actionProps,actionMutator:(aProps)=>{
        const {action,key} = aProps;
        let {onPress,...aRest} = action;
        aRest = defaultObj(aRest);
        /*** les actions du bottom sheet prennent en paramètre de la fonction close, les options closeBottomSheet et openBottomSheet permettant de fermer et ouvrir le BottomSheet*/
        aRest.onPress = (opts)=>{
            if(onPress){
                onPress({...defaultObj(opts),closeBottomSheet:closeModal,openBottomSheet:open})
            }
        }
        aRest.key = key;
        if(typeof actionMutator ==='function') return actionMutator({...aProps,action:aRest,key});
        return aRest;
    },actions,fullScreen : isMobileOrTabletMedia(),isAppBarActionStyle:false}) : undefined;
    const rActions = splitedActions ? renderSplitedActions(splitedActions,{
        anchorProps : aStyle,
        title:defaultVal(actionTitle,'Actions'),
        withBottomSheet : true,
        BottomSheetComponent
    }) : null;
    const titleProps = defaultObj(_titleProps);
    const scrollViewProps = defaultObj(_scrollViewProps);
    scrollViewProps.contentContainerStyle = [styles.scrollViewContainer,scrollViewProps.contentContainerStyle]
    const childrenContainerProps = defaultObj(customChildrenContainerProps);
    
    
    React.setRef(ref,{close:closeModal,open})
    React.useEffect(()=>{
        if(bindResizeEvent){
            APP.on(APP.EVENTS.RESIZE_PAGE,closeModal);
        }
        return ()=>{
            removeListeners();
            APP.off(APP.EVENTS.RESIZE_PAGE,closeModal);
            React.setRef(ref,null);
        }
    },[]);
    const dragFromTopOnly = typeof dragFromTopOnly ==='boolean' ? dragFromTopOnly : withScrollView !== false ? true : !isWeb();
    const testID = defaultStr(customTestID,"RN_BottomSheetComponent");
    const containerProps = defaultObj(customContainerProps);
    const elevation = typeof customElevation =='number'? Math.ceil(customElevation) : 10;
    const mProps = defaultObj(modalProps);
    const bStyle = {backgroundColor:theme.colors.backdrop};
    const borderColor = theme.colors.divider,borderWidth = 1;
    return !visible? null :  (
        <Portal>
            <View
                testID = {testID+"_Modal"}
                {...mProps}
                style = {[styles.modal,bStyle,mProps.style]}
            >
                <TouchableOpacity
                    testID={testID+"_Backdrop"}
                    {...backdropProps}
                    style={[styles.mask,backdropProps.style]}
                    activeOpacity={1}
                    onPress={() => (closeOnPressMask && dismissable !== false ? closeModal() : null)}
                />
                    <Animated.View
                        {...(!dragFromTopOnly && panResponder.panHandlers)}
                        testID = {testID+"_Container"} {...containerProps} 
                        style={[styles.container,containerProps.style,{height:animatedHeight},{borderTopWidth:borderWidth,borderTopColor:borderColor,backgroundColor:theme.colors.surface},Elevations[elevation],panStyle,slideUp]}
                    >
                        {closeOnDragDown && (
                            <View
                                {...(dragFromTopOnly && panResponder.panHandlers)}
                                style={[styles.draggableContainer,isWeb()?{cursor:'ns-resize'}:null]}
                                testID = {testID+"_DraggableIconContainer"}
                            >
                            <View testID = {testID+"_DraggableIcon"} style={[styles.draggableIcon]} />
                            </View>
                        )}
                        <View testID = {testID+"_ContentContainer"} style={[styles.contentContainer]}>
                            {title || rActions ? <>
                                <View testID = {testID+"_titleContainer"} style={[styles.titleContainer]}>
                                    {title ? <View testID = {testID+"_TitleContentContainer"} style={[styles.titleWrapper]}>
                                            <Label testID = {testID+"_Title"} {...titleProps} style={[styles.title,titleProps.style]} primary bold>{title}</Label>    
                                    </View> : null}
                                    {rActions? <View testID = {testID+"_Actions"}style={styles.actionsContainer}>
                                            {rActions}
                                    </View> : null}
                                </View>
                                <Divider testID = {testID+"_Divider"} style={styles.divider}/>
                            </>  : null}
                            {withScrollView !== false ?
                                <ScrollView testID = {testID+"_ScrollViewContent"}  contentProps = {{style:styles.scrollViewContent}} {...scrollViewProps} style={[styles.scrollView,scrollViewProps.style]} alwaysBounceVertical={false}
                                    contentContainerStyle={[{ flexGrow: 1,margin:0,paddingBottom:30},scrollViewProps.contentContainerStyle]}
                                >
                                    <KeyboardAvoidingView testID={testID+"_KeyboardAvoidingView"}>{children}</KeyboardAvoidingView>
                                </ScrollView>
                            : <View testID = {testID+"_Children"} {...childrenContainerProps} style={[styles.childrenNotScroll,childrenContainerProps.style]}>
                                <KeyboardAvoidingView testID={testID+"_KeyboardAvoidingView"}>{children}</KeyboardAvoidingView>  
                            </View>}
                        </View>
                    </Animated.View>
            </View>
        </Portal>
    );
});

BottomSheetComponent.propTypes = {
  animationType: PropTypes.oneOf(["slide", "fade"]),
  height: PropTypes.number,
  actionTitle : PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string
  ]),
  minClosingHeight: PropTypes.number,
  openDuration: PropTypes.number,
  actionMutator : PropTypes.func, ///Les mutateurs d'action de la bare d'outil appBar
  closeDuration: PropTypes.number,
  closeOnDragDown: PropTypes.bool,
  closeOnPressMask: PropTypes.bool,
  dragFromTopOnly: PropTypes.bool,
  closeOnPressBack: PropTypes.bool,
  keyboardAvoidingViewEnabled: PropTypes.bool,
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
  scrollViewProps : PropTypes.object,
  children: PropTypes.node,
  /***** les props du container du children du Sheet lorsque la props withScrollView est à false */
  childrenContainerProps : PropTypes.object,
};

BottomSheetComponent.defaultProps = {
  withScrollView : PropTypes.bool,
  bindResizeEvent : PropTypes.bool,
  animationType: isNativeMobile ? "slide" : "fade",//Background animation ("none", "fade", "slide")
  height:undefined,//Height of Bottom Sheet
  minClosingHeight: 0,//Minimum height of Bottom Sheet before close
  openDuration: 300,//Open Bottom Sheet animation duration
  closeDuration: 300,
  closeOnDragDown: true,//Use gesture drag down to close Bottom Sheet
  dragFromTopOnly: false, //Drag only the top area of the draggableIcon to close Bottom Sheet instead of the whole content
  closeOnPressMask: true, //Press the area outside to close Bottom Sheet
  closeOnPressBack: true, //Press back android to close Bottom Sheet (Android only)
  keyboardAvoidingViewEnabled: Platform.OS === "ios",//Enable KeyboardAvoidingView
  onClose: null, //Callback function when Bottom Sheet has closed
  onOpen: null, //Callback function when Bottom Sheet has opened
  children: <View />
};

export default BottomSheetComponent;

const styles = StyleSheet.create({
    modal : {
     ...StyleSheet.absoluteFillObject,
    },
    backdrop: {
        flex: 1,
    },
    titleContainer : {
        flexDirection : 'row',
        width : '100%',
        justifyContent : 'space-between',
        alignItems : 'center'
    },
    titleWrapper : {

    },
    scrollView : {
        paddingBottom : 30,
        margin : 0,
        flex : 1,
    },
    scrollViewContent : {
        margin : 0,
    },
    contentContainer : {
        flex : 1,
        height : '100%'
    },
    wrapper: {
      flex: 1,
      backgroundColor : 'transparent',
    },
    mask: {
      flex: 1,
      backgroundColor: "transparent",
      height:'100%',
    },
    container: {
      borderTopRightRadius : 20,
      borderTopLeftRadius : 20,
      width: "100%",
      overflow: "hidden"
    },
    draggableContainer: {
      width: "100%",
      alignItems: "center",
      backgroundColor: "transparent"
    },
    draggableIcon: {
      width: 35,
      height: 5,
      borderRadius: 5,
      margin: 10,
      backgroundColor: "#ccc"
    },
    actionsContainer : {
        alignSelf : 'flex-end',
        justifyContent : 'flex-end',
        alignItems : 'center',
        flexDirection : 'row',
    },
    actions : {
        flexDirection:'row',
        justifyContent : 'flex-start',
        alignItems : 'center'
    },
    title : {
        fontSize : 16,
        marginHorizontal : 20,
    },
    divider : {
        margin : 0,
        marginTop : 10,
        width : '100%'
    },
    childrenNotScroll : {
        flex : 1,
    }
  });

  BottomSheetComponent.displayName = "BottomSheetComponent";