import {StyleSheet,useWindowDimensions} from 'react-native';  
import DrawerLayout from './DrawerLayout';
import ScrollView  from "$ecomponents/ScrollView";
import {isIos} from "$cplatform";
import React from "$react";
import PropTypes from "prop-types";
import {defaultObj,isObj,isNonNullString} from "$utils";
import theme,{Colors,flattenStyle} from "$theme";
import DrawerItems from './DrawerItems';
import {isDesktopMedia} from "$cplatform/dimensions";
import {isMobileNative} from "$cplatform";
import {open,close} from "$epreloader";
import {DRAWER_POSITIONS,DRAWER_TYPES,MINIMIZED_WIDTH,getDrawerWidth,MINIMIZED_ICON_SIZE,ICON_SIZE} from './utils';
import Icon,{MENU_ICON} from "$ecomponents/Icon";
import apiSession from "./session";
import View from "$ecomponents/View";
import Dimensions from "$cdimensions";
import {closeDrawer} from './DrawerItems/utils';
import {DrawerContext} from "./Provider";
import NavigationView from "./NavigationView";
import { canBeMinimizedOrPermanent } from './utils';

export * from "./Provider";

export {DrawerItems};
export {default as DrawerItem} from "./DrawerItems/DrawerItem";

export * from "./utils";

const canHandleExtra = x=> true;


