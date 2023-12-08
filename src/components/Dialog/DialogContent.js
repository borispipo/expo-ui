import KeyboardAvoidingView from "../KeyboardAvoidingView";
import React  from "$react";
import {usePageDimensions} from "$cdimensions/utils";

const DialogContentComponent = ({isPreloader,title,children,isFullScreen,...props})=>{
    usePageDimensions();
    return React.useMemo(()=>children,[children]);
    //return content;
}
export default DialogContentComponent;