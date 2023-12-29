import {TableData} from "../Common";
import {defaultObj,defaultArray,defaultStr,defaultDecimal,isNonNullString} from "$cutils";
import View from "$ecomponents/View";
import { StyleSheet,Dimensions,Pressable } from "react-native";
import Icon,{MENU_ICON} from "$ecomponents/Icon";
import React from "$react";
import {Menu as BottomSheetMenu} from "$ecomponents/BottomSheet";
import { chartTypes } from "../Common/Common";
import theme from "$theme";
import FiltersAccordionComponent from "../Accordion/Filters";

export default class DatagridDashboard extends TableData {
    constructor(props){
        super(props);
        Object.map(this.displayTypes,(t,i)=>{
            if(!t || !t.isChart) delete this.displayTypes[i];
        });
        if(!this.state.displayType.toLowerCase().contains("chart")){
            this.state.displayType = chartTypes[Object.keys(chartTypes)[0]].code
        }
        this.persistDisplayType(this.state.displayType);
     }
    isDatagrid(){
        return true;
    }
    canPaginateData(){
        return false;
    }
    bindResizeEvents(){
        return false;
    }
    isDashboard(){
        return true;
    }
    renderMenu(){
        const testID = this.getTestID();
        const {filterOrOperator,filterAndOperator,} = this.props;
        const {
            columnsVisibilities,
            filteredColumns,
            filters :headerFilters,
        } = this.preparedColumns;
        const menus = [
            {
                text : 'Rafraichir',
                icon : "refresh",
                onPress : this.refresh.bind(this)
            },
            this.isFilterable() ?<FiltersAccordionComponent
                testID={testID+"_HeaderFilters"}
                isLoading = {this.isLoading()}
                filters = {headerFilters}
                visibleColumns = {columnsVisibilities}
                filteredColumns = {filteredColumns}
                orOperator = {filterOrOperator}
                andOperator = {filterAndOperator}
                context = {this}
                label = {"Filtres"}
            /> : null,
            ...this.renderCustomMenu(),
            this.renderDisplayTypes(),
            this.renderSectionListMenu(),
            this.renderAggregatorFunctionsMenu(),
        ]
        return menus;
    }
    getTestID(){
        return defaultStr(this.props.testID,"RN_DatagridDashboard");
    }
    canHandleQueryLimit(){
        return false;
    }
    render(){
        let {
            title,
            testID,actions,
            selectableMultiple,
            sortable,
            titleProps,
            autoSort,
            exportable,
            selectable,pagin,showPagination,
            sessionName,onMount,onUnmount,onFetchData,dataSourceSelector,
            queryLimit,
            filters,
            filterOrOperator,
            filterAndOperator,
            chartContainerProps,
            accordion, //pour le rendu du header en accordion
            ...rest
        } = this.props;
        const canRenderChart = this.canRenderChart();
        if(!canRenderChart) return null;
        chartContainerProps = defaultObj(chartContainerProps);
        titleProps = Object.assign({},titleProps);
        testID = this.getTestID();
        rest = defaultObj(rest);
        const pointerEvents = this.getPointerEvents();
        const maxHeight = 300;
        return <View {...rest} testID={testID} style={[styles.container,{maxHeight},rest.style]} pointerEvents={pointerEvents}>
            {this.renderTitle()}
            {showPagination ? <View style={[styles.paginationContainer]}>
                <BottomSheetMenu
                    anchor = {(props)=>{
                        return <Icon {...props} title={isMobile?"Actions":"Colonnes"} name={isMobile?MENU_ICON:'view-column'}></Icon>
                    }}
                    closeOnPress = {isMobile?undefined:false}
                    items = {this.renderMenu()}
                />
            </View> : null}
            {<View testID={testID+"_ChartContainer"} {...chartContainerProps} style={[theme.styles.w100,styles.chartContainer,chartContainerProps.style]}>
                {this.renderProgressBar()}
                {this.renderChart()}
            </View>}
        </View>
    }
}

DatagridDashboard.displayName = "DatagridDashboardComponent";

DatagridDashboard.propTypes = {
    ...defaultObj(TableData.propTypes),
}


const styles = StyleSheet.create({
    paginationContainer : {
        flexDirection : 'row',
        width : '100%'
    },
    paginationContent : {
        flex : 1,
        flexDirection : 'row',
        width : '100%',
        justifyContent : 'flex-end',
        alignItems : 'center',
        paddingHorizontal : 10,
    },
    container : {
        width : '100%',
        //flex:1,
    },
    chartContainer : {
        //minHeight : 200,
    }
})