const DrawerComponent = React.forwardRef((props,ref)=>{
    let {position,permanent,onDrawerSlide,sessionName,content,
      drawerItemsContainerProps,contentContainerStyle,drawerItemsProps,minimizable,
      minimized,drawerItems,hideStatusBar,overlayColor, onDrawerMinimize,onDrawerToggleMinimize,
      onDrawerOpen,onDrawerClose,onDrawerToggle,header,headerProps,toggleIconProps,
      permanentToggleIcon,minimizedToggleIcon,temporaryToggleIcon,withMinimizedIcon,
      isItemActive,onPageResize,navigationViewRef,
      children,drawerType} = props;
    sessionName = defaultStr(sessionName);
    useWindowDimensions();
    const sessionRef = React.useRef({});
    const session = React.useMemo(()=>{
        if(sessionName){
            return {
                get : (a,b)=> {
                    return apiSession.get(sessionName,a,b);
                },
                set : (a,b)=>{
                    return apiSession.set(sessionName,a,b);
                }
            }
        }
        return {
          get: key => {
            if(isNonNullString(key)) return sessionRef.current[key];
            return sessionRef.current;
          },
          set:(key,value)=>{
              if(isObj(key)){
                sessionRef.current = {...sessionRef.current,...key}
              } else if(isNonNullString(key)) {
                sessionRef.current[key] = value;
              }
              return sessionRef.current;
          }
        };
    },[sessionName]);
   const sessionValue = session.get();
    const drawerRef = React.useRef(null);
    const onSlideCallbackRef = React.useRef(null);
    drawerItemsContainerProps = defaultObj(drawerItemsContainerProps);
    position = defaultStr(position);
    position = DRAWER_POSITIONS[position] || (isNonNullString(sessionValue.position) && DRAWER_POSITIONS[sessionValue.position]? DRAWER_POSITIONS[sessionValue.position]:undefined) || DRAWER_POSITIONS.left
    const isLeftPosition = position === DRAWER_POSITIONS.left ? true : false;
    drawerType = defaultStr(drawerType).toLowerCase() || isNonNullString(sessionValue.drawerType) && DRAWER_TYPES[sessionValue.drawerType]? DRAWER_TYPES[sessionValue.drawerType] : "";
    if(!DRAWER_TYPES[drawerType]){
      drawerType = isIos()? DRAWER_TYPES.slide : DRAWER_TYPES.front;
    }
    overlayColor = Colors.isValid(overlayColor)?overlayColor:undefined;
    if(!overlayColor){
      overlayColor  = theme.colors.backdrop;// drawerType === DRAWER_TYPES.front ? 'black' : '#00000000';
    }
    let drawerWidth = getDrawerWidth();
    const restP = {};
    const isDesktop = isDesktopMedia();
    const _canBeMinimizedOrPermanent = canBeMinimizedOrPermanent();
    permanent = _canBeMinimizedOrPermanent ? (sessionValue.permanent !== undefined ? sessionValue.permanent : permanent) : false;
    minimized = _canBeMinimizedOrPermanent ? (sessionValue.minimized !== undefined ? sessionValue.minimized: minimized) : false;
    if(permanent === undefined){
      permanent = canBeMinimizedOrPermanent()? true : false;
    }
    if(minimized === undefined){
       minimized = false;
    }
    const [state,_setState] = React.useStateIfMounted({
        minimized,
        permanent,
    });
    if(sessionValue.permanent ===undefined){
      session.set(state);
    }
    const setState = (s,s2)=>{
        s = typeof s =='object' && s ? s : {};
        s2 = typeof s2 =='object' && s2 ? s2 : {};
        s2 = {...state,...s,...s2};
        session.set(s2);
        return _setState(s2);
    }

    const [context] = React.useState({});
    
    
    const callbackRef = React.useRef(null);
    const callback = callbackRef.current;
    callbackRef.current = null;
    ///permet de minimiser le drawer
    context.minimize = (callback)=>{
        if(!Dimensions.isDesktopMedia() || isMinimized){
            return typeof callback =='function'? callback(context.getState()) : null;
        }
        callbackRef.current = callback;
        setState({minimized:true});
    }
    /*** permet de restaurer le drawer */
    context.restore = (callback)=>{
        if(!Dimensions.isDesktopMedia() || !context.isMinimized() || !context.isPermanent()){
            return typeof callback =='function'? callback(context.getState()) : null;
        }
        callbackRef.current = callback;
        setState({minimized:false,permanent:true});
    }
    
    context.toggleMinimized = (minimized,s2)=>{
        if(!Dimensions.isDesktopMedia() || typeof minimized !== 'boolean' || !drawerRef.current || !drawerRef.current.isOpen()) return;
        if(!minimizable === false) return;
        let nS = {minimized};
        if(isObj(s2)){
            nS = {...s2,...nS};
        }
        setState(nS);
    }
    context.canToggle = x=> canHandleExtra() ? true : permanent? false : true;
    context.canMinimize = x => minimizable !== false && canBeMinimizedOrPermanent() ? true : false;
                    
    let {permanent:isPermanent,minimized:isMinimized} = session.get();
    if(_canBeMinimizedOrPermanent && isPermanent){
        overlayColor = 'transparent';
        if(isMinimized){
            drawerWidth = MINIMIZED_WIDTH;
        }
        restP.drawerLockMode = "locked-open";
    } else {
      isPermanent = false;
      isMinimized = false;
      restP.drawerLockMode = "unlocked";
      drawerWidth = drawerWidth;
    }
    context.isMinimizable = ()=>{
      return minimizable !== false && canBeMinimizedOrPermanent() ? true : false;
    }
    context.isMinimized = ()=>{
      return minimizable !== false && canBeMinimizedOrPermanent() && isDesktopMedia() && session.get("minimized")? true : false;
    }
    context.canBeMinimizedOrPermanent = canBeMinimizedOrPermanent;
    context.isPermanent = x=>{
       if(!drawerRef.current || !drawerRef.current.isOpen()) return false;
       return canBeMinimizedOrPermanent() && session.get('permanent') ? true : false;
    }
    const prevMinimized = React.usePrevious(isMinimized);
    React.useEffect(()=>{
        if(prevMinimized === isMinimized || !Dimensions.isDesktopMedia()) return;
        const args = getDrawerState();
        if(isMinimized && onDrawerMinimize){
            onDrawerMinimize(args);
        }
        if(onDrawerToggleMinimize){
          onDrawerToggleMinimize(args);
        }
        if(typeof callback =='function'){
            callback(args);
        }
        session.set("minimized",isMinimized);
    },[isMinimized])
  const prevIsDesktop = React.usePrevious(isDesktop);
  React.useEffect(()=>{
    if(!drawerRef.current) return;
    if(isDesktopMedia() && isPermanent){
       drawerRef.current.openDrawer();
    }
    if(prevIsDesktop !== isDesktopMedia() && typeof onPageResize ==='function'){
      onPageResize(getDrawerState());
    }
  },[isDesktop])
   const getDrawerState = context.getState = (args)=>{
      const isOpen = drawerRef.current && drawerRef.current.isOpen ? drawerRef.current.isOpen () : false;
      return {
          ...session.get(),context:drawerRef.current,permanent:isPermanent,
          sessionName,
          minimized : isMinimized,
          permanent : isPermanent,
          isPermanent,
          isMinimized,
          isClosed : !isOpen, closed:!isOpen,isOpen ,opened:isOpen,status: isOpen ? 'open':'closed',
          ...defaultObj(args),
      }
    }
    const customOnToggle = (args)=>{
        args = getDrawerState(args);
        if(onDrawerToggle){
            onDrawerToggle(args)
        }
        if(typeof callback =='function'){
          callback(args);
        }
    }
    toggleIconProps = defaultObj(toggleIconProps);
    headerProps = defaultObj(headerProps);

    const getDrawerRef = x=> drawerRef;
    ///lorsque le drawer est en mode permanent, l'icone par défaut est l'icon devant le dépingler du mode permanent
    const backIcon = "window-close";//isLeftPosition ? "arrow-left" : "arrow-right";
    const chevronIcon = isLeftPosition ? "chevron-left":"chevron-right";
    temporaryToggleIcon = React.isValidElement(temporaryToggleIcon)? temporaryToggleIcon : backIcon;
    permanentToggleIcon = React.isValidElement(permanentToggleIcon)? permanentToggleIcon : chevronIcon;
    minimizedToggleIcon = React.isValidElement(minimizedToggleIcon)? minimizedToggleIcon : MENU_ICON;

    let toggleIconTooltip = null;
    let toggleIcon = null, mobileToggleIconTooltip = "Cliquez pour "+(open?'Masquer':'Afficher')+ " le drawer";
    if(!isPermanent){
        toggleIconTooltip = mobileToggleIconTooltip;
        toggleIcon = temporaryToggleIcon;
    } else {
        if(isMinimized){
            toggleIconTooltip = "Cliquez pour restaurer le drawer dans son status précédent";
            if(withMinimizedIcon !== false){
                toggleIcon = minimizedToggleIcon;
            }
        } else {
          toggleIcon = permanentToggleIcon;
          toggleIconTooltip = 'Cliquer pour minimiser le drawer.\n si vous souhaitez passer le drawer en mode affichage temporaire, faite un long click (pressez le pour longtemps) sur ce bouton. ';
        }
    }
    return (
      <DrawerContext.Provider value={{
          context,drawerRef,
          session,
          close : (cb,force) =>closeDrawer(drawerRef,cb,force),
          sessionName,
          isItemActive : (opts)=>{
            if(isItemActive){
               return isItemActive(opts);
            }
            return false;
          },getState:getDrawerState,getDrawerRef}}>
          <View style={styles.container}>
              <DrawerLayout
                  {...restP}
                  permanent = {isPermanent}
                  onDrawerSlide={onDrawerSlide}
                  onDrawerOpen = {(a)=>{
                    if(drawerRef.current){
                      drawerRef.current.drawerShown = true;
                    }
                    if(onDrawerOpen){
                      onDrawerOpen({context:drawerRef.current})
                    }
                    customOnToggle({...getDrawerState(),closed:false, isClosed : false,isOpen:true,opened:true,status:'open'});
                  }}
                  onDrawerClose = {()=>{
                    if(drawerRef.current){
                      drawerRef.current.drawerShown = false;
                    }
                    if(typeof onSlideCallbackRef.current ==='function'){
                          //close();
                          onSlideCallbackRef.current();
                    }
                    onSlideCallbackRef.current = undefined;
                    if(onDrawerClose){
                      onDrawerClose({context:drawerRef.current})
                    }
                    customOnToggle({...getDrawerState(),isClosed : true, closed:true,isOpen : false ,opened:false,status:'closed'})
                  }}
                  ref={(el)=>{
                    drawerRef.current = el;
                    if(drawerRef.current){
                      Object.map(context,(v,i)=>{
                        if(drawerRef.current[i] === undefined){
                          drawerRef.current[i] = v;
                        }
                      });
                      drawerRef.current.open = drawerRef.current.openDrawer;
                      drawerRef.current.runAfterSlide = (cb,force)=>{
                          if(!permanent){
                              //force !== true ? open() : false;
                              onSlideCallbackRef.current = cb;
                              return drawerRef.current.closeDrawer();
                          }
                            if(typeof cb =='function'){
                              cb(getDrawerState());
                            }
                        }
                        drawerRef.current.close = drawerRef.current.runAfterSlide;
                        drawerRef.current.isOpen = context.isOpen = typeof drawerRef.current.isOpen =='function'? drawerRef.current.isOpen.bind(drawerRef.current) : x=> drawerRef && drawerRef.current ? drawerRef.current.drawerShown : false;
                        drawerRef.current.isClosed = context.isClosed = x => !drawerRef.current.isOpen();
                        context.toggle = drawerRef.current.toggleDrawer = drawerRef.current.toggle = cb =>{
                          if(isPermanent || isMinimized) {
                            if(typeof cb ==='function'){
                                cb(getDrawerState(getDrawerState()));
                            }
                            return;
                          }
                          callbackRef.current = cb;
                          if(drawerRef.current.isOpen()){
                              drawerRef.current.closeDrawer();
                          } else {
                              drawerRef.current.openDrawer();
                          }
                      }
                      drawerRef.current.getState = getDrawerState;
                    }
                    React.setRef(ref,drawerRef.current);
                  }}
                  drawerWidth={drawerWidth}
                  keyboardDismissMode="on-drag"
                  drawerPosition={position}
                  drawerType={drawerType}
                  hideStatusBar = {defaultBool(hideStatusBar,true)}
                  overlayColor = {overlayColor}
                  renderNavigationView={(opts)=>{
                    const cArgs = {...getDrawerState()}
                    const h = typeof header === 'function'? header(cArgs) : header;
                    const c = typeof content =='function'? content (cArgs) : content;
                    return <NavigationView
                      opts = {opts}
                      ref = {navigationViewRef}
                      {...{context,toggleIcon,toggleIconTooltip,header:h,content:c,isPermanent,drawerItemsProps,drawerType,drawerItems,drawerRef,setState,toggleIconProps,isLeftPosition,drawerWidth,minimizable,headerProps,isMinimized,drawerItemsContainerProps}}
                    />
                  }}
                  contentContainerStyle={[
                    {paddingBottom:30},
                    contentContainerStyle
                  ]
                }>
              {children}
            </DrawerLayout>
        </View>
    </DrawerContext.Provider>
    );
})

  export default DrawerComponent;




