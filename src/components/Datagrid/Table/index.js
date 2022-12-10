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
            const footerFields = this.getFooterFields();
            if(isObj(footerFields[columnField])){
                return <Footer
                    //{...footerFields[columnField]}
                    {...defaultObj(footersValues[columnField])}
                    displayLabel = {false}
                    style = {[style]}
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
        updateLayout(e){
            if(this.state.fixedTable === false) return;
            return super.updateLayout(e);
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
        render(){
            let {title,testID,actions,selectableMultiple,
                sortable,
                autoSort,
                exportable,
                selectable,pagin,showPagination,
                sessionName,onMount,onUnmount,onFetchData,dataSourceSelector,dataSourceSelectorProps,queryLimit,
                filters,
                accordion, //pour le rendu du header en accordion
                ...rest
            } = this.props;
            testID = defaultStr(testID,'RN_DatagridTableComponent');
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
            selectableMultiple = defaultBool(selectableMultiple,true);
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
            const hasFooterFields = this.hasFooterFields();
            const {columnsWidths:widths,showFilters,showFooters} = this.state;
            let isAllRowsSelected = this.isAllRowsSelected();
            const isLoading = this.isLoading();
            let _progressBar = this.getProgressBar();
            const pointerEvents = isLoading? "none":"auto"; 

            let selectAllRowsToggleTitle = isAllRowsSelected?"Tout Déselec":"Tout Select"
            let restItems = [];
            let max = this.getMaxSelectableRows();
            if(selectableMultiple && max && defaultBool(this.props.selectableMultiple,true)){
                max = max.formatNumber();
                restItems = [
                    ...this.renderCustomMenu(),
                    ...(selectableMultiple ? [{
                        label : "Sélect "+max,
                        icon : "select-all",
                        onPress : (x,event)=>{
                            this.handleAllRowsToggle(true);
                        }
                    },
                    {
                        label : "Tout désélec",
                        onPress : (x,event)=>{
                            this.handleAllRowsToggle(false);
                        },
                        icon : "select"
                    }] : [])
                ]
            }   
            const rPagination = showPagination ? <View style={[styles.paginationContainer]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={!isLoading} style={styles.paginationContainerStyle} contentContainerStyle={styles.minW100}>
                    <View style={[styles.paginationContent]}>
                        <View testID={testID+"_HeaderQueryLimit"}>
                            {this.renderQueryLimit(this.state.data.length.formatNumber())}
                        </View>
                        {this.renderCustomPagination()}
                        {!isMobile && <>
                            <Button normal style={[styles.paginationItem]} icon = {"refresh"} onPress = {this.refresh.bind(this)}>
                                Rafraichir
                            </Button>
                            {filters !== false && (
                                <Button
                                    normal
                                    style={styles.paginationItem}
                                    onPress =  {()=>{showFilters?this.hideFilters():this.showFilters()} }   
                                    icon = {showFilters?'eye-off':'eye'}
                                >   
                                        {showFilters?'Masquer/Filtres':'Afficher/Filtres'}
                                </Button>
                            )}
                            {hasFooterFields ? <Button
                                normal
                                style={styles.paginationItem}
                                onPress =  {()=>{showFooters?this.hideFooter():this.showFooters()} }   
                                icon = {showFooters?'view-column':'view-module'}
                            >   
                                    {showFooters?'Masquer/Ligne des totaux':'Afficher/Ligne des totaux'}
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
                                isMobile && filters !== false?{
                                    onPress :  ()=>{showFilters?this.hideFilters():this.showFilters()}    
                                    ,icon :  showFilters?'eye-off':'eye'
                                    ,text : (showFilters?'Masquer/Filtres':'Afficher/Filtres')
                                } : null,
                                isMobile && hasFooterFields?{
                                    onPress :  ()=>{showFooters?this.hideFooter():this.showFooters()}    
                                    ,icon :  showFooters?'view-column':'view-module'
                                    ,text : (showFooters?'Masquer/Ligne des totaux':'Afficher/Ligne des totaux')
                                } : null,
                                ...(selectableMultiple ? restItems : [])
                            ] : visibleColumns}
                        
                        />
                        <View testID={testID+"_HeaderPagination"} style = {styles.paginationItem}>
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
                        <RenderType/>
                    </View>
                </ScrollView>
            </View> : null;
            return <View style={[styles.container]} pointerEvents={pointerEvents}>
                <View ref={this.layoutRef}>
                    <DatagridActions 
                        pointerEvents = {pointerEvents}
                        title = {title}
                        context = {this}
                        selectedRows = {Object.assign({},this.selectedRows)}
                        selectedRowsActions = {this.renderSelectedRowsActions.bind(this)}
                        actions = {actions}
                    />
                    {rPagination}
                    {_progressBar}  
                </View>
                <Table
                    ref = {this.listRef}
                    {...rest}
                    hasFooters = {hasFooterFields}
                    showFilters = {showFilters}
                    showFooters = {showFooters}
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
                />
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