// Copyright 2023 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import React from "$react";
import PropTypes from "prop-types";
import { StyleSheet } from "react-native";
import {defaultObj} from "$cutils";
import { useTable } from "../hooks";
import styles from "../styles";
import CellWrapper from "./CellWrapper";

export default function TableFiltersCellComponent({isFilter,isFooter,className,...rest}){
    const {visibleColsNames,colsWidths,filterable,visibleColsNamesStr,filtersContainerProps,showFilters,filters} = useTable();
    const visible = !!showFilters && filterable !== false
    const containerProps = defaultObj(filtersContainerProps);
    const style = filters ? styles.filters : null;
    const children = React.useStableMemo(()=>{    
        console.log("rendering filter ",visibleColsNamesStr);
        return visibleColsNames.map((columnField,index)=>{
            return <CellWrapper width={colsWidths[columnField]}  key={columnField} columnField={columnField} columIndex={index}/>
        });
    },[visibleColsNamesStr]);
    React.useMemo(()=>{
        console.log("will render me ",visibleColsNames)
    },[])
    return null;
}

TableFiltersCellComponent.propTypes = {
    visible : PropTypes.bool,
}


const hStyle = StyleSheet.create({
    hidden : {height:0,opacity:0,display:'none'}
});
