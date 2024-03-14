import React, { useState, useEffect,useMemo,useRef } from '$react';
import { View, StyleSheet,ImageBackground} from 'react-native';
import theme from "$theme";
import ActivityIndicator from "$ecomponents/ActivityIndicator";
import Label from "$ecomponents/Label";
import PropTypes from "prop-types";
import { isNonNullString,defaultStr,defaultObj } from '$cutils';
import Button from "$ecomponents/Button";
import Dialog from "$ecomponents/Dialog";
import ExpoImageManipulator from './ExpoImageManipulator';
import ImageCropOverlay from './ImageCropOverlay';


/***@see : https://docs.expo.dev/versions/latest/sdk/bar-code-scanner/ */
export default function ImageCropperComponent({src,testID,onCancel,dialogProps}) {
  testID = defaultStr(testID,"RN_ImageCropperComponent");
  const [visible,setVisible] = useState(true);
  dialogProps = Object.assign({},dialogProps);
  const prevVisible = React.usePrevious(visible);
  const cancelRef = React.useRef(false);
  const cancel = ()=>{
    cancelRef.current = true;
    setVisible(false);
  }
  useEffect(()=>{
    if(prevVisible === visible) return;
    if(prevVisible && !visible && cancelRef.current && typeof onCancel =="function"){
        onCancel();
    }
    cancelRef.current = false;
  },[visible]);
  return <Dialog 
    fullPage 
    actions={[]} 
    title = {`Rogner l'image`}
    {...dialogProps}
    onBackActionPress={cancel}
    visible = {visible}
  >
    <ImageBackground
        resizeMode="contain"
        style={styles.imageBackground}
        source={{ uri : src }}
    >
        <ImageCropOverlay onLayoutChanged={(top, left, width, height) => {                                
                console.log(top,lef,width,height," is to lefff")
        }} initialWidth={50} initialHeight={50} 
            initialTop={0} initialLeft={0} 
            minHeight={100} minWidth={100}
        />
    </ImageBackground>  
  </Dialog>;
}
const styles = StyleSheet.create({
  center : {
    justifyContent : "center",
    alignItems  : "center",
    flexDirection : "column",
    flex : 1,
  },
  row : {
    flexDirection : "row",
    justifyContent : "center",
    alignItems : "center",
    flexWrap :"wrap",
  },
  imageBackground : {
    flex : 1,
    width : "100%",
    height : "100%",
    justifyContent: 'center', 
    padding: 20, alignItems: 'center',
  }
});

/***
  @see : https://docs.expo.dev/versions/latest/sdk/camera-next
*/
ImageCropperComponent.propTypes = {
    onScan : PropTypes.func,
    onGrantAccess : PropTypes.func, //lorsque la permission est allouée
    onDenyAccess : PropTypes.func, //lorsque la permission est refusée
}