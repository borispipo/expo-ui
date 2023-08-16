import React,{useMemo,useContext,createContext} from "$react";
import {defaultStr,isObj} from "$cutils";
import {DEFAULT_COLUMN_WIDTH} from "./utils";
import Label from "$ecomponents/Label";
import HeaderCell from "./Header/Cell";
import { StyleSheet } from "react-native";
import styles from "./styles";
import theme from "$theme";

export const usePrepareColumns = ({columns,sortedColumn,forceRender,testID,renderFooterCell,renderHeaderCell,renderFilterCell,columnsWidths,headerCellContainerProps,colsWidths,columnProps,footers,footerCellContainerProps,filterCellContainerProps})=>{
   return useMemo(()=>{
        testID = defaultStr(testID,"RN_TableColumns")
        const cols = {},headers = {},footers = {},filters = {},visibleColsNames = [],columnsVisibilities=[],columnsNames = [];
        let hasFooters = false;
        columnProps = defaultObj(columnProps);
        let columnIndex = 0;
        const widths = defaultObj(columnsWidths,colsWidths);
        headerCellContainerProps = defaultObj(headerCellContainerProps);
        footerCellContainerProps = defaultObj(footerCellContainerProps);
        filterCellContainerProps = defaultObj(filterCellContainerProps);
        Object.map(columns,(columnDef,field)=>{
            if(!isObj(columnDef)) return;
            const columnField = defaultStr(columnDef.field,field);
            let {visible,width,type,style} = columnDef;
            visible = typeof visible =='boolean'? visible : true;
            type = defaultStr(type,"text").toLowerCase().trim();
            width = defaultDecimal(widths[columnField],width,DEFAULT_COLUMN_WIDTH);
            const colArgs = {width,type,columnDef,containerProps:{},columnField,index:columnIndex,columnIndex};
            const content = typeof renderHeaderCell =='function'? renderHeaderCell(colArgs) : defaultVal(columnDef.text,columnDef.label,columnField);
            const hContainerProps = defaultObj(colArgs.containerProps);
            if(!React.isValidElement(content,true)){
                console.error(content," is not valid element of header ",columnDef," it could not be render on table");
                return null;
            }
            const rArgs = {columnDef,width};
            headers[columnField] = <HeaderCell {...rArgs} testID={testID+"_HeaderCell_"+columnField} {...headerCellContainerProps} {...hContainerProps} key={columnField} style={[styles.headerItem,styles.headerItemOrCell,headerCellContainerProps.style,hContainerProps.style,style]}>
                <Label splitText numberOfLines={1} style={[theme.styles.w100,theme.styles.h100,{maxHeight:70},width&&{width}]} textBold primary>{content}</Label>
            </HeaderCell>;
            if(typeof renderFilterCell =='function'){
                const filterCell = renderFilterCell(colArgs);
                filters[columnField] = <HeaderCell {...rArgs} testID={testID+"_Filter_Cell_"+columnField} {...filterCellContainerProps} key={columnField} style={[styles.headerItem,styles.headerItemOrCell,styles.filterCell,filterCellContainerProps.style,styles.cell,style]}>
                    {React.isValidElement(filterCell)? filterCell : null}
                </HeaderCell>
            }
            if(typeof renderFooterCell ==='function') {
                const footerProps = {...colArgs,containerProps:{}};
                let cellFooter = renderFooterCell(footerProps);
                let fContainerProps = {};
                if(!React.isValidElement(cellFooter,true) && isObj(cellFooter)){
                    fContainerProps = isObj(cellFooter.containerProps)? cellFooter.containerProps : {};
                    cellFooter = React.isValidElement(cellFooter.children)? cellFooter.children : React.isValidElement(cellFooter.content)? cellFooter.content : null;
                } else if(isObj(footerProps.containerProps)){
                    fContainerProps = footerProps.containerProps;
                }
                cellFooter = React.isValidElement(cellFooter,true)? cellFooter : null;
                if(!hasFooters && cellFooter){
                    hasFooters = true;
                }
                footers[columnField] = <HeaderCell {...rArgs} testID={testID+"_Footer_Cell_"+columnField}  key={columnField} style={[styles.headerItem,styles.headerItemOrCell,footerCellContainerProps.style,style]}>
                    <Label primary children={cellFooter}/>
                </HeaderCell>
          }
          columnsVisibilities.push(visible);
          if(visible){
            visibleColsNames.push(columnField);
          }
          columnsNames.push(columnField);
          cols[columnField] = {
            ...columnDef,
            width,
            index : columnIndex,
            field : columnField,
            visible,
            columnField,
          };
          columnIndex++;
        });
        return {columns:cols,columnsNames,headers,columnsVisibilities,visibleColsNames,hasFooters,footers,filters};
      },[columns,sortedColumn,footers,forceRender]);
}

export const TableContext = createContext(null);

export const useTable = ()=> useContext(TableContext);