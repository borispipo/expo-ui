import React from "$react";
import Divider from "$components/Divider";
import { StyleSheet } from "react-native";
import View from "$components/View";
import {flattenStyle} from "$theme";
import {defaultStr} from "$utils";

const DrawerHeader = React.forwardRef(({minimized,testID,withMinimizedIcon,drawerWidth,containerProps,isLeftPosition,divider,dividerProps,toggleButton,children,...rest},ref)=>{
    rest = Object.assign({},rest);
    dividerProps = defaultObj(dividerProps);
    containerProps = defaultObj(containerProps);
    toggleButton = React.isValidElement(toggleButton)? toggleButton : null;
    children = React.isValidElement(children)? children : null;
    if(!children && !toggleButton) return null;
    if(minimized && !withMinimizedIcon) return null;
    testID = defaultStr(testID,"RN_DrawerHeaderComponent");
    return <View testID={testID} {...containerProps} ref = {ref} style = {[styles.drawerHeaderContainer,containerProps.style]}>
          <View testID={testID+"_Content"} {...rest} 
              style={flattenStyle([
                styles.drawerHeaderContent,
                rest.style,
                minimized ? styles.drawerHeaderContentMinimized : null,
                !minimized ? (isLeftPosition?styles.drawerHeaderContainerLeft:styles.drawerHeaderContainerRight) : null,
                !minimized && !children ? {justifyContent:'flex-end',flexDirection:'row'} : null,
              ])}
          >
          {minimized ? toggleButton : <>
              {children}
              {toggleButton}
          </> }
      </View>
      {divider !== false?  <Divider testID={testID+"_Divider"} {...dividerProps} style={flattenStyle([{width:'100%'},minimized?{marginTop:4}:null,dividerProps.style])}/> : null}
    </View>
});

DrawerHeader.displayName = "DrawerHeaderComponent";

export default DrawerHeader;


const styles = StyleSheet.create({
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