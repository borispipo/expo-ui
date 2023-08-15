import KeyboardAvoidingView from "../KeyboardAvoidingView";
import React  from "$react";
import { useWindowDimensions } from "react-native";

const DialogContentComponent = ({isPreloader,isFullScreen,...props})=>{
    const isFull = isFullScreen();
    //useWindowDimensions();
    const content = React.useMemo(()=>props.children,[isPreloader]);
    return isPreloader || !isFull ? content : <KeyboardAvoidingView>{content}</KeyboardAvoidingView>
}
export default DialogContentComponent;