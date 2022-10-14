import Menu  from "./Menu";
import React from "$react";

const BottomSheetContent = React.forwardRef((props,ref)=>{
    return <Menu
        testID = {"RN_BottomSheetContentComponent"}
        {...props}
        ref = {ref}
        renderMenuContent = {false}
    />
})

BottomSheetContent.propTypes = {
    ...Menu.propTypes,
}

export default BottomSheetContent;

BottomSheetContent.displayName = "BottomSheetContent";