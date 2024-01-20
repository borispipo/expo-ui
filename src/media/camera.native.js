import { Camera,CameraType } from 'expo-camera';
export {Camera};
import { useState,useMemo,useEffect,useRef,usePrevious,forwardRef,mergeRefs } from '$react';
import {HStack} from "$ecomponents/Stack";
import Dialog from "$ecomponents/Dialog";
import theme from "$theme";
import Button from "$ecomponents/Button";
import Label from "$ecomponents/Label";
import View from "$ecomponents/View";
import {getTakePhotoOptions} from "./utils";
import PropTypes from "prop-types";
import { isBase64 } from '$cutils';

export const Component = forwardRef(({onGrantAccess,onDenyAccess,takePictureOptions,onSuccess,onCameraReady:cOnCameraReader,onCancel,onDismiss,autoTakePicture,type:defType,dialgProps,dialogRef,...cameraProps},ref)=> {
    const [visible,setVisible] = useState(true);
    const innerRef = useRef(null);
    const cancelRef = useRef(null);
    const [cameraReady,setCameraReady] = useState(false);
    const takePicture = ()=>{
        if(typeof innerRef?.current?.takePictureAsync =='function'){
            const camOptions = getTakePhotoOptions(takePictureOptions);
            innerRef.current.takePictureAsync(camOptions).then((result)=>{
                result.dataURL = result.dataUrl = isBase64(result.base64) ? 'data:image/jpeg;base64,'+result.base64 : undefined;
                if(typeof onSuccess =='function'){
                    onSuccess(result);
                }
                return result;
            });
        }
    }
    const onCameraReady = ()=>{
        if(!cameraReady){
            setCameraReady(true);
        }
        if(typeof cOnCameraReader =="function"){
            cOnCameraReader();
        }
    }
    takePictureOptions = Object.assign({},takePictureOptions);
    
    const prevVisible = usePrevious(visible);
    const cancel = ()=>{
      cancelRef.current = true;
      setVisible(false);
    }
    useEffect(()=>{
      if(visible === prevVisible) return;
      if(!visible && typeof onDismiss =="function"){
          onDismiss();
      }
      if(prevVisible && !visible && cancelRef.current && typeof onCancel =='function'){
          onCancel();
      }
      cancelRef.current = true;
    },[visible])
    const commonType = useMemo(()=>{
      if(typeof defType !== "number" || !(defType in CameraType)){
          return CameraType.back;
      }
      return defType;
    },[defType]);
    const [type, setType] = useState(commonType);
    useEffect(()=>{
      if(commonType !== type){
          setType(commonType);
      }
    },[commonType])
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const hasPermission = permission && permission?.granted || false;
    useEffect(()=>{
      if(!hasPermission){
          if(typeof onDenyAccess =="function"){
              onDenyAccess()
          }
          return;
      } 
      if(typeof onGrantAccess =='function'){
          onGrantAccess();
      }
    },[hasPermission]);
    const isBack = type === CameraType.back;
    dialgProps = Object.assign({},dialgProps);
    function toggleCameraType() {
      setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
    }
    const togglePhotoBtn = {
      text : "Pivoter la camera",
      icon : "camera-flip",
      tooltip : `Cliquez pour basculer à la camera ${isBack ? "frontable":"arrière"}`,
          onPress : toggleCameraType
    };
    const takePictureBtn = cameraReady ?  {
        text : "Photographier",
        icon : "camera",
        tooltip : `Cliquez pour prendre une photo`,
        onPress : takePicture,
    } : null;
    return <Dialog ref={dialogRef} {...dialgProps} fullPage visible={visible} actions={[takePictureBtn,togglePhotoBtn]} title={"Enregistrer une photo"} onBackActionPress={(...arg)=>{
      if(typeof dialgProps.onBackActionPress =="function" && dialgProps.onBackActionPress(...arg) === false) return;
      cancel();
    }}>
            {hasPermission ? <View style={[theme.styles.flex1,theme.styles.w100]}>
                <Camera {...cameraProps} 
                    ref={mergeRefs(ref,innerRef)} style={[theme.styles.flex1,cameraProps.style]} type={type}
                    onCameraReady = {onCameraReady}
                >
                </Camera>
                <HStack>
                      {takePictureBtn? <Button
                        {...takePicture}
                        success
                      />:null}
                      <Button
                          {...togglePhotoBtn}
                          style = {[theme.styles.w100]}
                      />
                      <Button
                          error
                          children = {"Annuler"}
                          icon = "camera-off"
                          title = {"Cliquez pour annuler l'opération"}
                          onPress = {cancel}
                      />
                  </HStack>
            </View> : 
            <View style={[theme.styles.flex1,theme.styles.justifyContentCenter,theme.styles.w100,theme.styles.alignItemsCenter]}>
                <Label>{`Permission non autorisée. Vous devez autoriser l'accès à la camera`}</Label>    
            </View>}
    </Dialog>
  });
  
  Component.displayName = "CameraPhotoComponent";
  
  Component.propTypes = {
    takePictureOptions : PropTypes.object,//les options pour la prise de la photo
    autoTakePicture : PropTypes.bool, //si la camera devra prendre la photo lorsque celle si sera visible
  }