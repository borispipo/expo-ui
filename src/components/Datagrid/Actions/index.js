
import Header from "./Header";
import PropTypes from "prop-types";
import {isFunction,defaultObj} from "$cutils";
import React from "$react";
import {splitActions,renderSplitedActions} from "$ecomponents/AppBar/utils";
import {MORE_ICON} from "$ecomponents/Icon/utils";
import theme from "$theme"
import Button from "$ecomponents/Button";
import { StyleSheet } from "react-native";
import Label from "$ecomponents/Label";
import { useWindowDimensions } from "react-native";
import {useDatagrid,useGetSelectedRowsCount} from "../hooks";
export default function DatagridActions ({actions,actionProps,...props}){
  const {context} = useDatagrid();
  const selectedRowsCount = useGetSelectedRowsCount();
  useWindowDimensions();
  const selected = !!selectedRowsCount;
  actions = selected ? context?.renderSelectedRowsActions.call(context,{}) : actions;
  if(selected){
    actionProps = Object.assign({},actionProps);
    actionProps.style = Object.assign({},StyleSheet.flatten(actionProps.style));
    actionProps.style.color = "rgba(0,0,0,0.87)";
    actionProps.color = "rgba(0,0,0,0.87)";
  }
  let sArg = {};
  if(isFunction(actions)){
      sArg = isFunction(context?.getActionsArgs) ? defaultObj(context?.getActionsArgs(selected)) : {}
      if(!sArg || typeof sArg !=='object'){
        sArg = {};
      }
      sArg.selectedRows = context.getSelectedRows();
      sArg.size = sArg.selectedRowsCount = selectedRowsCount;
      sArg.context = context;
      actions = actions.call(context,sArg);
  }
  const splitedActions = isObjOrArray(actions)? splitActions({...props,...sArg,actionProps,actions,isAppBarAction:false,alwaysSplitOnMobile:true}) : undefined;
  let contextualTitle = "";
  if(selectedRowsCount > 0){
    let sLetter = (selectedRowsCount>1?'s':'');
    contextualTitle = (selectedRowsCount<10?'0':'')+selectedRowsCount+(' ligne'+sLetter+' sélectionnée'+sLetter),1;
  }
  const children = renderSplitedActions(splitedActions,{
      anchor : (props)=>{
        return <Button
          {...props}
          contentStyle = {[{flexDirection:'row-reverse',paddingHorizontal:10}]}
          style = {[theme.isDark() && {backgroundColor:'transparent'}]}
          color = {theme.colors.text}
          icon = {MORE_ICON}
          children = {splitedActions.actions.length ? null : "Actions"}
        />
      }
  });
  return <Header
        {...props}
        title = {contextualTitle}
        selected = {selected}
      >
        {children ||  <Label style={{padding:15}}>ACTIONS</Label>}
    </Header>;
}

DatagridActions.propTypes = {
  actions : PropTypes.oneOfType([
    PropTypes.func, PropTypes.object, PropTypes.array,
  ]),
  /*** le tire du menu contextuel */
  title : PropTypes.node,
  visible: PropTypes.bool,
};