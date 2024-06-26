import React from "$react"
import { Appbar} from 'react-native-paper';
import {defaultObj,defaultVal,defaultStr} from "$cutils";
import APP from "$capp/instance"
import {isSplitedActions,renderSplitedActions,splitActions,TITLE_FONT_SIZE,getThemeColors} from "./utils";
import {Colors} from "$theme";
import BackAction from "./BackAction";
import {StyleSheet} from "react-native";
import {goBack as navGoBack,useNavigation,useRoute,useScreenOptions } from "$cnavigation";
import PropTypes from "prop-types";
import {Pressable} from "react-native";
import Dimensions from "$cdimensions";
import Content from "./Content";
import Icon from "$ecomponents/Icon";
import {Elevations} from "$ecomponents/Surface";

export * from "./utils";

export const GO_BACK_EVENT = "STACK_NAVIGATOR_GO_BACK";
/*** usage 
 *      @param title {string|Element|null|false} si l'on passe en paramètre la valeur nulle ou false du titre, alors le titre sera ignoré, sinon, le titre 
 *      sera soit l'une des valeur passée en paramètre, soit l'une des valeurs prises depuis les options du Screen composant, soit le nom de l'application
 *      @param backAction {Apppbar.BackAction}, Element réact rendant l'action BackButton, voir @https://callstack.github.io/react-native-paper/appbar-action.html
 *      @param backActionProps {Object} les props à passer au BackAction, voir : https://callstack.github.io/react-native-paper/appbar-action.html
 *      @param contentProps : les props à paser au content de l'appBar
*       @param titleProps {object}, les props du titre
        @param subtitleProps {object}, les props du subtitle
        @param actionProps : les props à passer aux différentes actions de l'appBar,
*       @param menuProps : les props à passer au menu au cas où les actions de l'appBar son segmentés avec certaines qui sont découpées dans un menu more 

 */

