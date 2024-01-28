import { Checkbox } from "react-native-paper";
import {forwardRef} from "react";

const CheckboxItemComponent = forwardRef((props,ref)=>{
    return <Checkbox.Item
        ref = {ref}
        {...props}
    />
});

export default CheckboxItemComponent;

CheckboxItemComponent.displayName = "CheckboxItemComponent";