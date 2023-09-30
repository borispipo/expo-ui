import React from "$react";
import View from "$ecomponents/View";
import Label from "$ecomponents/Label";
import { useDatagrid } from "../hooks";
import styles from "./styles";
import {defaultStr} from "$cutils";
import theme from "$theme";
import Filter from "$ecomponents/Filter";
import { getMenuStyle } from "./styles";

export default function DatagridTableFilterComponent({columnField,visible:cVisible,label,text,testID,...rest}){
    const {context,filteredValues,filteredColumns} = useDatagrid();
    const [visible,setVisible] = React.useState(!!filteredColumns[columnField]);
    testID = defaultStr(testID,"RN_DatagridTableFilterComponent");
    React.useEffect(()=>{
        if(typeof context?.on ==='function'){
            const onToggleVisibility = ({columnField:cField,visible:nVisible})=>{
                if(columnField === cField && visible !== nVisible){
                    setVisible(nVisible);
                }
            }
            context.on("toggleFilterColumnVisibility",onToggleVisibility);
            return ()=>{
                context.off("toggleFilterColumnVisibility",onToggleVisibility);
            }
        }
    },[context]);
    React.useEffect(()=>{
        return ()=>{
        }
    },[])
    const filteredProps = Object.assign({},filteredValues[columnField]);
    if("value" in filteredProps){
        filteredProps.defaultValue = filteredProps.value;
        delete filteredProps.value;
    }
    label = label || text;
    return <View testID={testID+"_DatagridFilterTableContainer"} style={[styles.filter,getMenuStyle(),!visible && styles.hidden]}>
        <View testID={testID+"_DatagridTableFilterContent"} style={[theme.styles.row,theme.styles.alignItemsCenter,theme.styles.justifyContentStart,!visible && styles.hidden]}>
            {React.isValidElement(label,true) ? <Label style={[styles.filterLabel]}>
                {label} 
            </Label>:null}
            <Filter
                {...rest}
                {...filteredProps}
                withLabel={false}
                containerProps = {{
                    style : [styles.filterContainer]
                }}
                testID={testID+"_DatagridFilterComponent_"+columnField}
                anchorProps = {{size:20,style:[theme.styles.noMargin,theme.styles.noPadding]}}
            />
        </View>
    </View>;
}