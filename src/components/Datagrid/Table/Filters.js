import React from "$react";
import View from "$ecomponents/View";
import {defaultStr,defaultBool,defaultArray,isObj} from "$cutils";
import theme from "$theme";
import { StyleSheet,ScrollView } from "react-native";
import Label from "$ecomponents/Label";
import Filter from "./Filter";
import FiltersMenu from "./FiltersMenu";
import FilterMenu from "./FilterMenu";
import {useDatagrid} from "./hooks";

export default function DatagridTableFiltersComponent({orOperator,andOperator,testID}){
    testID = defaultStr(testID,"RN_DatagridTableFiltersComponent")
    const {visible,isLoading,visibleColumnsNames,filters,filteredColumns,context} = useDatagrid();
    const valuesRefs = React.useRef({});
    const filteredRef = React.useRef({});
    const {content,colMenus} = React.useStableMemo(()=>{
        const content = [];
        Object.map(filters,(filter,index)=>{
            if(isObj(filter)){ 
                const {onChange,filter:isFiltered,...rest} = filter;
                if(isFiltered === false) return null;
                const key = defaultStr(filter.key,filter.field,filter.columnField,filter.index,index+"");
                content.push(<Filter
                    {...rest}
                    {...(isObj(valuesRefs.current[key]) ? valuesRefs.current[key] : {})}
                    dynamicRendered
                    orOperator = {defaultBool(orOperator,filter.orOperator,true)}
                    andOperator = {defaultBool(andOperator,filter.andOperator,true)}
                    onChange = {(arg)=>{
                        if(!arg.action && !arg.operator || !arg.field) return;
                        const canHandle = canHandleFilter(arg);
                        valuesRefs.current[key] = arg;
                        if(filteredRef.current[key] !== canHandle){
                            if(canHandle){
                                canHandlerFilterRef.current++;
                            } else {
                                canHandlerFilterRef.current = Math.max(0,canHandlerFilterRef.current-1);
                            }
                        }
                        filteredRef.current[key] = canHandle;
                        if(onChange){
                            onChange(arg);
                        }
                    }}
                />)
            }
        })
        return {content};
    },[filters])
    return <ScrollView horizontal testID={testID+"_FiltersScrollView"}>
        <View testID={testID} style = {[theme.styles.row,styles.container,theme.styles.rowWrap,theme.styles.justifyStart,theme.styles.alignItemsCenter]}>
            {<FiltersMenu/>}
            {content}
        </View>
    </ScrollView>
}

const styles = StyleSheet.create({
    hidden : {
        opacity : 0,
        display : "none",
    },
    container : {
        paddingLeft : 10,
        paddingRight : 10,
    },
    isLoading : {
        pointerEvents : "none",
    },
});