const AppBarComponent = React.forwardRef((props,ref)=> {
    let { bindResizeEvent,elevation,isMainDrawer,
      drawerId,handleDrawerStateEvent,drawerMinimized,isStackNavigation,onMount,
      onUnmount,drawerType,options,allowDrawer,back,menuProps,appBarType, 
      drawerRef,beforeGoBack,title,subtitle,titleProps,backAction,backActionProps,
      subtitleProps,testID,
      right,
      Notifications,
      notificationsProps,
      onBackActionPress : customOnBackActionPress,actions,backActionRef,route,
      ...appBarProps} = props;
    testID = defaultStr(testID)+"_RN_AppBarComponent";
    const customOptions = options;
    route = defaultObj(route,useRoute());
    options = defaultObj(options,useScreenOptions());
    const navigation = useNavigation();
    const {onPrimary,backgroundColor} = getThemeColors();
    const anchorStyle = {color:onPrimary};
    const params = defaultObj(route.params);
    appBarProps = Object.assign({},appBarProps);
    notificationsProps = {...Object.assign({},notificationsProps),...Object.assign({},appBarProps.notificationsProps)};
    const notif = React.isComponent(Notifications)? <Notifications {...notificationsProps}/> : React.isValidElement(Notifications)? Notifications : null;
    const getCallAgs = ()=>{
      options = defaultObj(options,useScreenOptions());
      return {navigation,
          canGoBack:typeof navigation.canGoBack=='function'?navigation.canGoBack:x=>false,
          back : options.back,
          route,params,
          props,
          isAppBar : true,
          options:defaultObj(customOptions,useScreenOptions),
          route,routeName:route.name,
          beforeGoBack : defaultFunc(beforeGoBack,x=>true)
      };
    }
    const goBack  = (force)=>{
      return navGoBack({...appBarProps,goBack:undefined,...getCallAgs(),force});
    }
    title = defaultVal(title,params.title,APP.getName());
    backActionProps = Object.assign({},backActionProps);
    backActionProps.testID = defaultStr(backActionProps.testID)+"_AppBarBackAction";
    
    let BackActionComponent  = backAction === false ? null : React.isComponent(backAction)? backAction : back ? BackAction : Icon ;
    backActionProps.color = backActionProps.color && Colors.isValid(backActionProps.color)? backActionProps.color : anchorStyle.color;
    
    let {onPress} = backActionProps;
    const onBackActionPress =  (e,source)=>{
        const args = {...React.getOnPressArgs(e),...getCallAgs(),goBack};
        if(typeof onPress =="function" && onPress(args) === false){
            return;
        } 
        if(typeof customOnBackActionPress =='function' && customOnBackActionPress(args) === false) return;
        goBack();
    }
    backAction =  React.isValidElement(backAction)? backAction : null;
    if(!backAction && BackActionComponent){
      backAction = <BackActionComponent containerColor="transparent" testID="RN_AppBarBackAction" back={options.back} ref={backActionRef} {...backActionProps} onPress={onBackActionPress} />
    } else if(backAction){
        backAction = <Pressable
          {...backActionProps}
          ref = {backActionRef}
          onPress={onBackActionPress}
          children = {backAction}
        /> 
    }
    const [context] = React.useState({});
    actions = typeof actions =='function'? actions(getCallAgs()) : actions;
    const dimensions = Dimensions.get("window");
    const [layout,setLayout] = React.useState({
       width : dimensions.width,
       height : dimensions.height,
    })
    context.forceUpdate = ()=>{
      return setLayout({...Dimensions.get("window")});
    }
    const rightContent = typeof right =='function' ? right ({drawerRef,context,isMobile:Dimensions.isMobileMedia(),isDesktop:Dimensions.isDesktopMedia(),isTablet:Dimensions.isTabletMedia(),isPhone:Dimensions.isPhoneMedia(),dimensions,...dimensions}): right;
    const splitedActions = isSplitedActions(actions)? actions:  splitActions({windowWidth:layout.width,...appBarProps,canGoBack:back || options.back?true:false,isAppBarAction:true,onBackActionPress,goBack,route,navigation,actions});
    const onPageResize = bindResizeEvent !== false ? (e)=>{
          if(!e || !e.nativeEvent || !e.nativeEvent.layout) return null;
          const {width,height} = e.nativeEvent.layout;
          if(Math.abs(layout.width-width)<50) return;
          setLayout({width,height});
    } : undefined;
  
    elevation = typeof elevation === 'number'? elevation : undefined;
    const elevStyle = elevation && Elevations[elevation];
    titleProps = defaultObj(titleProps);
    React.setRef(ref,context);
    return (
      <Appbar.Header elevation={elevation} {...appBarProps}  testID={testID} style={[styles.header,{backgroundColor},elevStyle,appBarProps.style]} onLayout={onPageResize}>
        {backAction}
         <Content {...defaultObj(appBarProps.contentProps)} 
            title={title}
            titleProps = {{...titleProps,style:[styles.title,{color:onPrimary},titleProps.style]}}
            subtitle = {defaultVal(subtitle,params.subtitle,options.subtitle)}
            subtitleProps = {subtitleProps}
            testID={testID+"_Content"}
        />
        {renderSplitedActions(splitedActions,{
          ...defaultObj(menuProps,appBarProps.menuProps),
          anchorProps : {
           style : anchorStyle,
           color : anchorStyle.color,
          }
       })}
        {React.isValidElement(rightContent) && rightContent || React.isValidElement(right) && right || null}
        {notif}
      </Appbar.Header>
    );
});

AppBarComponent.displayName = "AppBarComponent";

export default AppBarComponent;

const styles = StyleSheet.create({
  title : {
    fontSize : TITLE_FONT_SIZE,
    fontWeight : 'bold'
  },
  title2Back : {
    flexDirection : "row",
    justifyContent : "start",
    alignItems : "center",
  },
  actions2right : {
    flexDirection : "row",
    justifyContent : "start",
    alignItems : "center",
  },
  header : {
    paddingHorizontal : 5,
    paddingRight : 10,
    justifyContent : "space-between",
    alignItems : "center",
    flexDirection : "row",
    width : "100%"
  },
})

AppBarComponent.GO_BACK_EVENT = GO_BACK_EVENT;

AppBarComponent.propTypes = {
  ...defaultObj(Appbar.propTypes),
  title : PropTypes.oneOfType([PropTypes.string,PropTypes.element,PropTypes.node,PropTypes.elementType]),
  /**** le composant pour le rendu des notifications de l'appBar*/
  Notifications : PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.node,
    PropTypes.elementType,
  ]),
  subtitle : PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.node,
  ]),
  backActionProps : PropTypes.oneOfType([
    PropTypes.object,
  ]),
}

export {BackAction};

AppBarComponent.BackAction = BackAction;