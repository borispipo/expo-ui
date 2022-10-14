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
        renderHeaderCell(props){
            let ret = super.renderHeaderCell(props);
            const {columnField,columnDef,style} = props;
            if(this.state.showFilters){
                const filterC = this.customFilteredColumns[columnField];
                if(isObj(filterC)){
                    return <View testID={"RN_DatagridTableComponent_HeaderField_"+columnField} style={[style,{minHeight:100}]}>
                        {ret}
                        <Filter 
                            {...filterC}
                            withLabel = {false}
                            style = {[styles.filter,style]}
                            anchorProps  ={{size:20}}
                            inputProps = {{
                                style : [styles.filter,style]
                            }}
                        />
                    </View>
                }
            }
            return ret;
        }
        beforePrepareColumns(){
            this.customFilteredColumns = {};
        }
        prepareColumn({filterProps,columnField,columnDef,key,field,visible,filter},filters){
            this.customFilteredColumns = defaultObj(this.customFilteredColumns);
            if(visible){
                if(filter){
                    this.customFilteredColumns[columnField] = filterProps;
                } else {
                    this.customFilteredColumns[columnField] = null;
                }
            }
            return filters;
        }
        updateLayout(e){
            if(this.state.fixedTable === false) return;
            return super.updateLayout(e);
        }
        scrollToEnd(){
            if(this.listRef.current && this.listRef.current.scrollToEnd){
                return this.listRef.current.scrollToEnd();
            }
        }
        scrollToLeft(){
            if(this.listRef.current && this.listRef.current.scrollToLeft){
                return this.listRef.current.scrollToLeft();
            }
        }
        scrollToTop(opts){
            if(this.listRef.current && this.listRef.current.scrollToTop){
                return this.listRef.current.scrollToTop(opts);
            }
        }
        scrollToIndex(index){
            index = typeof index =='number'? index : 0;
            if(this.listRef.current && this.listRef.current.scrollToIndex){
                this.listRef.current.scrollToIndex({index});
            }
        }
        render(){
            let {title,testID,actions,selectableMultiple,sortable,exportable,
                selectable,pagin,showPagination,
                sessionName,onMount,onUnmount,onFetchData,dbSelector,dbSelectorProps,queryLimit,
                filters,
                accordion, //pour le rendu du header en accordion
                ...rest
            } = this.props;
            testID = defaultStr(testID,'RN_DatagridTableComponent');
            rest = defaultObj(rest);
            let showDBSelector = false;
            if(dbSelector === true){
                showDBSelector = true;
            }  else if(dbSelector ===false){
                showDBSelector = false;
            }
            dbSelectorProps = defaultObj(dbSelectorProps);
            dbSelectorProps = defaultObj(dbSelectorProps);
            let _dbSelector = undefined;/* showDBSelector ? <div>
                <DBSelector 
                    {...dbSelectorProps}
                    onChange = {this.onChangeDatabases.bind(this)}
                />
            </div> : null;*/
            if(!title){
                title = _dbSelector;
                _dbSelector = null;
            }
            exportable = defaultBool(exportable,true);
            sortable = defaultVal(sortable,true);
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
            const {columnsWidths:widths,showFilters,showFooter} = this.state;
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
                    {
                        text : "Sélect "+max,
                        icon : "select-all",
                        onPress : (x,event)=>{
                            this.handleAllRowsToggle(true);
                        }
                    },
                    {
                        text : "Tout désélec",
                        onPress : (x,event)=>{
                            this.handleAllRowsToggle(false);
                        },
                        icon : "select"
                    }
                ]
            }   
            const rPagination = showPagination ? <View style={[styles.paginationContainer]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={!isLoading} style={styles.paginationContainerStyle} contentContainerStyle={styles.minW100}>
                    <View style={[styles.paginationContent]}>
                        <View testID={testID+"_HeaderQueryLimit"}>
                            {this.renderQueryLimit(this.state.data.length.formatNumber())}
                        </View>
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
                                onPress =  {()=>{showFooter?this.hideFooter():this.showFooter()} }   
                                icon = {showFooter?'view-column':'view-module'}
                            >   
                                    {showFooter?'Masquer/Ligne des totaux':'Afficher/Ligne des totaux'}
                            </Button>:null}
                            {selectableMultiple && (<>
                                {restItems.map((item,index)=>{
                                    return <Button 
                                        normal
                                        style={styles.paginationItem}
                                        key = {index}
                                        icon = {item.icon}
                                        onPress = {item.onPress}                                    
                                    >
                                        {item.text}
                                    </Button>
                                })}
                            </>)}
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
                                    onPress :  ()=>{showFooter?this.hideFooter():this.showFooter()}    
                                    ,icon :  showFooter?'view-column':'view-module'
                                    ,text : (showFooter?'Masquer/Ligne des totaux':'Afficher/Ligne des totaux')
                                } : null,
                                ...(selectableMultiple ? restItems : [])
                            ] : visibleColumns}
                        
                        />
                        <View testID={testID+"_HeaderPagination"} style = {styles.paginationItem}>
                            <BottomSheetMenu
                                testID={testID+"_HeaderMenus"}
                                anchor={(props)=>(<Icon {...props} icon={'axis-z-arrow'}/>)} 
                                items = {[
                                    {
                                        text : 'Retour en haut',
                                        icon : "arrow-up-bold",
                                        onPress : this.scrollToTop.bind(this)
                                    },
                                    {
                                        text : 'Retour A gauche',
                                        icon : "arrow-up-bold",
                                        onPress : this.scrollToLeft.bind(this)
                                    },
                                    {
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
                    hasFooters = {hasFooterFields}
                    showFilters = {showFilters}
                    showFooters = {showFooter}
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
                    renderFooterCell={this.renderFooterCell.bind(this)}
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
        alignItems : 'center'
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
        alignItems : 'flex-start',
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
        flexGrow : 1,
        minHeight : 40,
    },
    layoutContent : {
        maxWidth : '100%',
        position : 'relative',
    }
})