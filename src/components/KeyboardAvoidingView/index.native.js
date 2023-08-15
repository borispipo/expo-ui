import {KeyboardAvoidingView,Platform,StyleSheet} from 'react-native';
import {isAndroid} from "$platform";
import React from "$react";

const KeyboardAvoidingViewComponent = React.forwardRef(({children,isPreloader,...rest },ref)=>{
    return (
      <KeyboardAvoidingView
        ref={ref ? ref: x=>x}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={isAndroid()?0:80}
        {...rest}
        style = {[!isPreloader && styles.wrapper,rest.style]}
      >
        {children}
      </KeyboardAvoidingView>
    );
});
KeyboardAvoidingViewComponent.displayName = "KeyboardAvoidingViewComponent";
export default KeyboardAvoidingViewComponent;
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});