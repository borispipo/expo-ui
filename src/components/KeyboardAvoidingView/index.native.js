import {KeyboardAvoidingView,Platform,StyleSheet} from 'react-native';
import {isAndroid} from "$platform";

export default function KeyboardAvoidingViewComponent({ children,...rest }){
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={isAndroid()?0:80}
        {...rest}
        style = {[styles.wrapper,rest.style]}
      >
        {children}
      </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});