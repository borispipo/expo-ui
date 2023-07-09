// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import React from "$react";
import View from "$ecomponents/View";
import Label from "$ecomponents/Label";
import PropTypes from 'prop-types';
import { StyleSheet } from "react-native";
import {defaultStr,defaultObj} from "$cutils";
import theme from "$theme";

const FieldSet = React.forwardRef(({testID,style,children,labelProps,containerProps,label,borderColor,...props},ref)=>{
    testID = defaultStr(testID,"RN_FieldSetComponent");
    containerProps = defaultObj(containerProps);
    labelProps = defaultObj(labelProps);
    borderColor = theme.Colors.isValid(borderColor)?borderColor : theme.colors.divider;
    return (
        <View ref ={ref} testID={testID+"_Container"} {...containerProps} style={[styles.container, { borderColor},containerProps.style]}>
            <Label testID={testID+"_Label"} {...labelProps} style={[styles.label,labelProps.style]}>
                {React.isValidElement(label,true) && label || null}
            </Label>
            <View {...props} testID={testID} style={[styles.content,style]}>
                {React.isValidElement(children) && children || null}
            </View>
        </View>
    );
});

FieldSet.propTypes = {
    label: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.node,
        PropTypes.element,
    ]),
    children: PropTypes.element,
    labelProps : PropTypes.object,
    containerProps : PropTypes.object,
    style : theme.StyleProps,
}


const styles = StyleSheet.create({
    container: {
        borderWidth: 1.1,
        borderRadius: 5,
        position : 'relative',
    },
    content : { 
        flex: 1, 
        paddingVertical: 10 
    },
    label: {
        height: 0,
        position: 'absolute',
        top: -10,
        left: 10,
    },
});

FieldSet.displayName  = "FieldSetComponent";

export default FieldSet;