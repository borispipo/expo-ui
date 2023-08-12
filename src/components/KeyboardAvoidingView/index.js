import View from "$ecomponents/View";
import React from "$react";
const KeyboardAvoidingViewComponent = React.forwardRef(({children,...props},ref)=>{
  return <View {...props}>{children}</View>
});

KeyboardAvoidingViewComponent.displayName = "KeyboardAvoidingViewComponent";
KeyboardAvoidingViewComponent.propTypes = Object.assign({},View.propTypes);