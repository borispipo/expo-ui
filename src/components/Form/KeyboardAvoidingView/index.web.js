// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import React from "$react";
import { Keyboard, Text, TextInput, StyleSheet, View } from "react-native";

/****
 * rewrite of @see : https://github.com/necolas/react-native-web/blob/master/packages/react-native-web/src/exports/KeyboardAvoidingView/index.js
 */
const KeyboardAvoidingView = ({behavior,contentContainerStyle,keyboardVerticalOffset,...rest})=>{
    const frameRef = React.useRef(null);
    const onLayout = (event)=>{
        frameRef.current = event.nativeEvent.layout;
    };
    React.useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
          'keyboardDidShow',
          (args) => {}
        );
        const keyboardDidHideListener = Keyboard.addListener(
          'keyboardDidHide',
          (args) => {}
        );
        return () => {
          keyboardDidHideListener.remove();
          keyboardDidShowListener.remove();
        };
      }, []);
    return <View onLayout={onLayout} {...rest} />;
}

export default KeyboardAvoidingView;