import React from "$react"
import { Appbar} from 'react-native-paper';
import {defaultObj,defaultVal,defaultStr} from "$utils";
import APP from "$capp/instance"
import {isSplitedActions,renderSplitedActions,splitActions,TITLE_FONT_SIZE} from "./utils";
import theme,{Colors,flattenStyle} from "$theme";
import {StyleSheet} from "react-native";
import {goBack as navGoBack,useNavigation,useRoute,useScreenOptions } from "$cnavigation";
import PropTypes from "prop-types";
import { Dimensions,View,TouchableWithoutFeedback} from "react-native";
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
const isNullOrE = x => x === null || x === false;

const AppBarComponent = React.forwardRef((props,ref)=> {
    let { bindResizeEvent,elevation,isMainDrawer,
      drawerId,handleDrawerStateEvent,drawerMinimized,isStackNavigation,onMount,
      onUnmount,drawerType,options,allowDrawer,back,menuProps,appBarType, 
      drawerRef,beforeGoBack,title,subtitle,titleProps,backAction,backActionProps,
      subtitleProps,testID,
      right,
      onBackActionPress : customOnBackActionPress,actions,backActionRef,route,
      ...appBarProps} = props;
    const customOptions = options;
    route = defaultObj(route,useRoute());
    options = defaultObj(options,useScreenOptions());
    const navigation = useNavigation();
    const isDark = theme.isDark();
    const primaryText = isDark? theme.colors.surfaceText : theme.colors.primaryText,
    backgroundColor = isDark? theme.colors.surface : theme.colors.primary;
    const anchorStyle = {color:primaryText};
    const params = defaultObj(route.params);
    appBarProps = Object.assign({},appBarProps);
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
    
    let BackActionComponent  = backAction === false ? null : React.isComponent(backAction)? backAction : back ? Appbar.BackAction : Icon ;
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
      backAction = <BackActionComponent back={options.back} ref={backActionRef} {...backActionProps} onPress={onBackActionPress} />
    } else if(backAction){
        backAction = <TouchableWithoutFeedback
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
    const splitedActions = isSplitedActions(actions)? actions:  splitActions({...appBarProps,windowWidth:layout.width,canGoBack:back || options.back?true:false,isAppBarAction:true,onBackActionPress,goBack,route,navigation,actions});
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
    testID = defaultStr(testID,"RN_AppBarComponent")
    return (
      <Appbar.Header elevation={elevation} {...appBarProps}  testID={testID} style={[styles.header,{backgroundColor},elevStyle,appBarProps.style]} onLayout={onPageResize}>
        {backAction}
        <Content {...defaultObj(appBarProps.contentProps)} 
            title={title}
            titleProps = {{...titleProps,style:[styles.title,{color:primaryText},titleProps.style]}}
            subtitle = {defaultVal(subtitle,params.subtitle,options.subtitle)}
            subtitleProps = {subtitleProps}
        />
        {renderSplitedActions(splitedActions,{
           ...defaultObj(menuProps,appBarProps.menuProps),
           anchorProps : {
            style : anchorStyle,
            color : anchorStyle.color,
           }
        })}
        {React.isValidElement(rightContent) && rightContent || right}
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
  header : {
    paddingHorizontal : 5,
    paddingRight : 10,
  },
})

AppBarComponent.GO_BACK_EVENT = GO_BACK_EVENT;

AppBarComponent.propTypes = {
  ...defaultObj(Appbar.propTypes),
  title : PropTypes.string,
  subtitle : PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.node,
  ]),
  backActionProps : PropTypes.oneOfType([
    PropTypes.object,
  ]),
}