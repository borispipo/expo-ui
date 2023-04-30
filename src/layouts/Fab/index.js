import Fab from "$ecomponents/Fab";
import { StyleSheet } from "react-native";
import {isObjOrArray,isObj,defaultStr,defaultObj} from "$cutils";
import APP from "$capp";
import React from "$react";
import {navigateToTableData} from "$enavigation/utils";
import PropTypes from "prop-types";
import theme from "$theme";
import {isLoggedIn as isAuthLoggedIn} from "$cauth/utils/session";

export * from "./utils";

const FabLayoutComponent = React.forwardRef(({style,screenName,tables,...props},ref)=>{
  const [isLoggedIn,setIsLoggedIn] = React.useState(isAuthLoggedIn());
  const isMounted = React.useIsMounted();
  const actions = React.useMemo(()=>{
      if(!isLoggedIn) return null;
      const a = [];
      Object.map(tables,(table,i,index)=>{
          if(!isObj(table) || table.showInFab === false) return;
          const icon  = defaultStr(table.addIcon,"material-add");
          const text = defaultStr(table.text,table.label);
          const addText = defaultStr(table.newElementLabel,"Nouveau");
          const tableName = defaultStr(table.table,table.tableName);
          let auth = true;
          if(typeof Auth !=='undefined' && Auth && Auth.isTableDataAllowed){
             auth = Auth.isTableDataAllowed({table:tableName,action:'create'});
          }
          if(!table || !icon || !text || !auth) return;
          let fabProps = typeof table.getFabProps ==='function'? table.getFabProps({tableName}) : defaultObj(table.fabProps);;
          if(fabProps === false) return;
          fabProps = defaultObj(fabProps);
          const cSuffix = theme.Colors.getSuffix(index);
          const color = theme.Colors.isValid(fabProps.color)? fabProps.color : theme.Colors.getContrast(cSuffix);
          const backgroundColor = theme.Colors.isValid(fabProps.backgroundColor)?fabProps.backgroundColor : cSuffix;
          const label = defaultStr(fabProps.label,fabProps.text,"{0} | {1}".sprintf(addText,text));
          a.push({
              icon,
              label,
              tooltip:label,
              ...fabProps,
              color,
              backgroundColor,
              onPress : (e)=>{
                  if(fabProps.onPress && fabProps.onPress({...React.getOnPressArgs(e),table,tableName,navigateToTableData,navigate:navigateToTableData}) === false) return;
                  navigateToTableData({tableName});
              }   
          })
      })
      return a.length ? a : null;
  },[isLoggedIn]);
  React.useEffect(()=>{
      const onLogin = ()=>{
          if(!isMounted())return;
          setIsLoggedIn(true);
      },onLogout = ()=>{
          if(!isMounted()) return;
          setIsLoggedIn(false);
      }
      APP.on(APP.EVENTS.AUTH_LOGIN_USER,onLogin);
      APP.on(APP.EVENTS.AUTH_LOGOUT_USER,onLogout);
      return ()=>{
          APP.off(APP.EVENTS.AUTH_LOGIN_USER,onLogin);
          APP.off(APP.EVENTS.AUTH_LOGOUT_USER,onLogout);
      }
  },[])
  return actions ? <Fab.Group
        {...props}
        screenName = {screenName}
        ref = {ref}
        style={[styles.fab,style]}
        actions = {actions}
    /> : null;
});
const styles = StyleSheet.create({
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
    },
  })

  export default FabLayoutComponent;

  FabLayoutComponent.displayName = "FabLayoutComponent";

  FabLayoutComponent.propTypes = {
    tables : PropTypes.oneOfType([
        PropTypes.objectOf(PropTypes.object),
        PropTypes.arrayOf(PropTypes.object)
    ]),
    screenName : PropTypes.string,
  }