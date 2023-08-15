// Copyright 2023 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import React from "$react";
import { View } from "react-native";
import PropTypes from "prop-types";
import { StyleSheet } from "react-native";
import {isMobileNative} from "$cplatform";
import {classNames} from "$cutils";
const isNative = isMobileNative();
const Component = isNative ? View : "tr";

export default function TableFiltersComponent({visible,className,children:cChildren,...rest}){
    const children = React.useMemo(()=>{
        return cChildren;
    },[cChildren]);
    const rP = isNative ? rest : {className:classNames(className,"table-footer-or-header-row")}
    if(!isNative && !visible) return null;
    return <Component {...rP} style={StyleSheet.flatten([rest.style,!visible && {height:0,opacity:0,display:'none'}])}>
        {children}
    </Component>
}

TableFiltersComponent.propTypes = {
    visible : PropTypes.bool,
}