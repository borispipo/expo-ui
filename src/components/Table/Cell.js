// Copyright 2023 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import React from "react";
import { View } from "react-native";
import {defaultObj} from "$utils";
import Label from "$ecomponents/Label";

function TableCellComponent({cellArgs,rowArgs,children,renderCell,rowIndex,style,...rest}){
    const {content,containerProps} = React.useMemo(()=>{
        const rArgs = {...cellArgs,...rowArgs,containerProps : {}};
        const r = typeof renderCell =='function' && renderCell (rArgs) ||  children;
        return {
            content : typeof r =='string' || typeof r =='number'? <Label children={r}/> : React.isValidElement(r)? r : null,
            containerProps : defaultObj(rArgs.containerProps)
        }
    },[children]);
    return (<View  {...containerProps} {...rest} style={[style,containerProps.style]} >
        {content}
    </View>);
}
//const TableCellComponent = React.memo(TableCellComponent);;
export default TableCellComponent;
TableCellComponent.displayName = "TableCellComponent";