const iconType = PropTypes.oneOfType([
  PropTypes.node,
  PropTypes.string,
]);

DrawerComponent.propTypes = {
  ...defaultObj(DrawerLayout.propTypes),
  permanent : PropTypes.bool,
  minimized : PropTypes.bool,
  bindResizeEvent : PropTypes.bool,
  children : PropTypes.node,
  onMount : PropTypes.func,
  onUnmount : PropTypes.func,
  onDrawerOpen : PropTypes.func,
  onDrawerClose : PropTypes.func,
  onDrawerSlide : PropTypes.func,
  onDrawerToggle : PropTypes.func,
  drawerItemsProps : PropTypes.object,
  drawerItems : PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.node,
    PropTypes.element,
    PropTypes.elementType,
    PropTypes.func
  ]),
  isItemActive : PropTypes.func,///vérifie si un item est actif où pas
  permanent : PropTypes.bool,
  onDrawerToggle : PropTypes.func,
  onDrawerToggleMinimize : PropTypes.func,
  onDrawerMinimize : PropTypes.func,
  children : PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.node,
  ]),
  /*** le header à afficher sur le drawer */
  header : PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.func,
  ]),
  headerProps : PropTypes.object,//les props à passer drawerHeader
  onDrawerClose : PropTypes.func,
  onDrawerClose : PropTypes.func,
  onDrawerOpen : PropTypes.func,
  /***l'icone toggle lorsque le drawer est en mode temporaire, dont mobile */
  temporaryToggleIcon : iconType,
  //l'icone du button toggle lorsque le drawer est en mode permament
  permanentToggleIcon : iconType, 
  //l'icone de toggle lorsque le drawer est en mode persistant
  persistentToggleIcon : iconType,
  minimizedToggleIcon : iconType, //l'icone du drawer lorsque celui si est en mode minimisté
  /*** si l'icone minimisé est affiché lorsque le drawer est en mode minimisé */
  withMinimizedIcon : PropTypes.bool,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerContainer: {
    flex: 1,
    paddingTop : 0,// isMobileNative()? 25:0,
  },
  drawerText: {
    margin: 10,
    fontSize: 15,
    textAlign: 'left',
  },
  drawerHeaderContainer : {
      flexDirection : 'column',
      alignItems : 'center',
      justifyContent : 'flex-start',
  },
  drawerHeaderContent : {
    margin : 0, 
    justifyContent : 'space-between',
    flexDirection : 'row',
    alignItems : 'center',
    paddingHorizontal : 10,
    width : '100%',
  },
  drawerHeaderContentMinimized : {
      textAlign : 'center',
      alignSelf : 'center',
      justifyContent : 'center',
      alignContent : 'center',
      paddingTop : 10,
  },
  drawerHeaderContainerLeft : {
    flexDirection : 'row',
    //paddingRight : 20,
  },  
  drawerHeaderContainerRight : {
    flexDirection : 'row-reverse',
    //paddingLeft : 20,
  },
});

DrawerComponent.displayName = "DrawerComponent";