import _Footer from "./Footer";
import View from "$ecomponents/View";
import React from "$react";
import memoize from "$react/memoize";
export {default as FooterItem} from "./Footer";
import {parseDecimal,defaultObj,defaultStr,isNonNullString} from "$utils";
import { aggregatorFunctions as mAggregatorFunctions } from "./Footer";
export * from "./Footer";

/***évalue la valeur décimale selon les paramètres */
export const getFooterColumnValue = ({data,columnDef,field,result,columnField}) =>{
    data = defaultObj(data)
    columnDef = defaultObj(columnDef);
    columnField = defaultStr(columnField,columnDef.field,field);
    let val = data[columnField];
    if(typeof columnDef.multiplicater ==='function'){
        val = defaultDecimal(columnDef.multiplicater({value:val,columnField,field,columnDef,rowData:data,item:data}),val)
    }
    return typeof val =='number'? parseDecimal(val.toFixed(12)) : 0;
}

export const evalSingleValue = ({data,columnDef,field,count,columnField,aggregatorFunctions,withLabel,result,displayLabel,onlyVisible})=>{
    if(!isNonNullString(field) || !isObj(columnDef) || !isObj(data)) return result;
    aggregatorFunctions = defaultObj(aggregatorFunctions,mAggregatorFunctions);
    onlyVisible = defaultBool(onlyVisible,true);
    if(onlyVisible === true && !(columnDef.visible !== false)) result;
    let val = getFooterColumnValue({data,columnDef,columnField,result,field});
    (Array.isArray(result) ? result : [result]).map((currentResult)=>{
        currentResult = defaultObj(currentResult);
        if(!isObj(currentResult[field])){
            let label = defaultStr(columnDef.label,columnDef.text);
            if(!label && displayLabel !== false && withLabel !== false) return currentResult;
            currentResult[field] = {
                label,
                visible : columnDef.visible,
                format : defaultStr(columnDef.format).toLowerCase()
            }
        }
        const obj = currentResult[field];
        //obj.max = isDecimal(obj.max) ? Math.max(obj.max,val) : val;
        //obj.min = isDecimal(obj.min) ? Math.min(obj.min,val) : val;
        //obj.count = isDecimal(obj.count) ? obj.count : 0;
        //obj.sum = isDecimal(obj.sum) ? (parseDecimal((obj.sum+val).toFixed(10))) : val;
        Object.map(aggregatorFunctions,(aggegatorFunction,key)=>{
            const code = aggegatorFunction.code;
            obj[code] = aggegatorFunction.eval({columnDef,columnField,data,value : val,count,...obj,total:defaultNumber(obj[code])});
        });
        if(typeof obj.count =='number' && obj.count >0 && typeof obj.sum =='number'){
            obj.average = obj.sum / obj.count;
        }
        return currentResult;
    })
    return result;
}
export const evalValues = memoize(({data,columns,aggregatorFunctions,onlyVisible,withLabel,displayLabel})=>{
    let result = {};
    Object.map(data,(rowData,i)=>{
        if(!isObj(rowData)) return result;
        Object.map(columns,(columnDef,field)=>{
            result = evalSingleValue({data:rowData,aggregatorFunctions,columnDef,field,result,withLabel,displayLabel,onlyVisible})
        })
    })
    return result;
});



/****
 * @param : columns {object} : la liste de toutes les colonnes pouvant être rendu par le footer
 * @param : data {array{object}}: les données à exploiter pour le rendu des footers
 * @param : Component {React.Element|string}
 * @param : children {func}, fonction permettant de générer le contenu du footer
 */
export default function DGGridFooters (props){
    let {columns,children,displayLabel,aggregatorFunctions,Component,data,onlyVisible,...rest} = props;
    rest = defaultObj(rest)
    if(Component === false){
        Component = React.Fragment;
        rest = {};
    } else {
        Component = defaultVal(Component,View)
    }
    const [state,setState] = React.useStateIfMounted({
        columns,
        data,
    })
    React.useEffect(()=>{
        setState({...state,columns:props.columns})
    },[props.columns])
    React.useEffect(()=>{
        setState({...state,data:props.data})
    },[props.data]);
    let footers = evalValues({data:state.data,aggregatorFunctions,columns:state.columns,onlyVisible,displayLabel});
    return <Component {...rest}>
        {children({
            footers,
            columns,
            render:({footer,field,props})=>{
                if(!isObj(footer) || !isNonNullString(field) || !isObj(footers[field])) return null;
                props = defaultObj(props);
                return <_Footer 
                    {...props}
                    key = {field}
                    displayLabel = {displayLabel}
                    {...footer}
                />
            }
        })}
    </Component>
}

export {_Footer as Footer};