import React, { useState, useEffect,useMemo } from '$react';
import { View, StyleSheet} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import theme from "$theme";
import ActivityIndicator from "$ecomponents/ActivityIndicator";
import Label from "$ecomponents/Label";
import PropTypes from "prop-types";
import { isNonNullString,defaultStr } from '$cutils';
import Button from "$ecomponents/Button";
import Dialog from "$ecomponents/Dialog";

export const scannerTypes = {back:"back",front:"front"};

/***@see : https://docs.expo.dev/versions/latest/sdk/bar-code-scanner/ */
export default function App({onScan,onGrantAccess,testID,onDenyAccess,scannerProps,onCancel,dialogProps}) {
  testID = defaultStr(testID,"RN_BarCodeScanner");
  const [hasPermission, setHasPermission] = useState(null);
  const [visible,setVisible] = useState(true);
  dialogProps = Object.assign({},dialogProps);
  scannerProps = Object.assign({},scannerProps);
  const prevVisible = React.usePrevious(visible);
  const cancelRef = React.useRef(false);
  const cancel = ()=>{
    cancelRef.current = true;
    setVisible(false);
  }
  const getCameraType = ()=>{
    let {type} = scannerProps;
    if(isNonNullString(type)){
      type = type.toLowerCase().trim();
    } else type  = scannerTypes.back;
    if(!scannerTypes[type]){
      type = scannerTypes.back;
    }
    return type;
  }
  const sType = useMemo(()=>{
    return getCameraType();
  },[scannerProps.type]);
  const [scannerType,setScannerType] = useState(sType);
  useEffect(()=>{
    const type = getCameraType();
    if(type !== scannerType){
      setScannerType(type);
    }
  },scannerProps.type)
  const isBack = scannerType === scannerTypes.back;
  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data,...rest }) => {
    //setScanned(true);
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
        setScannerType(isBack ? scannerTypes.front : scannerTypes.back);
      }
  };
  return <Dialog 
    fullPage 
    actions={[switchCameraBtn]} 
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
          <BarCodeScanner
            ratio='16:9'
            testID={testID+"_ScannerContent"}
            {...scannerProps}
            type={scannerType}
            style={[theme.styles.flex1,{width:"100%",height:"100%"},scannerProps.style]}
            onBarCodeScanned={handleBarCodeScanned}
          />
          <View style={[styles.row,theme.styles.w100]}>
              <Button
                primary
                {...switchCameraBtn}
                style={[theme.styles.p1]}
              />
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
BarCodeScanner.propTypes = {
    onScan : PropTypes.func,
    onGrantAccess : PropTypes.func, //lorsque la permission est allouée
    onDenyAccess : PropTypes.func, //lorsque la permission est refusée
}