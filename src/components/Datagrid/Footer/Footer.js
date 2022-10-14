import Button from "$ecomponents/Button";
import Menu from "$ecomponents/BottomSheet/Menu";
import View from "$ecomponents/View";
import {Pressable,StyleSheet} from "react-native";
import Label from "$ecomponents/Label";
import {defaultVal} from "$utils";
import React from "$react";
import theme from "$theme"

let methods = {
    sum : "Somme",
    average : "Moyenne",
    min : "Minimum",
    max : 'Maximum',
    count : "Nombre",
}
const formatValue = ({value,format,method})=>{
    return (format === 'money' && method != 'count')? value.formatMoney():value.formatNumber();
}
export default function DGGridFooterValue (props){
    let {label,text,displayLabel,style,format} = props;
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
        items = {menuItems}
        style = {{minWidth:220}}
        title = {'Totaux de la colonne '+(defLabel?("[ "+defLabel+"]"):'')}
        animateOnClose
        anchor = {(p)=>{
            return <Pressable {...p} style={[styles.anchor,style,label?styles.row:null]} title={title}>
                {label ?
                    <>
                        <View><Label style={[styles.label]}>{label}</Label></View>
                        <View><Label style = {styles.label}> : </Label></View>
                    </>
                : null}
                <Label primary style={[styles.value]}>
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
    anchor : {
        paddingVertical : 10,
        marginHorizontal : 10,
        paddingHorizontal : 5,
    },
    value : {
        fontWeight : 'bold'
    }
})