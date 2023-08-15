import View from "$ecomponents/View";
import React from "$react";
import {isNonNullString} from "$cutils";
import theme from "$theme";
const KeyboardAvoidingViewComponent = React.forwardRef(({children,style,testID,...props},ref)=>{
  return <View  {...props} style={[theme.styles.flex1,style]} children={children} testID={isNonNullString(testID) ? `${testID.trim()}_KeyboardAvoidingView` : "RN_KeyboardAvoidingView"}/>
});

KeyboardAvoidingViewComponent.displayName = "KeyboardAvoidingViewComponent";
KeyboardAvoidingViewComponent.propTypes = Object.assign({},View.propTypes);

export default KeyboardAvoidingViewComponent;