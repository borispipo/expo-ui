// Copyright 2023 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import React from "react";
import View from "$ecomponents/View";
import {useTable} from "../../hooks";
function TableCellContentComponent({children,columnField,style,colSpan,...rest}){
    const {colsWidths} = useTable();
    const width = columnField ? colsWidths[columnField] : 0;
    return (<View testID={"RN_TableRowCellContentComponent"} {...rest} style={[style,width && {width}]}>
        {children}
    </View>);
}
//const TableCellContentComponent = React.memo(TableCellContentComponent);;
export default TableCellContentComponent;
TableCellContentComponent.displayName = "TableCellContentComponent";