import {Checkbox} from "$ecomponents/Icon";
import React from "$react";
import {defaultObj,isObj} from "$cutils";
import PropTypes from "prop-types";
import theme from "$theme";
import {useDatagrid,useIsRowSelected,useIsAllRowsSelected} from "./hooks";

const DatagridCheckboxComponent = React.forwardRef((props,ref)=>{
    const {onChange,rowKey,rowData,row,rowIndex,index,toggleAll,...rest} = props;
    const checked = toggleAll ? useIsAllRowsSelected() : useIsRowSelected(rowKey);
    return <Checkbox
        secondaryOnCheck
        {...rest}
        checked = {checked}
        style = {[rest.style,theme.styles.alignItemsCenter]}
        onChange = {(o)=>{
            if(onChange){
                onChange({...o,row,rowKey,rowData,rowIndex:typeof rowIndex ==='number' ? rowIndex : typeof index =='number'? index : undefined})
            }
        }}
    />
});

DatagridCheckboxComponent.propTypes = {
    rowData : PropTypes.object,
    row : PropTypes.object,
    rowIndex : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    rowsRefs : PropTypes.object,
    rowKey : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ])
}
export default DatagridCheckboxComponent;

DatagridCheckboxComponent.displayName ="DatagridCheckboxComponent";