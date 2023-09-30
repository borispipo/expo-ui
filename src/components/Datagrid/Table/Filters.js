import React from "$react";
import View from "$ecomponents/View";
import {defaultStr,defaultBool,defaultArray,isObj} from "$cutils";
import theme from "$theme";
import { StyleSheet,ScrollView } from "react-native";
import Label from "$ecomponents/Label";
import Filter from "./Filter";
import FiltersMenu from "./FiltersMenu";
import {useDatagrid} from "../hooks";

export default function DatagridTableFiltersComponent({orOperator,andOperator,testID}){
    testID = defaultStr(testID,"RN_DatagridTableFiltersComponent")
    const {context,filteredColumns,filtersByColumnsNames} = useDatagrid();
    const fArray = React.useMemo(()=>Object.keys(filteredColumns).filter(v=>!!filteredColumns[v]),[]);
    const [visibleColumns,setVisibleColumns] = React.useState(fArray);
    React.useEffect(()=>{
        if(typeof context?.on ==='function'){
            const onToggleVisibility = ({columnField,visible})=>{
                const nVisible = visibleColumns.includes(columnField);
                if(nVisible !== visible){
                    const nVisibleColumns = nVisible ? [...visibleColumns].filter((v)=>v !== columnField) : [...visibleColumns,columnField];
                    setVisibleColumns(nVisibleColumns)
                }
            }
            context.on("toggleFilterColumnVisibility",onToggleVisibility);
            return ()=>{
                context.off("toggleFilterColumnVisibility",onToggleVisibility);
            }
        }
    },[context]);
    const content = React.useStableMemo(()=>{
        const content = [];
        visibleColumns.map((columnField)=>{
            if(!columnField || !isObj(filtersByColumnsNames[columnField])) return;
            const filter = filtersByColumnsNames[columnField];
            content.push(<Filter
                {...filter}
                columnField={columnField}
                dynamicRendered={true}
            />)
        });
        return content;
    },[visibleColumns])
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