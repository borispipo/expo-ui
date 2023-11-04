import Fab from "$ecomponents/Fab";
import { StyleSheet } from "react-native";
import {isObjOrArray,isObj,defaultStr,defaultObj} from "$cutils";
import React from "$react";
import {navigateToTableData} from "$enavigation/utils";
import PropTypes from "prop-types";
import theme from "$theme";
import useExpoUI from "$econtext/hooks";
import Auth,{useIsSignedIn} from "$cauth";

export * from "./utils";

const FabLayoutComponent = React.forwardRef((p,ref)=>{ 
  const {components:{fabPropsMutator},tablesData} = useExpoUI();
  const {style,actions:fabActions,useTables,...props} = typeof fabPropsMutator == 'function'? extendObj({},p,fabPropsMutator({...p,isLoggedIn})) : p;
  const isLoggedIn = useIsSignedIn();
  const tables = isObjOrArray(fabActions)? fabActions : tablesData;
  const actions = React.useMemo(()=>{
      if(Array.isArray(fabActions)) return fabActions;
      if(!isLoggedIn || useTables === false) return null;
      const a = [];
      Object.map(tables,(table,i,index)=>{
          if(!isObj(table) || table.showInFab === false || typeof  table.showInFab =="function" && table.showInFab() === false) return;
          const icon  = defaultStr(table.addIcon,"material-add");
          const text = defaultStr(table.text,table.label);
          const addText = defaultStr(table.newElementLabel,"Nouveau");
          const tableName = defaultStr(table.table,table.tableName);
          if(!table || !icon || !text || !Auth.isTableDataAllowed({table:tableName,action:'create'})) return;
          let fabProps = typeof table.fabProps ==='function'? table.fabProps({tableName}) : defaultObj(table.fabProps);;
          if(fabProps === false) return;
          fabProps = defaultObj(fabProps);
          const cSuffix = theme.Colors.getSuffix(index);
          const color = theme.Colors.isValid(fabProps.color)? fabProps.color : theme.Colors.getContrast(cSuffix);
          const backgroundColor = theme.Colors.isValid(fabProps.backgroundColor)?fabProps.backgroundColor : cSuffix;
          if(Array.isArray(fabProps.actions)){
              return fabProps.actions.map((p)=>{
                 if(!isObj(p) || (!p.label && !p.text)) return null;
                 a.push({
                    color,
                    backgroundColor,
                    ...p,
                 });
              })
          }
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
  },[isLoggedIn,fabActions,tables]);
  return actions ? <Fab.Group
        {...props}
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
    ...Fab.propTypes,
    useTables  : PropTypes.bool,//si les tables data seront exploités pour la génération du fab
    actions : PropTypes.array, //les actions du fab layout
    screenName : PropTypes.string,
  }