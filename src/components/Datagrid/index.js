import Accordion,{ TableData as TableDataAccordion} from "./Accordion";
import Table,{TableData as DatagridTableData} from "./Table";
import {isDesktopMedia,isMobileMedia} from "$cplatfrom/dimensions";
import {isFunction} from "$utils";
import React from "$react";
import {getRenderType} from "./utils";

export * from "./Common";


const DatagridMainComponent = React.forwardRef((props,ref)=>{
    const isDesk = isDesktopMedia();
    const isMob = isMobileMedia();
    const [isTableData] = React.useStateIfMounted(defaultStr(props.tableName,props.table) || typeof props.fetchData ==='function' || props.isTableData?true : false);
    const TableComponent = isTableData ? DatagridTableData : Table;
    const AccordionComponent = isTableData ? TableDataAccordion : Accordion;
    let Component = TableComponent;
    const canRenderAccordion = (isFunction(props.accordion) || (isObj(props.accordionProps) && isFunction(props.accordionProps.accordion)) || props.accordion === true);
    let renderType = defaultStr(getRenderType(),isDesk? "fixed":'accordion').trim().toLowerCase()
    if(renderType == 'accordion' && canRenderAccordion){
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