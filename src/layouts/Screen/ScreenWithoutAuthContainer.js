import React from '$react';
import {StyleSheet} from 'react-native';
import PropTypes from "prop-types";
import {defaultObj,defaultStr,defaultNumber,isValidUrl,uniqid} from "$cutils";
import View from "$ecomponents/View";
import { useNavigation} from '$cnavigation';
import Fab from "$elayouts/Fab";
import APP from "$capp";
import AppBar,{createAppBarRef} from "$elayouts/AppBar";
import {Portal as RNPortal} from "react-native-paper";
import theme,{StyleProp} from "$theme";
import StatusBar from "$ecomponents/StatusBar";
import ScrollView from "$ecomponents/ScrollView";
import KeyboardAvoidingView from "$ecomponents/KeyboardAvoidingView";
import {ScreenContext,useScreen} from "$econtext/hooks";
import {isElectron} from "$cplatform";

const getDefaultTitle = (nTitle,returnStr)=>{
  let titleStr = React.getTextContent(nTitle);
  if(!titleStr){
      titleStr = APP.getName();
  } 
  const dbLabel = "";
  if(!titleStr.toLowerCase().contains(dbLabel.toLowerCase())){
      titleStr += " ["+dbLabel+"]";
  }
  if(returnStr) return titleStr;
  return typeof nTitle =='string' ? titleStr : nTitle;
}

export default function MainScreenScreenWithoutAuthContainer(props) {
  let {
    children,
    withScrollView = false,
    withStatusBar = true,
    style,
    contentContainerStyle,
    options,
    backAction,
    appBarProps:cAppbarProps,
    elevation,
    withFab,
    withNotifications,
    appBar,
    authRequired,
    withDrawer,
    allowDrawer,
    title,
    subtitle,
    modal,
    fabProps,
    screenName,
    containerProps,
    testID,
    keyboardAvoidingViewProps,
    backgroundColor,
    notificationsProps,
    ...rest
  } = props;
  
  keyboardAvoidingViewProps = defaultObj(keyboardAvoidingViewProps);
  testID = defaultStr(testID,"RN_MainScreenScreenWithoutAuthContainer")
  containerProps = defaultObj(containerProps);
  backgroundColor = theme.Colors.isValid(backgroundColor)? backgroundColor : theme.colors.background;
  options = defaultObj(options);
  const {right,left,...appBarProps} = defaultObj(cAppbarProps);
  title = defaultVal(title,appBarProps.title);
  subtitle = defaultVal(subtitle,appBarProps.subtitle);
  notificationsProps = {...Object.assign({},notificationsProps),...Object.assign({},appBarProps.notificationsProps)};
  const appBarRef = createAppBarRef();
  const navigation = useNavigation();
  fabProps = defaultObj(fabProps);
  withDrawer = typeof withDrawer =='boolean'? withDrawer : authRequired;
  if(allowDrawer === false){
     withDrawer = false;
  }
  
  
  React.useEffect(() => {
    if(navigation && typeof navigation?.setOptions ==="function"){
      const appName = APP.getName().toUpperCase();
      subtitle = React.getTextContent(subtitle);
      let screenTitle = getDefaultTitle(title,true);
      if(subtitle){
          screenTitle += " | "+subtitle;
      }
      if(!screenTitle.toUpperCase().contains(appName)){
          screenTitle+=" | "+appName;
      }
      if(isElectron() && typeof window?.ELECTRON !== "undefined" && typeof ELECTRON?.getLoadedAppUrl =='function'){
        const loadedUrl = ELECTRON.getLoadedAppUrl();
        if(isValidUrl(loadedUrl) && !screenTitle.includes(loadedUrl)){
            screenTitle = `${screenTitle} [${loadedUrl}]`;
        }
      }
      navigation.setOptions({
        ...options,
        appBarProps:{...options.appBarProps,...appBarProps,notificationsProps,title,subtitle},
        subtitle :subtitle,
        title : screenTitle,
      });
    }
  }, [title,subtitle]);
  const fab = withFab ? <Fab 
        {...fabProps}
        screenName={screenName}
  />  : null;
  const Wrapper = React.useMemo(()=>modal ? PortalCP : React.Fragment,[modal]);
  const WrapperProps = modal? {screenName} : {};
  const portalId = uniqid("screeen-container-"+screenName);
  const screenValues = useScreen();
  return <Wrapper {...WrapperProps} key={screenName}>
    <ScreenContext.Provider value={screenValues}>
      <View  testID={testID+"_ScreenContentContainer"} id={portalId} {...containerProps} style={[styles.container,{backgroundColor},modal && styles.modal,containerProps.style]} >
        <KeyboardAvoidingView testID={testID} {...keyboardAvoidingViewProps} style={[styles.keyboardAvoidingView,keyboardAvoidingViewProps.style]}>
            {withStatusBar !== false ? <StatusBar/> : null}
            {appBar === false ? null : React.isValidElement(appBar)? AppBar :  <AppBar 
                testID={testID+'_AppBar'} 
                {...appBarProps} 
                left = {left}
                backAction = {defaultVal(appBarProps.backAction,backAction)} 
                elevation={defaultNumber(appBarProps.elevation,elevation)} 
                notificationsProps = {notificationsProps}
                withDrawer={withDrawer} options={options} 
                ref={appBarRef} title={title} 
                subtitle={subtitle}
                withNotifications = {withNotifications}
                right = {right}
            />}
            {withScrollView !== false ? (
              <ScrollView
                testID = {testID+'_ScreenContentScrollView'}
                {...rest}
                contentContainerStyle={[contentContainerStyle,styles.contentContainer]}
                style={[style]}
              >
                {children}
                {fab}
              </ScrollView>
            ) : (
              <View  testID={testID+'_ScreenContent'} {...rest} style={[styles.container,contentContainerStyle, style]}>
                {children}
                {fab}
              </View>
            )}
          </KeyboardAvoidingView>
      </View>
    </ScreenContext.Provider>
  </Wrapper>
}

const PortalCP = ({children,screenName})=>{
  return <RNPortal key={screenName}>
    {children}
  </RNPortal>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer : {
    
  },
  keyboardAvoidingView : {
    flex : 1,
    backgroundColor : "transparent",
  },
  animated : null,//{ width: 300, height: 300 },
  wrapper : {
    flex : 1,
    /*flex : 1,
    flexGrow : 1,
    alignItems:'center'*/
  },
  modal : {
    ...StyleSheet.absoluteFillObject,
    top : 0,
    left:0,
    flex:1,
    width : '100%',
    height : '100%'
  }
});

MainScreenScreenWithoutAuthContainer.propTypes = {
  children: PropTypes.any,
  withScrollView : PropTypes.bool,
  style:StyleProp,
  appBarProps : PropTypes.object,
  elevation : PropTypes.number,
  //appBar : PropTypes.bool,
  contentContainerStyle : StyleProp,
  withFab : PropTypes.bool,
  withDrawer : PropTypes.bool,//si l'on doit afficher un drawer dans le contenu
  //fabProps : PropTypes.object,
}