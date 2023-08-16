// Copyright 2023 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Cell from "./Cell";
import React from "$react";
import { View } from "react-native";
import PropTypes from "prop-types";
import { StyleSheet } from "react-native";
import {isMobileNative} from "$cplatform";
import {classNames} from "$cutils";
const isNative = isMobileNative();
const Component = isNative ? View : "tr";
import theme from "$theme";

export default function RowHeaderComponent({visible,className,children:cChildren,...rest}){
    const children = React.useMemo(()=>{
        return cChildren;
    },[cChildren]);
    const rP = isNative ? rest : {className:classNames(className,"table-footer-or-header-row")}
    if(!isNative && !visible) return null;
    //const backgroundColor = theme.isDark()? theme.Colors.lighten(theme.surfaceBackgroundColor):theme.Colors.darken(theme.surfaceBackgroundColor);
    return <Component {...rP} style={StyleSheet.flatten([rest.style,!visible && {height:0,opacity:0,display:'none'}])}>
        {children}
    </Component>
}

RowHeaderComponent.propTypes = {
    visible : PropTypes.bool,
}

export {Cell};

RowHeaderComponent.Cell = Cell;
