///@see : https://github.com/nysamnang/react-native-raw-bottom-sheet
import React from "$react";
import PropTypes from "prop-types";
import theme,{Colors} from "$theme";
import Label from "$ecomponents/Label";
import { renderActions } from "$ecomponents/Dialog";
import {isObjOrArray,defaultVal,defaultObj} from "$cutils";
import {renderSplitedActions} from "$ecomponents/AppBar/utils";
import {isWeb,isNativeMobile,isTouchDevice} from "$cplatform";
import Divider from "$ecomponents/Divider";
import {isMobileOrTabletMedia} from "$cplatform/dimensions";
import KeyboardAvoidingView from "$ecomponents/KeyboardAvoidingView";
import {Elevations} from "$ecomponents/Surface";
import {defaultStr} from "$cutils";
import View from "$ecomponents/View";
import {Portal} from "react-native-paper";
import { ScrollView } from "react-native";
import BackHandler from "$ecomponents/BackHandler";
import Reanimated, { useSharedValue,withTiming,useAnimatedStyle} from 'react-native-reanimated';
import {
  Pressable,
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
    let {
        animationType,
        animationDuration,
        animationPosition,
        closeOnDragDown,
        dragFromTopOnly,
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
        scrollViewProps : _scrollViewProps,
        actionTitle,
        elevation:customElevation,
        containerProps : customContainerProps,
        backdropProps,
        ...rest
    } = props;
    const {height:winHeight} = Dimensions.get("window");
    let height = typeof customHeight == 'number' && customHeight ? customHeight : 0;
    if(height){
        height = Math.max(height,defaultHeight);
    } else {
        height = Math.max(winHeight/3,defaultHeight);
    }
    const [pan] = React.useState(new Animated.ValueXY());
    const [visible,setVisible] = React.useState(typeof customVisible === 'boolean'?customVisible : false);
    const heightRef = React.useRef(height);
    heightRef.current = height;
    const isMounted = React.useIsMounted();
    const prevVisible = React.usePrevious(visible);
    const animatedHeight = useSharedValue(0);
    const hasCallCallbackRef = React.useState(false);
    const visibleRef = React.useRef(visible);
    visibleRef.current = visible;
    const open = ()=>{
        if(!isMounted() || visible)return;
        setVisible(true);
    };
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
    
    const closeModal = (cb)=>{
        removeListeners();
        if(!isMounted()) return;
        pan.setValue({ x: 0, y: 0 });
        const callback = ()=>{
            if(hasCallCallbackRef.current) return;
            if(visibleRef.current){
                setVisible(false);
            }
            if(typeof cb =='function'){
                cb();
            }
            hasCallCallbackRef.current = true;
        };
        hasCallCallbackRef.current = false;
        if(animatedHeight.value != 0){
            animatedHeight.value = animate(0,{
                duration: closeDuration,
                callback,
            });
            setTimeout(callback,closeDuration+100);
        } else {
            callback();
        }
    }
    const [panResponder] = React.useState(PanResponder.create({
        onStartShouldSetPanResponder: () => closeOnDragDown,
        onPanResponderMove: (e, gestureState) => {
            const diff = gestureState.dy > 0 ? animatedHeight.value - gestureState.dy : Math.min(heightRef.current,animatedHeight.value-gestureState.dy);
            if(diff >0 && diff !== animatedHeight.value){
                animatedHeight.value = animate(diff,{duration:100});
            }
        },
        onPanResponderRelease: (e, gestureState) => { 
            const height = animatedHeight.value;
            if (height/3 - gestureState.dy < 0) {
                closeModal();
            }
        }
    }))
    const animatedStyles = useAnimatedStyle(() => ({
        height : animatedHeight.value,
        transform :[{ translateX: 0 }],
    }));
    React.useEffect(()=>{
        if(typeof customVisible !=='boolean' || customVisible === visible) return;
        if(customVisible){
            if(animatedHeight.value >0){
                animatedHeight.value = animate(0);
            }
            setVisible(true);
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
            animatedHeight.value = animate(height,{
                callback : ()=>{
                    if (typeof onOpen === "function") onOpen(props)  
                },
                duration: openDuration,
            })
        } else {
            closeModal(()=>{
                if (typeof onClose === "function") onClose(props);
                else if(onDismiss){
                    onDismiss(props);
                }
            });
        }
    },[visible])    

    const panStyle = {
        transform: pan.getTranslateTransform()
    };
    const actionProps = Object.assign({},rest.actionProps);
    backdropProps = defaultObj(backdropProps);
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
        return ()=>{
            removeListeners();
            React.setRef(ref,null);
        }
    },[]);
    dragFromTopOnly = typeof dragFromTopOnly ==='boolean' ? dragFromTopOnly : withScrollView !== false ? true : isTouchDevice();
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
                <Pressable
                    testID={testID+"_Backdrop"}
                    {...backdropProps}
                    style={[styles.mask,backdropProps.style]}
                    activeOpacity={1}
                    onPress={() => (closeOnPressMask && dismissable !== false ? closeModal() : null)}
                />
                    <Reanimated.View
                        {...(!dragFromTopOnly && panResponder.panHandlers)}
                        testID = {testID+"_Container"} {...containerProps} 
                        style={[styles.container,containerProps.style,{borderTopWidth:borderWidth,borderTopColor:borderColor,backgroundColor:theme.colors.surface},Elevations[elevation],panStyle,styles.animated,animatedStyles]}
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
                    </Reanimated.View>
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
  
  export const animate = (time,options)=>{
    return withTiming(time,{
        ...Object.assign({},options)
    });
  }