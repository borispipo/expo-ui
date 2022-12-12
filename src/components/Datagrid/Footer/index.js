import _Footer from "./Footer";
import View from "$ecomponents/View";
import React from "$react";
import memoize from "$react/memoize";
export {default as FooterItem} from "./Footer";

export const evalSingleValue = ({data,columnDef,field,result,result2,displayLabel,onlyVisible})=>{
    result = defaultObj(result)
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
    if(!isObj(result[field])){
        let label = defaultStr(columnDef.label,columnDef.text);
        if(!label && displayLabel !== false) return result;
        result[field] = {
            label,
            visible : columnDef.visible,
            format : defaultStr(columnDef.format).toLowerCase()
        }
    }
    let obj = result[field];
    val = parseFloat(val.toFixed(10));
    obj.max = isDecimal(obj.max) ? Math.max(obj.max,val) : val;
    obj.min = isDecimal(obj.min) ? Math.min(obj.min,val) : val;
    obj.count = isDecimal(obj.count) ? (obj.count = obj.count +1) : 1;
    obj.sum = isDecimal(obj.sum) ? (parseFloat((obj.sum+val).toFixed(10))) : val;
    obj.average = obj.sum / obj.count;
    if(isObj(result2)){
        result2[field] = defaultObj(result2[field]);
    }
    return result;
}
export const evalValues = memoize(({data,columns,onlyVisible,displayLabel})=>{
    let result = {};
    Object.map(data,(rowData,i)=>{
        if(!isObj(rowData)) return result;
        Object.map(columns,(columnDef,field)=>{
            result = evalSingleValue({data:rowData,columnDef,field,result,displayLabel,onlyVisible})
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