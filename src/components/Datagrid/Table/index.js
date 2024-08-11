import Datagrid from "../Common";
import {defaultObj,defaultArray,defaultStr,defaultDecimal,isNonNullString} from "$cutils";
import View from "$ecomponents/View";
import { StyleSheet,Dimensions,Pressable ,ScrollView} from "react-native";
import {isMobileOrTabletMedia} from "$cplatform/dimensions";
import DatagridActions from "../Actions";
import {SELECTABLE_COLUMN_WIDTH,getRowStyle} from "../utils";
import Icon,{MENU_ICON} from "$ecomponents/Icon";
import Button from "$ecomponents/Button";
import Filter from "$ecomponents/Filter";
import React from "$react";
import {Menu as BottomSheetMenu} from "$ecomponents/BottomSheet"
import RenderType from "../RenderType";
import Footer from "../Footer/Footer";
import theme from "$theme";
import Table,{styles as tableStyles} from "$ecomponents/Table";
import DatagridProvider from "../hooks/Provider";

export default class DatagridTableComponent extends Datagrid {
    constructor(props){
        super(props);
        this.listRef = React.createRef(null);
    }
    canHandleColumnResize(){
        return true;
    }
    renderRowCell(args){
        if(args.renderRowCell === false || args.isSectionListHeader === true) return super.renderRowCell(args);
        const {render} = super.renderRowCell(args);
        return render;
    }
    canHandleSelectableColumn(){
        return this.props.selectable !==false ? true : false;
    }
    isDatagrid(){
        return true;
    }
    canPaginateData(){
        return false;
    }
    bindResizeEvents(){
        return true;
    }
    renderFilter(props,headerFilters){
        headerFilters.push(props);
    }
    renderFooterCell(props){
        const {columnField,style} = props;
        const footersValues = this.getFooterValues();
        const footerFields = this.getFootersFields();
        if(isObj(footerFields[columnField])){
            return <Footer
                {...defaultObj(footersValues[columnField])}
                abreviate = {this.state.abreviateValues}
                displayLabel = {false}
                style = {[style]}
                aggregatorFunction = {this.getActiveAggregatorFunction().code}   
                aggregatorFunctions = {this.aggregatorFunctions}   
                isFooterCell
            />
        }
        return null;
    }
    renderFilterCell(props){
        const {columnField,style,...rest} = props;
        const filterC = this.currentFilteringColumns[columnField];
        const rest2 = {};
        ["defaultValue","action","operator"].map((i)=>{
           if(i in rest){
             rest2[i] = rest[i];
           }
        });
        if(isObj(filterC)){
            return <Filter
                {...rest}
                {...filterC}
                {...rest2}
                withLabel = {false}
                style = {[styles.filter,tableStyles.filter,theme.styles.pv0,theme.styles.mv0]}
                anchorProps  ={{size:20}}
                mode = "flat"
                inputProps = {{
                    style : [styles.filter,tableStyles.filter],
                    mode : "flat",
                }}
            />
        }
        return null;
    }
    scrollToEnd(){
        if(!this.canScrollTo()) return;
        if(this.listRef.current && this.listRef.current.scrollToEnd){
            return this.listRef.current.scrollToEnd();
        }
    }
    scrollToLeft(){
        if(!this.canScrollTo()) return;
        if(this.listRef.current && this.listRef.current.scrollToLeft){
            return this.listRef.current.scrollToLeft();
        }
    }
    scrollToTop(opts){
        if(!this.canScrollTo()) return;
        if(this.listRef.current && this.listRef.current.scrollToTop){
            return this.listRef.current.scrollToTop(opts);
        }
    }
    scrollToIndex(index){
        if(!this.canScrollTo()) return;
        index = typeof index =='number'? index : 0;
        if(this.listRef.current && this.listRef.current.scrollToIndex){
            this.listRef.current.scrollToIndex({index});
        }
    }
    
