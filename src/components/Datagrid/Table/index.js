import CommonDatagrid,{TableData as CommonDatagridTableData} from "../Common";
import {defaultObj,defaultArray,defaultStr,defaultDecimal,isNonNullString} from "$utils";
import View from "$ecomponents/View";
import { StyleSheet,Dimensions,Pressable } from "react-native";
import ScrollView  from "$ecomponents/ScrollView";
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
import Table from "$ecomponents/Table";


const DatagridFactory = (Factory)=>{
    Factory = Factory || CommonDatagrid;
    const clx = class DGridAccordionRenderingCls extends Factory {
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
        onResizePage(){
            this.updateLayout();
        }
        renderFilter(props,headerFilters){
            headerFilters.push(props);
        }
        renderFooterCell(props){
            const {columnField,style} = props;
            let footersValues = this.getFooterValues();
            const footerFields = this.getFootersFields();
            if(isObj(footerFields[columnField])){
                return <Footer
                    {...defaultObj(footersValues[columnField])}
                    abreviate = {this.state.abreviateValues}
                    displayLabel = {false}
                    style = {[style]}
                    aggregatorFunction = {this.getActiveAggregatorFunction().code}   
                    aggregatorFunctions = {this.aggregatorFunctions}                               
                />
            }
            return null;
        }
        renderFilterCell(props){
            const {columnField,style} = props;
            const filterC = this.currentFilteringColumns[columnField];
            if(isObj(filterC)){
                return <Filter 
                    {...filterC}
                    withLabel = {false}
                    style = {[styles.filter,theme.styles.pv0,theme.styles.mv0]}
                    anchorProps  ={{size:20}}
                    mode = "flat"
                    inputProps = {{
                        style : [styles.filter],
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
                sessionName,onMount,onUnmount,onFetchData,dataSourceSelector,dataSourceSelectorProps,queryLimit,
                filters,
                chartContainerProps,
                accordion, //pour le rendu du header en accordion
                ...rest
            } = this.props;
            const canRenderChart = this.canRenderChart();
            chartContainerProps = defaultObj(chartContainerProps);
            testID = this.getTestID();
            rest = defaultObj(rest);
            let showDataSourceSelector = false;
            if(dataSourceSelector === true){
                showDataSourceSelector = true;
            }  else if(dataSourceSelector ===false){
                showDataSourceSelector = false;
            }
            dataSourceSelectorProps = defaultObj(dataSourceSelectorProps);
            let _dataSourceSelector = undefined;/* showDataSourceSelector ? <div>
                <DBSelector 
                    {...dataSourceSelectorProps}
                    onChange = {this.onChangeDatabases.bind(this)}
                />
            </div> : null;*/
            if(!title){
                title = _dataSourceSelector;
                _dataSourceSelector = null;
            }
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
            const {visibleColumns} = this.preparedColumns;
            const hasFootersFields = this.hasFootersFields();
            const {columnsWidths:widths} = this.state;
            const showFooters = this.canShowFooters(), showFilters = this.canShowFilters();
            const isLoading = this.isLoading();
            let _progressBar = this.getProgressBar();
            const pointerEvents = this.getPointerEvents(); 

            let restItems = [...this.renderCustomMenu()];
            let max = this.getMaxSelectableRows();
            if(selectableMultiple && max){
                max = max.formatNumber();
                restItems = [
                    ...(selectableMultiple && !canRenderChart ? [{
                        label : "Sélectionner "+max.formatNumber(),
                        icon : "select-all",
                        onPress : (x,event)=>{
                            this.handleAllRowsToggle(true);
                        }
                    },
                    {
                        label : "Tout désélectionner",
                        onPress : (x,event)=>{
                            this.handleAllRowsToggle(false);
                        },
                        icon : "select"
                    }] : [])
                ]
            }   
            const {width,height:winheight} = Dimensions.get("window");
            const {layout} = this.state;
            let maxHeight = winheight-100;
            if(layout && typeof layout.windowHeight =='number' && layout.windowHeight){
                const diff = winheight - Math.max(defaultNumber(layout.y,layout.top),100);
                if(winheight<=350){
                    maxHeight = 350;
                } else {
                    maxHeight = diff;
                }
            }
            const rPagination = showPagination ? <View style={[styles.paginationContainer]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={!isLoading} style={styles.paginationContainerStyle} contentContainerStyle={styles.minW100}>
                    <View style={[styles.paginationContent]}>
                        <View testID={testID+"_HeaderQueryLimit"}>
                            {this.renderQueryLimit(this.getStateDataSize().formatNumber())}
                        </View>
                        {this.renderCustomPagination()}
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
                        {exportable && (
                            <>{/**
                             * <ExportTable 
                                        {...exportTableProps}
                                        selector = {this.datagridDomId}
                                        ref = {(el)=>{
                                            if(el){
                                                this.exportDataInstance = el;
                                            }
                                        }}
                                        getAllData = {()=>{
                                            return this.INITIAL_STATE.data;
                                        }}
                                    />
                            * 
                            */}</>
                        )}
                        <BottomSheetMenu
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
                                ...(selectableMultiple ? restItems : [])
                            ] : visibleColumns}
                        
                        />
                        {this.renderSectionListMenu()}
                        {this.renderDisplayTypes()}
                        {this.renderAggregatorFunctionsMenu()}
                        <View pointerEvents={pointerEvents} testID={testID+"_HeaderPagination"} style = {styles.paginationItem}>
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
                        </View>
                        {/*filters !== false && <td  className="datagrid-local-filter-wrapper" ><LocalFilter title = {this.props.title} fields ={this.state.columns} onChange={this.onLocalFiltersChange.bind(this)}/></td>*/}
                        {!canRenderChart && <RenderType/> || null}
                    </View>
                </ScrollView>
            </View> : null;
            return <View style={[styles.container,{maxHeight}]} pointerEvents={pointerEvents}>
                <View ref={this.layoutRef}>
                    {this.props.showActions !== false ? <DatagridActions 
                        pointerEvents = {pointerEvents}
                        title = {title}
                        context = {this}
                        selectedRows = {Object.assign({},this.selectedRows)}
                        selectedRowsActions = {this.renderSelectedRowsActions.bind(this)}
                        actions = {actions}
                    /> : null}
                    {rPagination}
                    {_progressBar}  
                </View>
                {<Table
                    renderListContent = {canRenderChart? false:true}
                    ref = {this.listRef}
                    {...rest}
                    onLayout = {(args)=>{
                        if(rest.onLayout){
                            rest.onLayout(args);
                        }
                        this.updateLayout(args);
                    }}
                    children = {canRenderChart ? <View testID={testID+"_ChartContainer"} {...chartContainerProps} style={[theme.styles.w100,chartContainerProps.style]}>
                        {this.renderChart()}
                    </View> : null}
                    getItemType = {this.getFlashListItemType.bind(this)}
                    renderItem = {this.renderFlashListItem.bind(this)}
                    hasFooters = {hasFootersFields && !canRenderChart ? true : false}
                    showFilters = {showFilters}
                    showFooters = {showFooters && !canRenderChart ? true : false}
                    showHeaders = { canRenderChart ? !!showFilters : true}
                    headerContainerProps = {{}}
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
                    renderHeaderCell={this.renderHeaderCell.bind(this)}
                    renderFilterCell={this.renderFilterCell.bind(this)}
                    renderFooterCell={this.renderFooterCell.bind(this)}
                    renderEmpty = {this.renderEmpty.bind(this)}
                />}
            </View>
        }
    }
    clx.propTypes = {
        ...defaultObj(Table.propTypes),
        ...defaultObj(Factory.propTypes),
    };
    return clx;
}

const DatagridRealTable  = DatagridFactory();

DatagridRealTable.displayName = "DatagridRealTableComponent";

export default DatagridRealTable;

export const TableData = DatagridFactory(CommonDatagridTableData);

TableData.displayName = "DatagridTableDataRealTable";


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
        maxHeight : 40,
        height : 40,
        width : "100%",
        alignSelf : 'flex-start',
        flexGrow : 1,
        minHeight : 40,
        backgroundColor : 'transparent'
    },
    layoutContent : {
        maxWidth : '100%',
        position : 'relative',
    }
})