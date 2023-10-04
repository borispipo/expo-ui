import Menu from "$ecomponents/BottomSheet/Menu";
import View from "$ecomponents/View";
import {Pressable,StyleSheet} from "react-native";
import Label from "$ecomponents/Label";
import {defaultVal,defaultObj,isNonNullString,isObj} from "$cutils";
import React from "$react";
import theme from "$theme"
import appConfig from "$capp/config";

/*** les fonction d'aggreations */
export const aggregatorFunctions = {
    sum : {
        code : "sum",
        label : "Somme",
        eval : ({value,total,count})=>{
            value = typeof value =='number'?value : 0;
            total = typeof total =='number'? total : 0;
            return value+total;
        }
    },
    min : {
        code : "min",
        label : "Minimum",
        eval : ({value,total,count})=>{
            value = typeof value =='number'?value : 0;
            total = typeof total =='number'? total : 0;
            return Math.min(value,total);
        },
    },
    max : {
        code : "max",
        label: 'Maximum',
        eval : ({value,total,count})=>{
            value = typeof value =='number'?value : 0;
            total = typeof total =='number'? total : 0;
            return Math.max(value,total);
        },
    },
    count : {
        code : "count",
        label : "Nombre",
        eval : ({value,total,count})=>{
            return (typeof count =='number'? count : 0)+1;
        }
    },
    average : {
        code : "average",
        label : "Moyenne",
        eval : ({count,sum})=>{
            return typeof count =='number' && count > 0 && typeof sum =='number'? sum/count : 0;
        }
    },
}
/**** 
 * Vérifie si la fonction d'aggregation est valide
*/
export const isValidAggregator = (aggregatorFunctionObject)=>{
    return isObj(aggregatorFunctionObject) && isNonNullString(aggregatorFunctionObject.code) && typeof aggregatorFunctionObject.eval =='function' && true || false;
}
/*** permet d'étendre les fonction d'aggregations 
 * @param {object|Array} liste des functions d'aggregation supplémentaires, de la forme 
 *  {
 *      code {string} le code de la fonction d'aggrégation
 *      label {string} le libele
 *      eval {function} la function a utiiser pour évaluer la données via l'aggregator

 * }
*/
export function extendAggreagatorFunctions(aFunctions){
    const r = {...aggregatorFunctions};
    loopForAggregator(appConfig.get("datagridAggregatorFunctions"),r);
    loopForAggregator(aFunctions,r);
    return r;
}
const loopForAggregator = (aggregatorFunctions,result)=>{
    result = defaultObj(result);
    Object.map(aggregatorFunctions,(aggregatorObj,key)=>{
        if(!isValidAggregator(aggregatorObj)) return null;
        result[aggregatorObj.code] = aggregatorObj;
    });
}
const formatValue = ({value,format,abreviate,aggregatorFunction})=>{
    if((format === 'money' && aggregatorFunction != 'count')){
        if(abreviate){
            return value.abreviate2FormatMoney();
        }
        return value.formatMoney();
    }
    return abreviate? value.abreviate():value.formatNumber();
}
export default function DGGridFooterValue ({label,text,displayLabel,isFooterCell,withLabel,abreviate,style,aggregatorFunctions,aggregatorFunction,format,testID,anchorProps,...props}){
    aggregatorFunctions = defaultObj(aggregatorFunctions);
    anchorProps = defaultObj(anchorProps);
    testID = defaultStr(testID,"RN_DatagridFooterComponent");
    label = defaultVal(label,text);
    const defLabel = label;
    if(displayLabel !== false && withLabel !== false){
        if(!label || !React.isValidElement(label,true)) return null;
    } else label = undefined;
    const [active,setActive] = React.useState(isNonNullString(aggregatorFunction) && aggregatorFunction in aggregatorFunctions ? aggregatorFunction : aggregatorFunctions[Object.keys(aggregatorFunctions)[0]]?.code)
    React.useEffect(()=>{
        if(aggregatorFunction !== active && isNonNullString(aggregatorFunction) && aggregatorFunction in aggregatorFunctions){
            setActive(aggregatorFunction)
        }
    },[aggregatorFunction])
    let title = "";
    let menuItems = []
    const activeStyle = {color:theme.colors.primaryOnSurface};
    for(let aggregatorFunction in aggregatorFunctions){
        let val = defaultDecimal(props[aggregatorFunction]);
        if(isDecimal(val)){
            let fText = formatValue({value:val,format,abreviate,aggregatorFunction});
            const mText = defaultStr(aggregatorFunctions[aggregatorFunction].label,aggregatorFunctions[aggregatorFunction].code,aggregatorFunction);
            title +=(title? ", ":"")+mText +" : "+fText
            menuItems.push({
                text : mText + " : "+fText,
                icon : active == aggregatorFunction ? "check" : null,
                style : [{paddingHorizontal:0},active ===aggregatorFunction ?activeStyle:null],
                onPress : (e)=>{
                    React.stopEventPropagation(e);
                    setActive(aggregatorFunction)
                }
            })
        }
    }
    return  <Menu 
        testID = {testID+"_Menu"}
        items = {menuItems}
        title = {'Totaux de la colonne '+(defLabel?("[ "+defLabel+"]"):'')}
        animateOnClose
        anchor = {(p)=>{
            return <Pressable {...anchorProps} {...p} testID={testID} style={[styles.anchor,anchorProps.style,label?styles.row:null]} title={title}>
                {label ?
                    <>
                        <View testID={testID+"_Label"}><Label fontSize={15} textBold style={[styles.label]}>{label}</Label></View>
                        <View testID={testID+"_LabelPoint"}><Label style = {styles.label}> : </Label></View>
                    </>
                : null}
                <Label testID={testID+"_LabelContent"} primary style={[styles.value]}>
                    {formatValue({value:defaultDecimal(props[active]),abreviate,aggregatorFunction:active,format})}
                </Label>
            </Pressable>
        }}
    />
}

const styles = StyleSheet.create({
    row : {
        flexDirection : 'row',
        alignItems : 'center',
    },
    anchor : {},
    value : {
        fontWeight : 'bold'
    }
})