// Copyright 2023 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import React from "$react";
import { View } from "react-native";
import PropTypes from "prop-types";
export default function TableFiltersComponent({visible,children:cChildren,...rest}){
    const children = React.useMemo(()=>{
        return cChildren;
    },[cChildren]);
    return <View {...rest} style={[rest.style,!visible && {height:0,opacity:0,display:'none'}]}>
        {children}
    </View>
}

TableFiltersComponent.propTypes = {
    visible : PropTypes.bool,
}