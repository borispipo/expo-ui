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
import SectionListHeaderRow from "./SectionListHeaderRow";
import {isMobileNative} from "$cplatform";
const isNative = isMobileNative();
const nativeProps = isNative ? {} : {Cell,Row:SectionListHeaderRow};
export default function TableRowComponent({cells,rowKey,rowData,index,...rest}){
    const {visibleColsNames,visibleColsNamesStr,renderSectionHeader,colsWidths,columns} = useTable();
    const content = React.useMemo(()=>{
        if(rowData?.isSectionListHeader){
           if(typeof renderSectionHeader !='function'){
                throw "Vous devez définir la fonction renderSectionListHeader, utile pour le rendu du contenu de section header de la table de données";
            }
            return renderSectionHeader({isSectionListHeader:true,renderSectionListHeaderOnFirstCell:true,
            sectionListHeaderContainerProps : {
                style : {position:"relative",paddingLeft:10,paddingRight:10}
            },
            sectionListHeaderProps:{className:"table-section-list-header",style:styles.sectionListHeaderAbsolute,testID:"RN_TableComponentSectionListHeader"}
            ,...nativeProps,rowData,item:rowData,index,rowIndex:index,isTable:true,rowKey})
        }
        return visibleColsNames.map((columnField,cIndex)=>{
            const columnDef = columns[columnField];
            if(!isObj(columnDef)) return null;
            return <Cell rowData={rowData} width={columnField ? colsWidths[columnField] : 0} rowKey={rowKey} children={rowData && rowData[columnField]||null} rowIndex={index} columnDef={columnDef} index={cIndex} key={columnField} columnField={columnField}/>
        });
    },[rowKey,index,visibleColsNamesStr]);
    return <RowWrapper {...rest} rowKey={rowKey} rowData={rowData} rowIndex={index} style={[styles.row]}>
        {content}
    </RowWrapper>;
}

TableRowComponent.propTypes = {
    rowData : PropTypes.object.isRequired,
}

export {Cell};

TableRowComponent.Cell = Cell;
