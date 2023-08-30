// Copyright 2023 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import React from "$react";
import { View } from "react-native";
import PropTypes from "prop-types";
import { StyleSheet } from "react-native";
import {isMobileNative} from "$cplatform";
import {classNames,defaultObj} from "$cutils";
const isNative = isMobileNative();
const Component = isNative ? View : "tr";
import { useTable } from "../hooks";
import styles from "../styles";
import CellWrapper from "./CellWrapper";

export default function RowHeaderComponent({isFilter,isFooter,isHeader,className,children:cChildren,...rest}){
    const {showHeaders,visibleColsNames,colsWidths,filterable,visibleColsNamesStr,headerContainerProps,footerContainerProps,filtersContainerProps,showFilters,filters,showFooters} = useTable();
    const canV = showHeaders === false ? false : Array.isArray(children)? !!children.length : true;
    const visible = canV && (isHeader ?  true : isFilter ? !!showFilters && filterable !== false : isFooter ? !!showFooters: true);
    const containerProps = defaultObj( isHeader ? headerContainerProps : isFooter ? footerContainerProps : filtersContainerProps);
    const style = filters ? styles.filters : isFooter ? styles.footer : null;
    const children = React.useMemo(()=>{    
        return visibleColsNames.map((columnField,index)=>{
            return <CellWrapper width={colsWidths[columnField]} isFilter={isFilter} isFooter={isFooter} key={columnField} columnField={columnField} columIndex={index}/>
        });
    },[visibleColsNamesStr]);
    if(!visible) return null;
    const rP = isNative ? rest : {className:classNames(className,"table-footer-or-header-row")}
    return <Component {...rP} {...containerProps} style={StyleSheet.flatten([styles.header,style,rest.style,containerProps.style,!visible && hStyle.hidden])}>
        {children}
    </Component>
}

RowHeaderComponent.propTypes = {
    visible : PropTypes.bool,
}


const hStyle = StyleSheet.create({
    hidden : {height:0,opacity:0,display:'none'}
});
