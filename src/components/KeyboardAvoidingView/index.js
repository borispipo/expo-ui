import {isIos} from "$cplatform";
import {KeyboardAvoidingView,StyleSheet} from 'react-native';

export default function KeyboardAvoidingViewComponent({ children,...rest }){
    return isIos() ? (
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior="padding"
        keyboardVerticalOffset={80}
        {...rest}
      >
        {children}
      </KeyboardAvoidingView>
    ) : children;
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});