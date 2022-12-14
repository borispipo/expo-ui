import React from '$react';
import {StyleSheet} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PropTypes from "prop-types";
import {defaultObj,defaultStr,defaultNumber,defaultBool} from "$utils";
import ScrollView from '$ecomponents/ScrollView';
import View from "$ecomponents/View";
import { useNavigation} from '$cnavigation';
import Fab from "$elayouts/Fab";
import APP from "$capp";
import AppBar,{createAppBarRef} from "$elayouts/AppBar";
import ErrorBoundary from "$ecomponents/ErrorBoundary";
import Portal from "$ecomponents/Portal";
import theme,{StyleProp} from "$theme";
import StatusBar from "$ecomponents/StatusBar";

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

export default function MainScreenScreenWithOrWithoutAuthContainer(props) {
  let {
    children,
    withScrollView = false,
    withStatusBar = true,
    style,
    contentContainerStyle,
    options,
    backAction,
    appBarProps,
    authProps,
    elevation,
    withFab,
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
    profilAvatarProps,
    profilAvatarContainerProps,
    withProfilAvatarOnAppBar:cWithPorilAvatarOnAppbar,
    renderChildren,
    renderProfilAvatar,
    ...rest
  } = props;
  const insets = useSafeAreaInsets();
  testID = defaultStr(testID,"RN_MainScreenScreenWithOrWithoutAuthContainer")
  containerProps = defaultObj(containerProps);
  profilAvatarContainerProps = defaultObj(profilAvatarContainerProps);
  profilAvatarProps = defaultObj(profilAvatarProps);
  const backgroundColor = theme.colors.background;
  const containerStyle = [
    styles.container,
    {
      backgroundColor,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
  ];
  options = defaultObj(options);
  appBarProps = defaultObj(appBarProps)
  title = defaultVal(title,appBarProps.title);
  subtitle = defaultVal(subtitle,appBarProps.subtitle);
  const appBarRef = createAppBarRef();
  const navigation = useNavigation();
  authProps = Object.assign({},authProps),
  fabProps = defaultObj(fabProps);
  authRequired = defaultBool(authProps.required,authRequired,false);
  withDrawer = typeof withDrawer =='boolean'? withDrawer : authRequired;
  if(allowDrawer === false){
     withDrawer = false;
  }
  if(authRequired === false){
    withFab = false;
  }
  const withProfilAvatarOnAppBar = cWithPorilAvatarOnAppbar !== false && withDrawer && !theme.showProfilAvatarOnDrawer ? true : false;
  React.useEffect(() => {
    if((title||subtitle) && navigation && navigation.setOptions){
      const appName = APP.getName().toUpperCase();
      subtitle = React.getTextContent(subtitle);
      let screenTitle = getDefaultTitle(title,true);
      if(subtitle){
          screenTitle += " | "+subtitle;
      }
      if(!screenTitle.toUpperCase().contains(appName)){
          screenTitle+=" | "+appName;
      }
      navigation.setOptions({
        ...options,
        appBarProps:{...options.appBarProps,...appBarProps,title,subtitle},
        subtitle :subtitle,
        title : screenTitle,
      });
    }
  }, [title,subtitle]);
  const Wrapper =  modal ? Portal : React.Fragment;
  const fab = withFab ? <Fab 
      {...fabProps}
      screenName={screenName}
  />  : null;
  const profilAvatar = typeof renderProfilAvatar =='function'? renderProfilAvatar(profilAvatarProps) : null;
  const child = <>
      {withStatusBar !== false ? <StatusBar/> : null}
      <ErrorBoundary testID={testID+"_ScreenLayoutErrorBoundary"}>
        <View testID={testID} {...containerProps}  style={[styles.container,{backgroundColor},modal && styles.modal]}>
          {appBar === false ? null : React.isValidElement(appBar)? state.AppBar :  <AppBar 
              testID={testID+'_AppBar'} {...appBarProps} 
              backAction = {defaultVal(appBarProps.backAction,backAction)} 
              elevation={defaultNumber(appBarProps.elevation,elevation)} 
              withDrawer={withDrawer} options={options} 
              ref={appBarRef} title={title} 
              subtitle={subtitle}
              right = {withProfilAvatarOnAppBar && <View testID={testID+"_ProfilAvatar_Container"}  {...profilAvatarContainerProps} style={[profilAvatarContainerProps.style,styles.profilAvatarContainer]} >
                {React.isValidElement(profilAvatar) && profilAvatar || null}
            </View> || null}
          />}
          {withScrollView !== false ? (
            <ScrollView
              testID = {testID+'_ScreenContentScrollView'}
              {...rest}
              contentContainerStyle={[contentContainerStyle]}
              style={[containerStyle,styles.container, style]}
            >
              {children}
              {fab}
            </ScrollView>
          ) : (
            <View  testID={testID+'_ScreenContent'} {...rest} style={[containerStyle,styles.wrapper,styles.container, style]}>
              {children}
              {fab}
            </View>
          )}
        </View>
      </ErrorBoundary>
  </>
  return <Wrapper>
          {renderChildren({
            containerProps : {
              ...authProps,
              required : authRequired,
            },
            children : child,
            })}
      </Wrapper>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper : {
    flexDirection:'column',
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

MainScreenScreenWithOrWithoutAuthContainer.propTypes = {
  children: PropTypes.any,
  withScrollView : PropTypes.bool,
  style:StyleProp,
  appBarProps : PropTypes.object,
  elevation : PropTypes.number,
  //appBar : PropTypes.bool,
  contentContainerStyle : StyleProp,
  withFab : PropTypes.bool,
  withDrawer : PropTypes.bool,//si l'on doit afficher un drawer dans le contenu
  fabProps : PropTypes.object,
}