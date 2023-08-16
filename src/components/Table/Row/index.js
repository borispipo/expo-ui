// Copyright 2023 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Cell from "./Cell";
import PropTypes from "prop-types";
import {isObj} from "$cutils";
import styles from "../styles";
import {useTable} from "../hooks";
import RowWrapper from "./RowWrapper";
import React from "$react";
import theme from "$theme";
export default function TableRowComponent({cells,rowKey,rowData,index,...rest}){
    const {visibleColsNames,renderItem,renderSectionHeader,columns} = useTable();
    const content = React.useMemo(()=>{
        if(rowData.isSectionListHeader && typeof renderSectionHeader ==='function'){
            return <RowWrapper style={[styles.row,theme.styles.pv1]}>
                <Cell isSectionListHeader colSpan={visibleColsNames.length}>{renderSectionHeader({isSectionListHeader:true,rowData,item:rowData,index,rowIndex:index,isTable:true,rowKey})}</Cell>
            </RowWrapper> 
        }
        return visibleColsNames.map((columnField,cIndex)=>{
            const columnDef = columns[columnField];
            if(!isObj(columnDef)) return null;
            return <Cell rowData={rowData} rowKey={rowKey} children={rowData[columnField]} rowIndex={index} columnDef={columnDef} index={cIndex} key={columnField} columnField={columnField}/>
        });
    },[rowKey,index,JSON.stringify(visibleColsNames)]);
    return <RowWrapper style={[styles.row]}>
        {content}
    </RowWrapper>;
}

TableRowComponent.propTypes = {
    rowData : PropTypes.object.isRequired,
}

export {Cell};

TableRowComponent.Cell = Cell;
