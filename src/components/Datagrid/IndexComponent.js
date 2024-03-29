// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Accordion,{ TableData as TableDataAccordion} from "./Accordion";
import Table,{TableData as DatagridTableData} from "./Table";
import {isDesktopMedia,isMobileMedia} from "$cplatform/dimensions";
import {isFunction,defaultVal,defaultStr} from "$cutils";
import React from "$react";
import {getRenderType} from "./utils";
import useExpoUI from "$econtext/hooks";


const DatagridMainComponent = React.forwardRef((props,ref)=>{
    const isDesk = isDesktopMedia();
    const isMob = defaultStr(isMobileMedia());
    const {components:{datagrid}} = useExpoUI();
    const isTableData = typeof props.isTableData =='boolean'? props.isTableData  : defaultStr(props.tableName,props.table).trim() || typeof props.fetchData ==='function'?true : false;
    const rType = defaultStr(getRenderType()).toLowerCase().trim();
    const renderType = defaultStr(rType && ['table','accordion'].includes(rType) ? rType : "",isDesk? "table":'accordion').trim().toLowerCase();
    const canRenderAccordion = (isFunction(props.accordion) || (isObj(props.accordionProps) && isFunction(props.accordionProps.accordion)) || props.accordion === true);
    const Component = React.useMemo(()=>{
        if((renderType == 'accordion' || (renderType !=='table' && isMob)) && canRenderAccordion){
            return isTableData ? TableDataAccordion : Accordion;
        }
        return isTableData ? DatagridTableData : Table;
    },[isTableData,renderType,canRenderAccordion,isMob])
    return <Component
        {...datagrid}
        {...props}
        ref = {ref}
    />;
});

export default DatagridMainComponent;

DatagridMainComponent.displayName = "DatagridMainComponent";

DatagridMainComponent.propTypes = {
    ...DatagridTableData.propTypes
}
DatagridMainComponent.LinesProgressBar = DatagridMainComponent.LineProgressBar = DatagridTableData.LineProgressBar;