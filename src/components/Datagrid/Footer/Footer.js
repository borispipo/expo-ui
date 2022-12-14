import Button from "$ecomponents/Button";
import Menu from "$ecomponents/BottomSheet/Menu";
import View from "$ecomponents/View";
import {Pressable,StyleSheet} from "react-native";
import Label from "$ecomponents/Label";
import {defaultVal,defaultObj} from "$utils";
import React from "$react";
import theme from "$theme"

let methods = {
    sum : "Somme",
    average : "Moyenne",
    min : "Minimum",
    max : 'Maximum',
    count : "Nombre",
}
/*** les fonction d'aggreations */
export const aggregatorFunctions = {
    sum : {
        code : "sum",
        label : "Somme",
        eval : (current,prev,count)=>{
            current = typeof current =='number'?current : 0;
            prev = typeof prev =='number'? prev : 0;
            return current+prev;
        }
    },
    /*average : {
        code : "average",
        label : "Moyenne",
        eval : ()=>{

        }
    },*/
    min : {
        code : "min",
        label : "Minimum",
        eval : (current,prev,count)=>{
            current = typeof current =='number'?current : 0;
            prev = typeof prev =='number'? prev : 0;
            return Math.min(current,prev);
        },
    },
    max : {
        code : "max",
        label: 'Maximum',
        eval : (current,prev,count)=>{
            current = typeof current =='number'?current : 0;
            prev = typeof prev =='number'? prev : 0;
            return Math.max(current,prev);
        },
    },
    count : {
        code : "count",
        label : "Nombre",
        eval : (current,prev,count)=>{
            return (typeof count =='number'? count : 0)+1;
        }
    },
}
const formatValue = ({value,format,method})=>{
    return (format === 'money' && method != 'count')? value.formatMoney():value.formatNumber();
}
export default function DGGridFooterValue (props){
    let {label,text,displayLabel,style,format,testID,anchorProps} = props;
    anchorProps = defaultObj(anchorProps);
    testID = defaultStr(testID,"RN_DatagridFooterComponent");
    label = defaultVal(label,text);
    const defLabel = label;
    if(displayLabel !== false){
        if(!label || !React.isValidElement(label,true)) return null;
    } else label = undefined;
    const [active,setActive] = React.useState(isNonNullString(props.method) && props.method in methods ? props.method : "sum")
    React.useEffect(()=>{
        if(isNonNullString(props.method) && props.method in methods){
            setActive(props.method)
        }
    },[props.method])
    let title = "";
    let menuItems = []
    const activeStyle = {color:theme.colors.primaryOnSurface};
    for(let method in methods){
        let val = defaultDecimal(props[method]);
        if(isDecimal(val)){
            let fText = formatValue({value:val,format,method});
            title +=(title? ", ":"")+methods[method]+" : "+fText
            menuItems.push({
                text : methods[method] + " : "+fText,
                icon : active == method ? "check" : null,
                style : [{paddingHorizontal:0},active ===method ?activeStyle:null],
                onPress : (e)=>{
                    React.stopEventPropagation(e);
                    setActive(method)
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
                        <View testID={testID+"_Label"}><Label style={[styles.label]}>{label}</Label></View>
                        <View testID={testID+"_LabelPoint"}><Label style = {styles.label}> : </Label></View>
                    </>
                : null}
                <Label testID={testID+"_LabelContent"} primary style={[styles.value]}>
                    {formatValue({value:defaultDecimal(props[active]),method:active,format})}
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