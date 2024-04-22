// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Accordion from "./Accordion";
import Table from "./Table";
import {isDesktopMedia,isMobileMedia} from "$cplatform/dimensions";
import {isFunction,defaultVal,defaultStr} from "$cutils";
import React from "$react";
import {getRenderType} from "./utils";
import useExpoUI from "$econtext/hooks";


const DatagridMainComponent = React.forwardRef((props,ref)=>{
    const isDesk = isDesktopMedia();
    const isMob = isMobileMedia();
    const {components:{datagrid}} = useExpoUI();
    const rType = defaultStr(getRenderType()).toLowerCase().trim();
    const renderType = defaultStr(rType && ['table','accordion'].includes(rType) ? rType : "",isDesk? "table":'accordion').trim().toLowerCase();
    const canRenderAccordion = (isFunction(props.accordion) || (isObj(props.accordionProps) && isFunction(props.accordionProps.accordion)) || props.accordion === true);
    const Component = React.useMemo(()=>{
        if((renderType == 'accordion' || (renderType !=='table' && isMob)) && canRenderAccordion){
            return Accordion;
        }
        return Table;
    },[renderType,canRenderAccordion,isMob]);
    return <Component
        {...datagrid}
        {...props}
        ref = {ref}
    />;
});

export default DatagridMainComponent;

DatagridMainComponent.displayName = "DatagridMainComponent";

DatagridMainComponent.propTypes = {
    ...Table.propTypes
}
DatagridMainComponent.LinesProgressBar = DatagridMainComponent.LineProgressBar = Table.LineProgressBar;