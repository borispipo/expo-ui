import {Checkbox} from "$ecomponents/Icon";
import React from "$react";
import {defaultObj,isObj} from "$utils";
import PropTypes from "prop-types";
import theme from "$theme";

const DatagridCheckboxComponent = React.forwardRef((props,ref)=>{
    const {onChange,rowKey,rowData,row,rowIndex,index,rowsRefs,...rest} = props;
    return <Checkbox
        secondaryOnCheck
        {...rest}
        style = {[rest.style,theme.styles.alignItemsCenter]}
        ref = {(el)=>{
            React.setRef(ref,el);
            if(isObj(rowsRefs) && rowKey){
                rowsRefs[rowKey] = el;
            }
        }}
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