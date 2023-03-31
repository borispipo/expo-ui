
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
import APP from "$capp/instance";
import { useWindowDimensions } from "react-native";

export default function DatagridActions (_props){
  let {actions,actionProps,selectedRowsActions,bindResizeEvent,context,selectedRows:_selectedRows,...props} = _props;
  props = defaultObj(props);
  context = defaultObj(context);
  const [state,setState] = React.useState({
    selectedRows : defaultObj(_selectedRows),
  });
  const selectedRowsCallBackRef = React.useRef(null);
  const setSelectedRows = (selectedRows,cb)=>{
    if(isObj(selectedRows)){
      selectedRowsCallBackRef.current = cb;
      setState({...state,selectedRows:Object.assign({},selectedRows)})
    }
  }
  const dimensions = bindResizeEvent !== false ? useWindowDimensions() : {};
  React.useEffect(()=>{
    setSelectedRows(_selectedRows,null);
  },[_selectedRows]);
  const selectedRows = state.selectedRows;
  React.useEffect(()=>{
    if(typeof selectedRowsCallBackRef.current =='function'){
      selectedRowsCallBackRef.current({});
    }
    selectedRowsCallBackRef.current = null;
  },[selectedRows]);
  let sCounts = Object.size(selectedRows);
  const selected = sCounts > 0 ? true : false;
  actions = selected ? selectedRowsActions : actions;
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
      sArg.selectedRows = selectedRows;
      sArg.size = sArg.selectedRowsCount = sCounts;
      sArg.context = context;
      actions = actions.call(context,sArg);
  }
  const splitedActions = isObjOrArray(actions)? splitActions({...props,...sArg,actionProps,actions,isAppBarAction:false,alwaysSplitOnMobile:true}) : undefined;
  let contextualTitle = "";
  if(sCounts > 0){
    let sLetter = (sCounts>1?'s':'');
    contextualTitle = (sCounts<10?'0':'')+sCounts+(' ligne'+sLetter+' sélectionnée'+sLetter),1;
  }
  context.datagridActionsContext = {setSelectedRows};
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
  ///la fonction updateDatagridActions est définies dans les actions du datagrid
  context.updateDatagridActions = ()=>{
      return setSelectedRows({...selectedRows});
  }
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
  selectedRowsActions : PropTypes.oneOfType([
    PropTypes.func, PropTypes.object, PropTypes.array,
  ]),
  bindResizeEvent : PropTypes.bool,
  context : PropTypes.object.isRequired,///le context d'exécution du datagridAction
};