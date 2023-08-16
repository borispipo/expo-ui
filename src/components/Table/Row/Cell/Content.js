// Copyright 2023 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import React from "react";
import {classNames} from "$cutils";
import { StyleSheet } from "react-native";
import Label from "$ecomponents/Label";

function TableCellContentComponent({children,style,...rest}){
    return (<td  {...rest} className={classNames(rest.className,"table-row-cell")} style={StyleSheet.flatten([style])}>
        {children}
    </td>);
}
//const TableCellContentComponent = React.memo(TableCellContentComponent);;
export default TableCellContentComponent;
TableCellContentComponent.displayName = "TableCellContentComponent";