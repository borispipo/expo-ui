import {KeyboardAvoidingView,StyleSheet} from 'react-native';

export default function KeyboardAvoidingViewComponent({ children,...rest }){
    return (
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={80}
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