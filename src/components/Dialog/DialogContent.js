import KeyboardAvoidingView from "../KeyboardAvoidingView";
import React  from "$react";
import { useWindowDimensions } from "react-native";

const DialogContentComponent = ({isPreloader,title,children,isFullScreen,...props})=>{
    return children;
    const isFull = isFullScreen();
    return React.useMemo(()=>children,[isPreloader,title,children]);
    return isPreloader || !isFull ? content : <KeyboardAvoidingView testID="RN_DialogKeybaordAvoidingView">{content}</KeyboardAvoidingView>
}
export default DialogContentComponent;