    getTestID(){
        return defaultStr(this.props.testID,"RN_DatagridTable");
    }
    render(){
        let {title,testID,actions,
            selectableMultiple,
            sortable,
            autoSort,
            exportable,
            selectable,pagin,showPagination,
            sessionName,onMount,onUnmount,onFetchData,dataSourceSelector,
            queryLimit,
            filters,
            chartContainerProps,
            accordion, //pour le rendu du header en accordion
            ...rest
        } = this.props;
        const canRenderChart = this.canRenderChart();
        chartContainerProps = defaultObj(chartContainerProps);
        testID = this.getTestID();
        rest = defaultObj(rest);
        exportable = defaultBool(exportable,true);
        let isMobile = isMobileOrTabletMedia();
        selectable = defaultVal(selectable,true);
        selectableMultiple = this.isSelectableMultiple();
        pagin = defaultVal(pagin,true)
        showPagination = defaultVal(showPagination,true);

        const pagination = defaultObj(this._pagination);
        pagination.rowsPerPageItems = defaultArray(pagination.rowsPerPageItems,this.getDefaultPaginationRowsPerPageItems())
        let countPages = this.countPages.call(this);
        /*let paginationLabel = defaultFunc(pagination.label,({start, last, total}) => `${start}-${last} / ${total}`);
        let pagLast = Math.min(pagination.rows, pagination.start + pagination.limit);

        paginationLabel = paginationLabel({
            start:pagination.start + 1, 
            last:pagLast, 
            total:pagination.rows,pages:countPages
        })*/
        const {visibleColumns,sortedColumn} = this.preparedColumns;
        const hasFootersFields = this.hasFootersFields();
        const {columnsWidths:widths} = this.state;
        const showFooters = this.canShowFooters(), showFilters = this.canShowFilters();
        const pointerEvents = this.getPointerEvents(); 

        const restItems = [...this.renderCustomMenu()];
        let max = this.getMaxSelectableRows();
        if(selectableMultiple && max){
            max = max.formatNumber();
            if(selectableMultiple && !canRenderChart && this.canRenderActions()){
                restItems.push({
                    label : "Sélectionner "+max.formatNumber(),
                    icon : "select-all",
                    onPress : (x,event)=>{
                        this.handleAllRowsToggle(true);
                    }
                });
                restItems.push({
                    label : "Tout désélectionner",
                    onPress : (x,event)=>{
                        this.handleAllRowsToggle(false);
                    },
                    icon : "select"
                });
            }
        }   
        const rPagination = showPagination ? <View style={[styles.paginationContainer]}>
            <ScrollView testID={testID+"_Datagrid_Headers"} horizontal  style={styles.paginationContainerStyle} contentContainerStyle={styles.minW100}>
                <View testID={testID+"_HeaderPaginationContent"} style={[styles.paginationContent]}>
                    {this.renderCustomPagination()}
                    <View testID={testID+"_HeaderQueryLimit"}>
                        {this.renderQueryLimit(this.getStateDataSize().formatNumber())}
                    </View>
                    {!isMobile && <>
                        <Button normal style={[styles.paginationItem]} icon = {"refresh"} onPress = {this.refresh.bind(this)}>
                            Rafraichir
                        </Button>
                        {this.isFilterable() && (
                            <Button
                                normal
                                style={styles.paginationItem}
                                onPress =  {()=>{showFilters?this.hideFilters():this.showFilters()} }   
                                icon = {showFilters?'eye-off':'eye'}
                            >   
                                    {showFilters?'Masquer/Filtres':'Afficher/Filtres'}
                            </Button>
                        )}
                        {hasFootersFields && !canRenderChart ? <Button
                            normal
                            style={styles.paginationItem}
                            onPress =  {()=>{this.toggleFooters(!showFooters)} }   
                            icon = {showFooters?'view-column':'view-module'}
                        >   
                                {showFooters?'Masquer les totaux':'Afficher les totaux'}
                        </Button>:null}
                        {restItems.map((item,index)=>{
                            return <Button 
                                normal
                                key = {index}
                                {...item}
                                style={[styles.paginationItem,item.style]}
                                children = {item.children|| item.label}
                            />
                         })}
                    </>}
                    <BottomSheetMenu
                        testID = {testID+"_BottomSheetMenu"}
                        anchor = {(props)=>{
                            return <Icon {...props} title={isMobile?"Actions":"Colonnes"} name={isMobile?MENU_ICON:'view-column'}></Icon>
                        }}
                        closeOnPress = {isMobile?undefined:false}
                        items = {isMobile ? [
                            isMobile?
                            {
                                text : 'Rafraichir',
                                icon : "refresh",
                                onPress : this.refresh.bind(this)
                            } : null,
                            {
                                text : 'colonnes',
                                icon : "view-column",
                                closeOnPress : false,
                                items : visibleColumns
                            },
                            isMobile && this.isFilterable() ?{
                                onPress :  ()=>{showFilters?this.hideFilters():this.showFilters()}    
                                ,icon :  showFilters?'eye-off':'eye'
                                ,text : (showFilters?'Masquer/Filtres':'Afficher/Filtres')
                            } : null,
                            isMobile && hasFootersFields?{
                                onPress :  ()=>{this.toggleFooters(!showFooters)}    
                                ,icon :  showFooters?'view-column':'view-module'
                                ,text : (showFooters?'Masquer/Ligne des totaux':'Afficher/Ligne des totaux')
                            } : null,
                            ...restItems,
                            //...(selectableMultiple ? restItems : [])
                        ] : visibleColumns}
                    
                    />
                    {this.renderSectionListMenu()}
                    {this.renderDisplayTypes()}
                    {this.renderAggregatorFunctionsMenu()}
                    {this.renderExportableMenu()}
                    {!canRenderChart ? <View pointerEvents={pointerEvents} testID={testID+"_HeaderPagination"} style = {styles.paginationItem}>
                        <BottomSheetMenu
                            testID={testID+"_HeaderMenus"}
                            anchor={(props)=>(<Icon {...props} icon={'axis-z-arrow'}/>)} 
                            items = {[
                                this.canScrollTo() && {
                                    text : 'Retour en haut',
                                    icon : "arrow-up-bold",
                                    onPress : this.scrollToTop.bind(this)
                                },
                                this.canScrollTo() &&{
                                    text : 'Retour A gauche',
                                    icon : "arrow-up-bold",
                                    onPress : this.scrollToLeft.bind(this)
                                },
                                this.canScrollTo() &&{
                                    text : 'Aller à la dernière ligne',
                                    icon : "arrow-down-bold",
                                    onPress : this.scrollToEnd.bind(this)
                                },
                            ]}
                        />
                    </View>:null}
                    {!canRenderChart && <RenderType/> || null}
                </View>
            </ScrollView>
        </View> : null;
        return <DatagridProvider context={this}>
                 <View style={[styles.container,{flex:1}]} testID={testID+"_TableContainer"} pointerEvents={pointerEvents}>
                    <View testID={testID+"_LayoutContainer"}>
                        {this.canRenderActions() ? <DatagridActions 
                            pointerEvents = {pointerEvents}
                            title = {this.renderDataSourceSelector()}
                            actions = {actions}
                        /> : null}
                        {rPagination}
                        {this.renderProgressBar()}  
                    </View>
                    {canRenderChart ?
                        <View testID={testID+"_ChartContainer"} {...chartContainerProps} style={[theme.styles.w100,chartContainerProps.style]}>
                            {this.renderChart()}
                        </View> : 
                    <Table
                        ref = {(el)=>{
                            this.listRef.current = el;
                        }}
                        {...rest}
                        withDatagridContext
                        sortedColumn = {sortedColumn}
                        onRender = {this.onRender.bind(this)}
                        getItemType = {this.getFlashListItemType.bind(this)}
                        renderItem = {this.renderFlashListItem.bind(this)}
                        renderSectionHeader = {this.renderFlashListItem.bind(this)}
                        hasFooters = {hasFootersFields && !canRenderChart ? true : false}
                        showFilters = {showFilters}
                        showFooters = {showFooters && !canRenderChart ? true : false}
                        showHeaders = { canRenderChart ? !!showFilters : true}
                        headerCellContainerProps = {{
                            style : showFilters?{justifyContent:'flex-start'}:null
                        }}
                        isRowSelected = {this.isRowSelected.bind(this)}
                        columns = {this.state.columns}
                        //renderRow={this.renderRow.bind(this)}
                        getRowKey = {this.getRowKey.bind(this)}
                        columnsWidths = {widths}
                        renderCell={this.renderRowCell.bind(this)}
                        rowContainerProps = {(props)=>{
                            return {
                                style : getRowStyle(props,{selected:this.isRowSelected.bind(this)}),
                            }
                        }}
                        data = {this.state.data}
                        footers = {this.getFooterValues()}
                        renderHeaderCell={this.renderHeaderCell.bind(this)}
                        renderFilterCell={this.renderFilterCell.bind(this)}
                        renderFooterCell={this.renderFooterCell.bind(this)}
                        renderEmpty = {this.renderEmpty.bind(this)}
                    />}
                </View>
                
        </DatagridProvider>
    }
}
DatagridTableComponent.propTypes = {
    ...defaultObj(Table.propTypes),
    ...defaultObj(Datagrid.propTypes),
};

const styles = StyleSheet.create({
    paginationContainerStyle : {
        flex :1,
        flexGrow: 1,
        width : '100%',
        paddingHorizontal: 10,
        flexDirection:'row'
    },
    paginationItem : {
        marginHorizontal:5,
    },
    paginationIcon : {
        paddingHorizontal:0,
        marginHorizontal : 0,
    },
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
    hidden : {
        display : 'none',
    },
    scrollView : {
        flex : 1,
    },
    container : {
        width : '100%',
        flex:1,
    },
    selectableColumn : {
        width : SELECTABLE_COLUMN_WIDTH,
        //justifyContent:'center',
        alignItems : 'center',
        paddingVertical : 0,
        marginVertical : 0,
        paddingHorizontal : 0,
        marginHorizontal : 0,
        height : 36,
    },
    header : {
        minHeight : 40
    },
    minW100 : {
        minWidth : '100%',
        paddingRight : 10,
    },
    filter : {
        marginHorizontal:0,
        paddingHorizontal:0,
        width : "100%",
        alignSelf : 'flex-start',
        flexGrow : 1,
        backgroundColor : 'transparent'
    },
    layoutContent : {
        maxWidth : '100%',
        position : 'relative',
    }
})