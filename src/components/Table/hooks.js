import {useMemo,useRef,useStableMemo} from "$react";
import {defaultStr,isObj} from "$cutils";
import {DEFAULT_COLUMN_WIDTH} from "./utils";

export const usePrepareColumns = ({columns,testID,columnsWidths,headerCellContainerProps,colsWidths:cColsWidths,columnProps,footerCellContainerProps,filterCellContainerProps})=>{
   const filtersValuesRef = useRef({});
   return useMemo(()=>{
        testID = defaultStr(testID,"RN_TableColumns")
        const cols = {},visibleColsNames = [],columnsVisibilities=[],columnsNames = [],colsWidths={};
        columnProps = defaultObj(columnProps);
        //const colsNames=[];
        let columnIndex = 0;
        const widths = defaultObj(columnsWidths,cColsWidths);
        headerCellContainerProps = defaultObj(headerCellContainerProps);
        footerCellContainerProps = defaultObj(footerCellContainerProps);
        filterCellContainerProps = defaultObj(filterCellContainerProps);
        let totalWidths = 0;
        Object.map(columns,(columnDef,field)=>{
            if(!isObj(columnDef)) return;
            const columnField = defaultStr(columnDef.field,field);
            let {visible,width,type} = columnDef;
            visible = typeof visible =='boolean'? visible : true;
            type = defaultStr(type,"text").toLowerCase().trim();
            width = colsWidths[columnField] = defaultDecimal(widths[columnField],width,DEFAULT_COLUMN_WIDTH);
            totalWidths+=width;
            columnsVisibilities.push(visible);
            //colsNames.push(columnField);
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
        return {columns:cols,columnsNames,filtersValues:filtersValuesRef.current,colsWidths,columnsVisibilities,totalWidths,totalColsWidths:totalWidths,visibleColsNamesStr:visibleColsNames.join(","),visibleColsNames};
      },[columns]);
}
import useTable from "./useTable";

export const useGetColumnProps = ({columnField,isFilter,isFooter})=>{
  const {renderFilterCell,renderFooterCell,filtersValues,renderHeaderCell,sortedColumn,columns,filterCellContainerProps,footerCellContainerProps,headerCellContainerProps,testID,colsWidths} = useTable();
  const columnDef = columns[columnField];
  const props = isFilter ? {
    containerProps : defaultObj(filterCellContainerProps),
    render : renderFilterCell,
  } : isFooter ? {
    containerProps : defaultObj(footerCellContainerProps),
    render : renderFooterCell,
  } : {
    containerProps : defaultObj(headerCellContainerProps),
    render : renderHeaderCell
  }
  props.width = colsWidths[columnField];
  props.columnField = columnField;
  props.columnDef = columnDef;
  props.type = defaultStr(columnDef?.type,"text").toLowerCase().trim();
  props.sortedColumn = sortedColumn;
  props.testID = `${testID}-HeaderCell${isFilter?"Filter":isFooter?"Footer":"Header"}_${columnField}`;
  if(isFilter){
    props.onValidate = ({action,defaultValue,operator})=>{
      filtersValues[columnField] = {action,defaultValue,operator};
    }
    Object.map(filtersValues[columnField],(v,i)=>{
      props[i] = v;
    });
  }
  return props;
}

export {useTable};

export * from "./useTable";