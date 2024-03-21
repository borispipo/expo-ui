import * as React from 'react';
import {FAB} from "react-native-paper";
import {defaultStr} from "$cutils";
import {standardSize as mediumSize,largeSize,smallSize} from "./utils";
const FabItemComponent = React.forwardRef(({size,style,...props},ref)=>{
    size = defaultStr(size,"medium").toLowerCase().trim();
    return <FAB
      {...props}
      size={size}
      style = {[size == "small"? smallSize : size == "large"? largeSize : mediumSize,style]}
      ref = {ref}
    />
});
FabItemComponent.displayName = "FabItemComponent";

export default FabItemComponent;