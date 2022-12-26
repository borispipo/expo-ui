// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Accordion,{ TableData as TableDataAccordion} from "./Accordion";
import Dashboard  from "./Dashboard";
import Table,{TableData as DatagridTableData} from "./Table";
import {isDesktopMedia,isMobileMedia} from "$cplatform/dimensions";
import {isFunction,defaultVal} from "$utils";
import React from "$react";
import {getRenderType} from "./utils";


const DatagridMainComponent = React.forwardRef((props,ref)=>{
    const isDesk = isDesktopMedia();
    const isMob = isMobileMedia();
    const isTableDataRef = React.useRef(defaultVal(props.isTableData,defaultStr(props.tableName,props.table) || typeof props.fetchData ==='function'?true : false));
    const TableComponent = isTableDataRef.current ? DatagridTableData : Table;
    const AccordionComponent = isTableDataRef.current ? TableDataAccordion : Accordion;
    let Component = TableComponent;
    const canRenderAccordion = (isFunction(props.accordion) || (isObj(props.accordionProps) && isFunction(props.accordionProps.accordion)) || props.accordion === true);
    let renderType = defaultStr(getRenderType(),isDesk? "table":'accordion').trim().toLowerCase()
    if(false && (renderType ==="dashboard" || props.dashobard === true)){
        Component = Dashboard;
        delete props.dashobard;
    } else if(renderType == 'accordion' && canRenderAccordion){
        Component = AccordionComponent;
    } else if(renderType =='table'){
        Component = TableComponent;
    } else if(isMob && canRenderAccordion){
        Component = AccordionComponent;
    }
    return <Component
        {...props}
        ref = {ref}
    />;
});

export default DatagridMainComponent;

DatagridMainComponent.displayName = "DatagridMainComponent";

DatagridMainComponent.propTypes = {
    ...DatagridTableData.propTypes
}

DatagridMainComponent.getDBName = DatagridTableData.getDBName;

DatagridMainComponent.LinesProgressBar = DatagridMainComponent.LineProgressBar = DatagridTableData.LineProgressBar;