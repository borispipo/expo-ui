// Copyright 2023 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import React from "$react";
import { View } from "react-native";
import PropTypes from "prop-types";
export default function TableRowComponent({cells,columns,...rest}){
    const children = React.useCallback(()=>{
        if(Array.isArray(cells)){
            return cells.map((cell,index)=>columns[index]? <React.Fragment key={index}>{cell}</React.Fragment> : null )
        }
        return cells;
    },[cells,columns])();
    return <View {...rest}>
        {children}
    </View>
}

TableRowComponent.propTypes = {
    columns : PropTypes.arrayOf(PropTypes.bool)
}