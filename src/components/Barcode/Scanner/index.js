import React, { useState, useEffect,useMemo,useRef } from '$react';
import { View, StyleSheet} from 'react-native';
import { CameraView, Camera } from "expo-camera/next";
import theme from "$theme";
import ActivityIndicator from "$ecomponents/ActivityIndicator";
import Label from "$ecomponents/Label";
import PropTypes from "prop-types";
import { isNonNullString,defaultStr,defaultObj } from '$cutils';
import Button from "$ecomponents/Button";
import Dialog from "$ecomponents/Dialog";
import {DialogProvider} from "$ecomponents/Form/FormData";

export const CameraFacing = {back:"back",front:"front"};
export const FlashModes = {off:{code:"off",label:"Inactif"},on:{code:"on",label:"Actif"},auto:{code:"auto",label:"Automatique"}}
export const CameraSettingsFields = {
    enableTorch : false && {
        type : "switch",
        label : "Allumer la torche",
        defaultValue : false,
        checkedValue : true,
        uncheckedValue : false,
    },
    flash : {
      label : "Flash",
      type : "select",
      required : true,
      items : FlashModes,
      defaultValue : FlashModes.auto.code,
    },
}

/***@see : https://docs.expo.dev/versions/latest/sdk/bar-code-scanner/ */
export default function BarCodeScanner({onScan,onGrantAccess,testID,onDenyAccess,cameraProps,onCancel,dialogProps}) {
  testID = defaultStr(testID,"RN_BarCodeScanner");
  const [hasPermission, setHasPermission] = useState(null);
  const [visible,setVisible] = useState(true);
  dialogProps = Object.assign({},dialogProps);
  cameraProps = Object.assign({},cameraProps);
  const getFlashMode = ()=>{
      let {flash} = cameraProps;
      if(isNonNullString(flash)){
          flash = flash.toLowerCase().trim();
          if(FlashModes[flash]) return FlashModes[flash].code;
      }
      return FlashModes.auto.code;
  }
  const [cameraSetting,setCameraSetting] = useState({
    enableTorch : !!cameraProps.enableTorch,
    flash : getFlashMode(cameraProps.flash),
  });
  useEffect(()=>{
    const flash = getFlashMode();
    if(flash !== cameraSetting.flash){
        setCameraSetting({...cameraSetting,flash});
    }
  },[cameraProps.flash]);
  useEffect(()=>{
    const enableTorch = !!cameraProps.enableTorch;
    if(enableTorch !== cameraSetting.enableTorch){
      setCameraSetting({...cameraSetting,enableTorch});
    }
  },[!!cameraProps.enableTorch]);
  const prevVisible = React.usePrevious(visible);
  const cancelRef = React.useRef(false);
  const cancel = ()=>{
    cancelRef.current = true;
    setVisible(false);
  }
  const sFacing = useMemo(()=>{
    let {facing} = cameraProps;
    if(isNonNullString(facing)){
      facing = facing.trim().toLowerCase();
    } else return CameraFacing.back;
    return CameraFacing[facing] || CameraFacing.back;
  },[cameraProps.facing]);
  const [facing,setFacing] = useState(sFacing);
  useEffect(()=>{
    if(sFacing !== facing){
      setFacing(sFacing);
    }
  },[sFacing]);
  const isBack = facing === CameraFacing.back;
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);
  //const torchEnabledRef = useRef(cameraSetting.enableTorch);
  //const prevTorchEnabled = React.usePrevious(torchEnabledRef.current);
  const handleBarCodeScanned = ({ type, data,...rest }) => {
    if(cameraSetting.enableTorch){
      setCameraSetting({...cameraSetting,enableTorch:false});
    }
    if(typeof onScan =="function"){
        onScan({type,data,code:data,barCode:data,...rest});
    }
    setVisible(false);
  };
  useEffect(()=>{
    if(hasPermission ===false){
        if(typeof onDenyAccess =="function"){
            return onDenyAccess();
        }
    } else if(hasPermission !== null){
        if(typeof onGrantAccess =="function"){
            onGrantAccess();
        }
    }
  },[hasPermission]);
  useEffect(()=>{
    if(prevVisible === visible) return;
    if(prevVisible && !visible && cancelRef.current && typeof onCancel =="function"){
        onCancel();
    }
    cancelRef.current = false;
  },[visible]);
  const switchCameraBtn = {
      text : "Pivoter la camera",
      icon : "camera-flip",
      tooltip : `Cliquez pour basculer à la camera ${isBack ? "frontable":"arrière"}`,
      onPress : ()=>{
        setFacing(isBack ? CameraFacing.front : CameraFacing.back);
      }
  };
  return <Dialog 
    fullPage 
    actions={[
        //switchCameraBtn,
        {
          text : "Options de la camera",
          icon : "material-settings",
          tooltip : `Définir les options de la camera`,
          onPress : ()=>{
            DialogProvider.open({
                tile : "Options de la camera",
                data : cameraSetting,
                fields : CameraSettingsFields,
                onSuccess : ({data})=>{
                  setCameraSetting(data);
                  DialogProvider.close();
                },
            })
          }
      }
    ]} 
    title = {`Scanner un code barre`}
    {...dialogProps}
    onBackActionPress={cancel}
    visible = {visible}
  >
      {hasPermission === null || hasPermission === false ? <View style={[styles.center]}>
        {hasPermission === false ? <Label fontSize={18} error textBold>Accès à la camera refusée. Vous devez autoriser l'accès à la camera.</Label> : 
        <View style={[styles.row]}>
          <Label fontSize={18} warning textBold>Demande d'autorisation pour l'accès à la camera...</Label>
          <ActivityIndicator size={'large'}/>
        </View>}
      </View> : <View style={[theme.styles.flex1]} testID={testID}>
          <CameraView
            ratio='16:9'
            testID={testID+"_ScannerContent"}
            {...cameraProps}
            {...cameraSetting}
            facing = {facing}
            style={[theme.styles.flex1,{width:"100%",height:"100%"},cameraProps.style]}
            onBarcodeScanned={handleBarCodeScanned}
          />
          <View style={[styles.row,theme.styles.w100]}>
              {false ? <Button
                primary
                {...switchCameraBtn}
                style={[theme.styles.p1]}
              />:null}
              <Button
                error
                children = {"Annuler"}
                icon = "camera-off"
                title = {"Cliquez pour annuler l'opération"}
                onPress = {cancel}
              />
          </View>
        </View>}
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
  }
});

/***
  @see : https://docs.expo.dev/versions/latest/sdk/camera-next
*/
BarCodeScanner.propTypes = {
    onScan : PropTypes.func,
    onGrantAccess : PropTypes.func, //lorsque la permission est allouée
    onDenyAccess : PropTypes.func, //lorsque la permission est refusée
}