import _Footer from "./Footer";
import View from "$ecomponents/View";
import React from "$react";
import memoize from "$react/memoize";
export {default as FooterItem} from "./Footer";
import {parseDecimal} from "$utils";

export const evalSingleValue = ({data,columnDef,field,result,withLabel,displayLabel,onlyVisible})=>{
    data = data || {}
    if(!isNonNullString(field) || !isObj(columnDef)) return result;
    onlyVisible = defaultBool(onlyVisible,true);
    if(onlyVisible === true && !(columnDef.visible !== false)) result;
    let val = data[field];
    if(isFunction(columnDef.multiplicater)){
        val = defaultDecimal(columnDef.multiplicater({value:val,columnField:field,field,columnDef,rowData:data,item:data}),val)
    }
    if(!isDecimal(val)){
        return result;
    }
    val = parseDecimal(val.toFixed(10));
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
        obj.max = isDecimal(obj.max) ? Math.max(obj.max,val) : val;
        obj.min = isDecimal(obj.min) ? Math.min(obj.min,val) : val;
        obj.count = isDecimal(obj.count) ? (obj.count = obj.count +1) : 1;
        obj.sum = isDecimal(obj.sum) ? (parseDecimal((obj.sum+val).toFixed(10))) : val;
        obj.average = obj.sum / obj.count;
        return currentResult;
    })
    return result;
}
export const evalValues = memoize(({data,columns,onlyVisible,withLabel,displayLabel})=>{
    let result = {};
    Object.map(data,(rowData,i)=>{
        if(!isObj(rowData)) return result;
        Object.map(columns,(columnDef,field)=>{
            result = evalSingleValue({data:rowData,columnDef,field,result,withLabel,displayLabel,onlyVisible})
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
    let {columns,children,displayLabel,Component,data,onlyVisible,...rest} = props;
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
    let footers = evalValues({data:state.data,columns:state.columns,onlyVisible,displayLabel});
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