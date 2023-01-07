import theme from "$theme";
import APP from "$capp";
import {isMobileOrTabletMedia} from "$cplatform/dimensions";
import PropTypes from "prop-types";
import {Component as AppComponent} from "$react"
import $session from "$session";
import Auth from "$cauth";
import Tooltip from "$ecomponents/Tooltip";
import setQueryLimit from "./setQueryLimit";
import {showConfirm} from "$ecomponents/Dialog";
import Label from "$ecomponents/Label";
import Icon,{COPY_ICON} from "$ecomponents/Icon";
import filterUtils from "$cfilters";
import {sortBy,isDecimal,defaultVal,sanitizeSheetName,extendObj,isObjOrArray,isObj,defaultNumber,defaultStr,isFunction,defaultBool,defaultArray,defaultObj,isNonNullString,defaultDecimal} from "$utils";
import {Datagrid as DatagridContentLoader} from "$ecomponents/ContentLoader";
import React from "$react";
import DateLib from "$lib/date";
import Filter,{canHandleFilter,prepareFilters} from "$ecomponents/Filter";
import {CHECKED_ICON_NAME} from "$ecomponents/Checkbox";
import { COLUMN_WIDTH,DATE_COLUMN_WIDTH,willConvertFiltersToSQL } from "../utils";
import { StyleSheet,Dimensions,useWindowDimensions} from "react-native";
import Preloader from "$ecomponents/Preloader";
import Checkbox from "../Checkbox";
import { TouchableRipple } from "react-native-paper";
import { evalSingleValue,Footer,getFooterColumnValue,isValidAggregator,extendAggreagatorFunctions} from "../Footer";
import { makePhoneCall,canMakePhoneCall as canMakeCall} from "$makePhoneCall";
import copyToClipboard from "$capp/clipboard";
import { Pressable } from "react-native";
import stableHash from "stable-hash";
import DatagridProgressBar from "$ecomponents/Table/ProgressBar";
import View from "$ecomponents/View";
import {Menu} from "$ecomponents/BottomSheet";
import {styles as tableStyles} from "$ecomponents/Table";
import {DialogProvider} from "$ecomponents/Form/FormData";
import Chart,{getMaxSupportedSeriesSize} from "$ecomponents/Chart";
import notify from "$cnotify";
import FileSystem from "$file-system";
import sprintf from "$cutils/sprintf";
import { renderRowCell,formatValue,arrayValueSeparator } from "./utils";
import {ScrollView} from "react-native";
import Button from "$ecomponents/Button";
import * as XLSX from "xlsx";

export const TIMEOUT = 100;

export const donutChart = {
    isChart : true,
    code : 'donutChart',
    label : 'Donut',
    icon : "chart-donut",
    type: 'donut',
    key : "donut",
    isDonut : true,
    isRendable : ({displayOnlySectionListHeaders,isSectionList})=> isSectionList && displayOnlySectionListHeaders,
    tooltip : "Pour pouvoir visulaiser ce type de graphe, vous devez : grouper les données du tableau selon le criètre de votre choix, puis afficher uniquement les totaux des données groupées"
}
const stackSettings = {
    type : 'switch',
    text : "Graphe empilé?",
    checkedValue : true,
    uncheckedValue : false,
    //le nom de la propriétés dans les propriétés du tableau
    settingKey : "chart",
}
export const displayTypes = {
    table : {
        code : "table",
        isChart : false,
        label : 'Tableau',
        icon : "table",
        type : 'table',
    },
    lineChart : {
        code : "lineChart",
        isChart : true,
        label : 'Linéaire',
        icon : "chart-areaspline",
        type : 'line',
        key : "line",
    },
    areaChart : {
        isChart : true,
        code : 'areaChart',
        label : 'Surface',
        icon : "chart-areaspline-variant",
        type: 'area',
        key : "line",
    },
    barChart : {
        isChart : true,
        code : 'barChart',
        label : 'Histogramme',
        icon : "chart-bar",
        type: 'bar',
        key : "line",
        settings : {
            stacked : stackSettings,
        }
    },
    pieChart : {
        ...donutChart,
        code : 'pieChart',
        label : 'Pie',
        icon : "chart-pie",
        type: 'pie',
    },
    donutChart,
    radarChart : {
        isChart : true,
        code : 'radarChart',
        label : 'Radar',
        icon : "radar",
        type: 'radar',
        key : "line",
        settings : {
            stacked : stackSettings,
        }
    }
    /*rangeChart : {
        code : "rangeChart",
        isChart : true,
        label : 'Graphique|Bar Interval',
        icon : "chart-timeline",
        type: 'boxPlot'
    },*/
   /*chartBoxPlot : {
        code : "chartBoxPlot",
        isChart : true,
        label : 'Graphique|Box plot',
        icon : "chart-waterfall",
        type: 'boxPlot'
    },*/
    //@see : https://apexcharts.com/docs/chart-types/treemap-chart/
    /*treeMap : {
        code : "treeMap",
        isChart : true,
        label : 'Graphique|Aborescente',
        icon : "chart-tree",
        type: 'treemap'
    },*/
}

export const chartTypes = {};

Object.map(displayTypes,(c,k)=>{
    if(c && c.isChart){
        chartTypes[k] = c;
    }
})


const dataSourceArgs = {};
export const footerFieldName = "dgrid-fters-fields";


/*****
 * Pour spécifier qu'un champ du datagrid n'existe pas en bd il s'ufit de suffixer le nom du champ par le suffix : "FoundInDB" et de renseigner false comme valeur 
de l'objet rowData de cette propriété
 */
export default class CommonDatagridComponent extends AppComponent {
    constructor(props){
        super(props);
        this.initSession();
        this.autobind();
        let {
            data,
            selectedRows,
            chartAllowedPerm,
            exportToPDFAllowedPerm,
            exportToExcelAllowedPerm,
            ...rest
        } = props;
        if(this.bindResizeEvents()){
            extendObj(this._events,{
                RESIZE_PAGE : this.onResizePage.bind(this),
                SET_DATAGRID_QUERY_LIMIT : this.onSetQueryLimit.bind(this),
            });
        }
        rest = defaultObj(rest);
        this._pagination = defaultObj(rest.pagination);
        this.hasLocalFilters = false;
        data = (data && typeof data == 'object')? Object.toArray(data):[];
        let sRows = {}
        Object.map(selectedRows,(row,i)=>{
            if(this.canSelectRow(row)){
                sRows[this.getRowKey(row,i)] = {...row};
            }
        });
        selectedRows = sRows;
        let sData = this.getSessionData()
        sData.showFooters = defaultVal(sData.showFooters,this.isTableData());
        sData.fixedTable = defaultBool(sData.fixedTable,false);
        extendObj(this.state, {
            data,
            showFilters : this.isFilterable() && defaultBool(props.showFilters,(sData.showFilters? true : this.isPivotDatagrid())) || false,
            showFooters : defaultBool(props.showFooters,(sData.showFooters? true : false)),
            fixedTable : sData.fixedTable
        });
        const disTypes = {};
        let hasFoundDisplayTypes = false;
        const perm = isNonNullString(chartAllowedPerm)? Auth.isAllowedFromStr(chartAllowedPerm) : true;
        const ePDFIsAllowed = isNonNullString(exportToPDFAllowedPerm)? Auth.isAllowedFromStr(exportToPDFAllowedPerm) : true;
        const eExcelISAllowed = isNonNullString(exportToExcelAllowedPerm)? Auth.isAllowedFromStr(exportToExcelAllowedPerm) : true;
        Object.map(this.props.displayTypes,(dType,v)=>{
            if(isNonNullString(dType)){
                dType = dType.toLowerCase().trim();
                if(displayTypes[dType]){
                    const dp = displayTypes[dType];
                    if(dp.isChart && !perm){
                        return;
                    }
                    hasFoundDisplayTypes = true;
                    disTypes[dType] = Object.clone(displayTypes[dType]);
                }
            }
        });
        const allowedDisplayTypes = {};
        Object.map(displayTypes,(t,i)=>{
            if(t.isChart && !perm) return;
            allowedDisplayTypes[i] = Object.clone(t);
        })
        Object.defineProperties(this,{
            layoutRef : {
                value : React.createRef(null),
            },
            sortRef : {
                value : {current : defaultObj(props.sort)}
            },
            preparedColumns : {
                value : {},override:false, writable:false,
            },
            selectedRows : {
                value : selectedRows, override : false, writable : false,
            },
            selectedRowsRefs : {
                value : {},override : false, writable : false,
            },
            [footerFieldName] : {
                value : uniqid(footerFieldName),override:false, writable: false
            },
            progressBarRef : {
                value : {current : null}
            },
            isLoadingRef : {
                value : {current:false}
            },
            isChartAllowed : {value : perm},
            isExcellExportAllowed : {value:eExcelISAllowed},
            isPDFExportAllowed : {value: ePDFIsAllowed},
            currentFilteringColumns : {value:{}},
            emptySectionListHeaderValue : {value : uniqid("empty-section-list-header-val").toUpperCase()},
            getSectionListHeaderProp : {value : typeof this.props.getSectionListHeader =='function'? this.props.getSectionListHeader : undefined},
            sectionListData : {value : {}},//l'ensemble des données de sectionList
            hasFoundSectionData : {value : {current: false}},
            sectionListHeaderFooters : {value : {}},
            sectionListDataSize : {value : {current : 0}},
            enablePointerEventsRef : {value : {current:false}},
            chartIdPrefix : {value : uniqid("datagrid-chart-id-prefix")},
            ///la liste des fonctions d'aggregations supportées
            aggregatorFunctions : {value : extendAggreagatorFunctions(this.props.aggregatorFunctions)},
            ///les types d'affichage
            displayTypes : {value : hasFoundDisplayTypes ? disTypes : allowedDisplayTypes},
            dateFields : {value : {}},
            sectionListColumnsSize : {value : {current:0}}, //la taille du nombre d'éléments de section dans les colonnes
            chartRef : {value : {current:null}},
            layoutRef : {value : {}},
            isRenderingRef : {value : {current:false}},
            chartSeriesNamesColumnsMapping : {value : {}},//le mappage entre les index des series et les colonnes coorespondantes
        }) 
        this.state.abreviateValues = "abreviateValues" in this.props? !!this.props.abreviateValues : !!this.getSessionData("abreviateValues");
        const sessionAggregator = defaultStr(this.getSessionData("aggregatorFunction")).trim();
        const aggregatorProps = defaultStr(this.props.aggregatorFunction).trim();
        let aggregatorFunction = null;
        if(aggregatorProps && isValidAggregator(this.aggregatorFunctions[aggregatorProps])){
            aggregatorFunction = aggregatorProps;
        } else if(isNonNullString(sessionAggregator) && isValidAggregator(this.aggregatorFunctions[sessionAggregator])){
            aggregatorFunction = sessionAggregator;
        } else {
            aggregatorFunction = Object.keys(this.aggregatorFunctions)[0];
        }
        this.state.aggregatorFunction= aggregatorFunction;
        this.isLoading = this.isLoading.bind(this);
        this.getProgressBar = this.getProgressBar.bind(this);
        this.sortRef.current.dir = defaultStr(this.sortRef.current.dir,this.sortRef.current.column == "date"?"desc":'asc')
        this.hasColumnsHalreadyInitialized = false;
        this.initColumns(props.columns);
        if(!isNonNullString(this.sortRef.current.column) && "date" in this.state.columns){
            this.sortRef.current.column = "date";
        }
        this.INITIAL_STATE = {
            data,
        }
        this._datagridId = isNonNullString(this.props.id)? this.props.id : uniqid("datagrid-id")
        this.canDoFilter = true;    
        this.filters =  {}
        Object.map(this.getFiltersProps(),(f,v)=>{
            if(isPlainObject(f)){
                this.filters[v] = {...f};
                this.filters[v].field = defaultStr(f.field,v);
                this.filters[v].defaultValue = defaultVal(f.defaultValue,f.value)
            } else {
                this.filters[v] = {
                    defaultValue : f,
                    field : v
                }
            }
        });
        this.state.filteredColumns = defaultObj(this.getSessionData("filteredColumns"+this.getSessionNameKey()),this.props.filters);
        this.filtersSelectors = {selector:this.getFilters()};
        const {sectionListColumns} = this.prepareColumns();
        this.state.sectionListColumns = sectionListColumns;
        if(this.canHandleColumnResize()){
            this.state.columnsWidths = this.preparedColumns.widths;
        }
        this.state.chartConfig = extendObj(true,{},this.getSessionData("chartConfig"),this.props.chartConfig);
        if(!("sparkline" in this.state.chartConfig) && this.isDashboard()){
            this.state.chartConfig.sparkline = true;
        }
        const dType = defaultStr(this.props.displayType,this.getSessionData("displayType"),"table");
        this.state.displayType = this.displayTypes[dType] ? this.displayTypes[dType].code : "table" in this.displayTypes ? "table" : Object.keys(this.displayTypes)[0]?.code;
        this.state.displayOnlySectionListHeaders = defaultBool(this.getSessionData("displayOnlySectionListHeaders"),this.props.displayOnlySectionListHeaders,false)
        if(this.state.displayOnlySectionListHeaders){
            this.state.showFooters = true;
        }
        extendObj(this.state,this.prepareData({data}));
        const {width:windowWidth,height:windowHeight} = Dimensions.get("window");
        this.state.layout = {
            x : 0,
            y : 0,
            width : 0,
            height : 0,
            windowWidth,
            windowHeight,
        }
        this.selectableColumnRef = React.createRef(null);
        let isPv = this.isPivotDatagrid();
        if(isPv){
            isPv = this.props.dataSourceSelector !== false;
        } else isPv = this.props.dataSourceSelector === true ? true : false;
        if(isPv){
            let dataSourceSelectorProps = defaultObj(this.props.dataSourceSelectorProps);
            ['table','tableName'].map((tb,idx)=>{
                dataSourceSelectorProps[tb] = defaultStr(this.props[tb],dataSourceSelectorProps[tb]);
            });
            let cDB = []//DBSelector.getDefaultSelected(dataSourceSelectorProps,this.currentDataSources,this.props);
            let sDB = this.getSessionData().selectedDataSources;
            cDB = Object.toArray(cDB);
            if(cDB.length){
                this.currentDataSources = cDB
            } else {
                this.currentDataSources = sDB;
            }   
            this.setSessionData({selectedDataSources:this.currentDataSources});
        } else {
            this.currentDataSources = Object.toArray(this.currentDataSources);
        }
        if(isPv){
            isPv = this.props.dataSourceSelector !== false;
        } else isPv = this.props.dataSourceSelector === true ? true : false;
        if(isPv){
            let dataSourceSelectorProps = defaultObj(this.props.dataSourceSelectorProps);
            ['table','tableName'].map((tb)=>{
                dataSourceSelectorProps[tb] = defaultStr(this.props[tb],this[tb],dataSourceSelectorProps[tb]);
            });
            this.setSessionData({selectedDataSources:this.currentDataSources});
        } else {
            this.currentDataSources = Object.toArray(this.currentDataSources);
        }
        this.persistDisplayType(this.state.displayType);
    }

    /*** si une ligne peut être selectionable */
    canSelectRow(row){
        return isObj(row) && row.isSectionListHeader !== true ? true : false;
    }
    prepareSectionListColumns(props){
        props = defaultObj(props,this.props);
        const l = {};
        (Array.isArray(props.sectionListColumns) ? props.sectionListColumns : defaultArray(this.getSessionData("sectionListColumns"))).map((col)=>{
            if(isNonNullString(col)){
                l[col.trim()] = {};
            } else if(isObj(col) && isNonNullString(col.field)){
                l[col.field] = col;
            }
        })
        return l;
    }
    /*** récupère la liste des colonnes à utiliser pour le rendu des sectionList, ces colonnes doivent figurer dans la liste des colonnes du tableu */
    getSectionListColumns(){
        if(!isObj(this.state.sectionListColumns)){
            return this.prepareSectionListColumns();
        }
        return this.state.sectionListColumns;
    }
    canExportToPDF(){
        return this.isPDFExportAllowed;
    }
    canExportToExcel (){
        return this.isExcellExportAllowed;
    }
    bindResizeEvents(){
        return false;
    }
    canHandleColumnResize(){
        return false;
    }
    initSession (){
        let sessionName = this.props.sessionName;
        let isDatagrid = this.isDatagrid()
        if(!isNonNullString(sessionName)){
            //sessionName = 'datagrid';
        }
        let userCode = Auth.getLoggedUserCode();
        Object.defineProperties(this,{
            getSessionKey : {
                value : ()=>{
                    if(!isNonNullString(sessionName) || (!isNonNullString(userCode) && !isDatagrid)) return false;
                    return this.getSessionPrefix()+sessionName.ltrim(this.getSessionPrefix()).replaceAll(" ",'_')+userCode;
                }
            },
            getSessionData : {
                value : (sessionKey)=>{
                    let key = this.getSessionKey();
                    let dat = {}
                    if(isNonNullString(key)){
                        dat = defaultObj($session.get(key));
                    }
                    if(isNonNullString(sessionKey)){
                        return dat[sessionKey]
                    }
                    return dat;
                }
            },
            setSessionData : {
                value : (sessionKey,sessionValue)=>{
                    if(this.props.session === false) return;
                    let key = this.getSessionKey();
                    if(!isNonNullString(key)) return false;
                    let dat = defaultObj(this.getSessionData());
                    if(isNonNullString(sessionKey)){
                        dat[sessionKey] = sessionValue;
                    } else if(isObj(sessionKey)){
                        extendObj(dat,sessionKey);
                    } else {
                        return dat;
                    }
                    $session.set(key,dat);
                    return dat;
                }
            }
        })
    }
    /*** lorsque les filtres locaux changes */
    onLocalFiltersChange(localFilters){
        return;
        let lFilters = {};
        this.hasLocalFilters = false;
        Object.map(localFilters,(f,i)=>{
            if(!isObj(f) || !f.field) return;
            lFilters[i] = f;
            this.hasLocalFilters = true;
        })
        this.__localFilters = lFilters;
        this.refresh(true);
    }
    /*** effectue un filtre local sur le tableau */
    doLocalFilter({rowData}){
        return true;
        if(!isObj(rowData)) return null;
        let localFilters = defaultObj(this.__localFilters);
        let ret = true;
        for(let i in localFilters){
            let f = localFilters[i];
            if(!isObj(f) || !f.field) continue;
            let {value,operator,field,useRegex} = f;
            if(!isDecimal(value) && !isBool(value) && !value) continue;
            if(!filterUtils.match({
                value : rowData[field],
                filterText:value,
                operator,
                useRegex
            })) 
            return false;
        }
        return ret;
    }
    initPagination(pagination){
        pagination = defaultObj(pagination);
        pagination.start = defaultDecimal(pagination.start);
        pagination.limit = defaultDecimal(pagination.limit,this.getSessionData().paginationLimit,isMobileOrTabletMedia()?5:30);
        pagination.page = defaultDecimal(pagination.page,pagination.page,1);
        pagination.rows = 0;
        return pagination;
    }
    /**** archive les documents sélectionnés */
    archive(args){
        args = defaultObj(args);
        let archive = defaultFunc(this.props.archive);
        let d = [];
        Object.map(args.selectedRows,(doc)=>{
            if(isDocUpdate(doc)){
                d.push(doc)
            }
        });
        args.data = d;
        args.context = this;
        if(d.length > 0){
            let sL = d.length > 1 ? "s":"";
            let tP = (!sL?" le ":(" les "+d.length.formatNumber()))+" document"+sL+" sélectionné"+sL;
            showConfirm({
                title : 'Archiver'+tP,
                msg : "Attention  il s'agit d'une opération irréversible!!\n"+'Voulez vous réellement archiver '+tP+"?",
                yes : 'Archiver',
                no : 'Annuler',
                onSuccess : ()=>{
                    archive(args)
                }
            })
        }
        return ;
    }
    canPaginateData(){
        if(this.props.handlePagination === false) return false;
        return this.isDatagrid();
    }
    getFiltersProps(){
        return this.props.filters;
    }
    getSessionPrefix (){
        return "datagrid"
    }
    isDatagrid(){
        return false;
    }
    callSRowCallback({selected,row,rowIndex,key,cb}){
        let count = Object.size(this.selectedRows);
        let sArg = this.getActionsArgs(selected);
        sArg.count = count;
        sArg.rowIndex = sArg.index = rowIndex;
        sArg.rowKey = key;
        if(count >0){
            if(selected){
                if(typeof(this.props.onRowSelected) ==='function'){
                    sArg.selectedRow = row;
                    this.props.onRowSelected.call(this,sArg)
                }
            } else if(isFunction(this.props.onRowDeselected)) {
                sArg.deselectedRow = row;
                this.props.onRowDeselected.call(this,sArg);
            }
            if(this.isAllRowsSelected()){
                if(isFunction(this.props.onRowsSelected)){
                    this.props.onRowsSelected.call(this,sArg);
                }
            }
        } else {
            if(count > 0 && isFunction(this.props.onRowsDeselected)){
                this.props.onRowsDeselected.call(this,{context:this,props:this.props});
            }
        }
        if(isFunction(cb)){
            cb(selected,row,rowIndex,{context:this})
        }
    }
    toggleSelectableColumnCheckbox(update){
        if(isObj(this.selectableColumnRef) && isObj(this.selectableColumnRef.current) && typeof this.selectableColumnRef.current.check =='function' && typeof this.selectableColumnRef.current.uncheck =='function'){
            if(typeof update !=='boolean'){
                update = this.selectedRowsCount && this.selectedRowsCount === this.getMaxSelectableRows() ? true : false;
            }
            if(update){
                this.selectableColumnRef.current.check(false);
            } else {
                this.selectableColumnRef.current.uncheck(false);
            }
        }
    }
    getSelectedRowsCount(){
        return isDecimal(this.selectedRowsCount) ? this.selectedRowsCount: 0;
    }
    /**** fonction appelée lorsque l'on clique sur la checkbox permettant de sélectionner la ligne */
    handleRowToggle ({row,rowIndex,rowData,rowKey,index, selected,cb,callback},cb2){
        if(!this.canSelectRow(row)) return ;
        if(typeof rowKey !=='string' && typeof rowKey !=='number') return;
        let selectableMultiple = defaultVal(this.props.selectableMultiple,true);
        rowIndex = defaultNumber(rowIndex,index);
        cb = defaultFunc(cb,callback,cb2)
        row = rowData = defaultObj(row,rowData);
        let size = this.selectedRowsCount;
        if(selected && !selectableMultiple && size >= 1){
            return notify.warning("Vous ne pouvez sélectionner plus d'un élément")
        }
        if(!selectableMultiple){
            this.setSelectedRows();
        }
        let selectedRows = this.selectedRows;
        const sRowRef = this.selectedRowsRefs[rowKey];
        this.selectedRowsCount = isDecimal(this.selectedRowsCount)? this.selectedRowsCount : 0;
        if(isObj(sRowRef) && typeof sRowRef.check =='function' && typeof sRowRef.uncheck =='function'){
            selected ? sRowRef.check() : sRowRef.uncheck();
            sRowRef.checked = !!selected;
        }
        if(selected){
            this.selectedRowsCount +=1;
            let max = this.getMaxSelectedRows();
            if(max && size>= max){
                return notify.warning("Vous avez atteint le nombre maximum d'éléments sélectionnable, qui est de "+max.formatNumber())
            }
            selectedRows[rowKey] = row;
        } else {
            this.selectedRowsCount = Math.max(this.selectedRowsCount-1,0);
            delete selectedRows[rowKey];
        }
        
        this.toggleSelectableColumnCheckbox();
        if(isObj(this.datagridActionsContext) && isFunction(this.datagridActionsContext.setSelectedRows)){
            this.datagridActionsContext.setSelectedRows(selectedRows,x =>{
                this.callSRowCallback({selected,row,rowIndex,rowKey,cb})
            });
        } else {
            this.callSRowCallback({selected,rowData,row,rowIndex,rowKey,cb});
        }
    }
    canExportAskDisplayMainContent(){
        return false;
    }
    getExportableProps (){
        let exportTableProps = this.props.exportTableProps;
        if(isFunction(exportTableProps)){
            exportTableProps = exportTableProps({context:this});
        }
        exportTableProps = defaultObj(exportTableProps);
        exportTableProps.fileName = defaultStr(exportTableProps.fileName,this.props.title,this.props.text)
        if(isFunction(exportTableProps.init)){
            exportTableProps.init({data,context:this});
        }
        exportTableProps.askDisplayMainContent = this.canExportAskDisplayMainContent();
        delete exportTableProps.init;
        return exportTableProps;
    }
    onAllRowsToggle(){}
    handleAllRowsToggle(update){
        if(!defaultVal(this.props.selectableMultiple,true) && this.selectedRowsCount && this.getPaginatedData().length){
            notify.warning("Vous ne pouvez sélectionner qu'un seul élément à la fois");
            return;
        }
        if(typeof update !=='boolean'){
            update = this.isAllRowsSelected();
        }
        let data = update ? this.getPaginatedData():[];
        let max = this.getMaxSelectedRows();
        if(max && data.length){
            let _d = [],i=0,counter = 0,l = data.length;
            while(i < max && counter < l ){
                counter ++;
                if(isObj(data[i])){
                    _d.push(data[i]);
                    i++;
                }
            }
            data = _d;
        }
        this.setSelectedRows(data);
        if(isObj(this.datagridActionsContext) && isFunction(this.datagridActionsContext.setSelectedRows)){
            this.datagridActionsContext.setSelectedRows(this.selectedRows);
        }
    }
    isAccordion(){
        return false;
    }
    ////vérifie s'il s'agit du composant pivot grid
    isPivotDatagrid(){
        return false;
    }
    /** peut afficher les numéros de lignes */
    canHandleIndexColumn(){
        return this.isDatagrid();
    }
    getIndexColumnName(){
        return "#dg-col-number"
    }
    getSelectableColumName(){
        return "#dg-selectable-colname";
    }
    canHandleSelectableColumn(){
        return false;
    }
    getSelectableColumNameStyle(){
        return {alignItems:'flex-start',marginLeft:0,marginRight:0,marginTop:0,marginBottom:0,paddingLeft:0,paddingRight:0,paddingTop:0,paddingBottom:0};
    }
    isSelectableColumn(columnDef,columnField){
        return isObj(columnDef) && defaultStr(columnDef.field,columnField) === this.getSelectableColumName();
    }
    isIndexColumn(columnDef,columnField){
        return isObj(columnDef) && defaultStr(columnDef.field,columnField) === this.getIndexColumnName();
    }
    isDateField(column){
        const field = isObj(column)? defaultStr(column.field,column.name) : defaultStr(column);
        return field && field in this.dateFields ? true : false;
    }
    isFooterField(column){
        const field = isObj(column)? defaultStr(column.field,column.name) : defaultStr(column);
        return field && isObj(this.state.footers) &&  field in this.state.footers ? true : false;
    }
    initColumnsCallback(){}
    initColumns (columns){
        this.state.columns = {};
        let colIndex = 0;
        if(this.canHandleSelectableColumn()){
            this.state.columns[this.getSelectableColumName()] = {
                field : this.getSelectableColumName(),
                style : this.getSelectableColumNameStyle(),
                width : 40,
                isSelectableColumnName : true,
                filter : false,
                visible : true,
                text :"Case à cocher",
                sortable : false,
            }
        }
        if(this.canHandleIndexColumn()){
            colIndex++;
            this.state.columns [this.getIndexColumnName()] =  { 
                filter : false,
                visible : true,
                width : 50,
                frozen : 'left',
                text : '#',
                colIndex,
                field : this.getIndexColumnName(),
                sortable : false,
                render : ({rowCounterIndex,columnField})=>{
                    return <Label primary key={rowCounterIndex+"-col-field-n"}>{rowCounterIndex}</Label>
                }
            }
        }
        const footers = this.getFootersFields(true);
        let isAccordion = this.isAccordion();
        Object.mapToArray(columns,(headerCol1,headerIndex)=>{
            if(!isObj(headerCol1)) return;
            const headerCol = Object.clone(headerCol1);
            if(isAccordion && headerCol.accordion === false) return null;
            let header = {...headerCol};
            header.field = defaultStr(header.field, headerIndex)
            header.type = defaultStr(header.jsType,header.type,"text").toLowerCase();
            if(header.type.contains("date")){
                this.dateFields[header.field] = header;
            }
            /**** pour ignorer une colonne du datagrid, il sufit de passer le paramètre datagrid à false */
            if(!isNonNullString(header.field) || header.datagrid === false) {
                return;
            }
            colIndex++;
            header.visible = defaultVal(header.visible,true);
            header.colIndex = colIndex;
            this.state.columns[header.field] = header;
            /*** les pieds de pages sont les données de type decimal, où qu'on peut compter */
            if(header.footer !== false && ((arrayValueExists(['decimal','number','money'],header.type) && header.format) || header.format == 'money' || header.format =='number')){
                footers[header.field] = Object.clone(header);
            }
            if(!this.hasColumnsHalreadyInitialized){
                this.initColumnsCallback({...header,colIndex,columnField:header.field});
            }
        })
        return footers;
    }
    getFootersFields(init){
        this[this.footerFieldName] = init === true ? {} : defaultObj(this[this.footerFieldName]);
        return this[this.footerFieldName];
    }
    hasFootersFields(){
        return Object.size(this.getFootersFields(),true) ? true : false;
    }
    getFooters(){
        return this.getFootersFields();
    }
    getActionsArgs(selected){
        const r = isObj(selected)? selected : {};
        const ret = {
            ...dataSourceArgs,
            showConfirm,
            Preloader,
            notify,
            selected : defaultBool(selected,false),
            ...r,
            isMobile : isMobileOrTabletMedia(),
            component:'datagrid',
            data : this.state.data,
            rows : this.state.data,
            allData : this.INITIAL_STATE.data,
            props : this.props,
            selectedRows : this.selectedRows,
            context:this,
            isMobile : isMobileOrTabletMedia(),
            Auth,
        };
        if(this.props.getActionsArgs){
            const sArg = this.props.getActionsArgs(ret);
            if(isObj(sArg)){
                return {...sArg,...ret};
            }
        }
        return ret;
    }

    copyToClipboard({selectedRows}){
        let keys = Object.keys(selectedRows);
        let row = selectedRows[keys[0]];
        if(!isObj(row)){
            return notify.error("Impossible de copier le premier élément sélectionné du tableau car il est invalide");
        }
        return copyToClipboard({data:row,fields : this.props.columns,sessionName:defaultStr(this.props.sessionName,"datagrid")});
    }
    
    /*** les actions représentes les différents menus apparaissant lorsqu'une ligne est sélectionnée
     *   ou pas.
     */
    renderSelectedRowsActions(sActions){
        let {printOptions,makePhoneCallProps,printable,print,archive,canMakePhoneCall,archivable} = this.props;
        const {size} = sActions;
        let r = [];
        let endActs = [];
        if(size <=0) {
            return r
        };
        let selectedR = this.props.selectedRowsActions;
        const sArgs = this.getActionsArgs(true);
        sArgs.size = sArgs.selectedRowsCount = Object.size(sArgs.selectedRows);
        sArgs.selectedRowsKeys = Object.keys(sArgs.selectedRows);
        if(isFunction(selectedR)) {
            selectedR = selectedR.call(this,sArgs)
        }
        if(isFunction(print)){
            if(isFunction(printable)){
                printable = printable({context:this,props:this.props});
            }
            if(printable !== false){
                r.push({
                    icon : defaultVal(this.props.printIcon,'printer'),
                    text : defaultVal(this.props.printButton,this.props.printText,'Imprimer'),
                    onPress : ()=>{
                        let {selectedRows}= sArgs;
                        let d = [];
                        for(let i in selectedRows){
                            if(isDocUpdate(selectedRows[i])){
                                d.push(selectedRows[i])
                            }
                        }
                        print({title:defaultStr(this.props.title),...defaultObj(printOptions),data:d});
                    },
                })
            }
        }
        Object.map(sActions,(o,i)=>{
            if(isObj(o)){
                let {onPress, ...rest} = o;
                if(!isObj(rest) || !isFunction(onPress)) return null;
                rest.onPress = (event)=>{
                    if(isFunction(onPress)){
                        onPress.call(this,sArgs);
                    }
                }
                if(o.pos !== 'end'){
                    r.push(rest)
                } else {
                    endActs.push(rest);
                }
            }
        })
        Object.mapToArray(selectedR,(action,i)=>{
            if(isObj(action)){
                let {onPress, ...rest} = action;
                if(!isObj(rest)) return null;
                rest.onPress = (event)=>{
                    if(isFunction(onPress)){
                        onPress.call(this,sArgs);
                    }
                }
                r.push(rest)
            }
        })
        endActs.map((a)=>{
            r.push(a);
        })
        if(size === 1 && canMakePhoneCall === true && canMakeCall()){
            const rowKey = Object.keys(this.selectedRows)[0], rowData = defaultObj(this.selectedRows[rowKey]);
            let callProps = typeof makePhoneCallProps == 'function'? makePhoneCallProps(rowData,rowKey) : makePhoneCallProps;
            callProps = defaultObj(callProps);
            r.push({
                text : defaultStr(callProps.text,callProps.label,'Appeler'),
                icon : defaultStr(callProps.icon,'phone'),
                flat : true,
                onPress : ()=>{
                    return makePhoneCall(
                        rowData,
                        callProps
                    );
                }
            })
        }
        if(isObj(this.props.columns) && size ===1){
            r.push({
                icon : COPY_ICON,
                text : 'Copier',
                tooltip : 'Copier le premier élément sélectionné dans le presse papier',
                pos:'end',
                onPress : () =>{
                    this.copyToClipboard(sArgs)
                },
            });
        }
        return r;
    }

    /*** le trie du tableau prend en paramètre 
        : le nom de la colonne de trie, la direction de la conne de trie
        par défaut, le trie se fait en ignorant la casse
        sort : {
            dir ://la direction : asc,desc
            column : //le nom de la colonne à laquelle on trie
            le nom de la colonne de tri doit être définie par défaut, 
            dans la propriété column du sort prop 
            ou dans la propriété sortByColumn
        }
     */
    sort (column,dir){
        const sort = extendObj({},{
            dir: '',
            column : '',
            ignoreCase : true
        }, this.sortRef.current);
        if(isNonNullString(column)){
            sort.column = column;
        }
        if(!isNonNullString(sort.column)){
            return ;
        } 
        if(isNonNullString(dir)){
            sort.dir = dir;
        } 
        if(this.sortRef.current.column === sort.column){
            switch(this.sortRef.current.dir){
                case 'asc':
                    sort.dir = 'desc';
                    break;
                case 'desc':
                    sort.dir = 'asc';
                    break;
            }
        } else sort.dir = 'asc';

        if(!isNonNullString(sort.dir)){
            sort.dir = 'asc';
        } else {
            sort.dir = sort.dir.trim().toLowerCase();            
        }
        if(sort.dir !== "asc" && sort.dir !== "desc") sort.dir = 'asc';
        this._previousSortObj = Object.clone(this.sortRef.current);
        this.sortRef.current = sort;
        this.prepareColumns({sortedColumn : this.sortRef.current});
        if(typeof this.props.onSort =='function' && this.props.onSort({...sort,context:this,sort,data:this.INITIAL_STATE.data,fields:this.state.columns,columns:this.state.columns}) === false){
            return;
        }
        this.prepareData({data:this.INITIAL_STATE.data,updateFooters:false},(state)=>{
            this.setState(state);
        });
    }

   /**** pagine l'objet data passé en parmètre de manière a retourner un objet satisfaisant aux paramètres
        start, limit,page
   */ 
   pagin (data,start, limit, page){
        if(this.props.showPagination === false || this.props.pagin === false) return data;
        this._pagination = defaultObj(this._pagination);
        this._pagination.start = start;
        this._pagination.limit = limit;
        return data.slice(start, start + limit).filter(d => !!d);
   }

   _increment (){
        const rows = this.INITIAL_STATE.data.length
        const { start,limit, page} = this._pagination;
        // Only correct multiple of rows per page
        const max = rows - (rows % limit);

        let newStart = Math.min(start + limit, max);
        let nextPage = page + 1;
        let pages = this.countPages();
        if(nextPage > pages){
            nextPage  = pages;
        }
        this.handlePagination(newStart, limit, nextPage);
    }
    /*** pour le rendu personalisé de la pagination */
    renderCustomPagination(){
        if(typeof this.props.renderCustomPagination ==='function'){
            const r = this.props.renderCustomPagination({
                context:this,refresh:this.refresh.bind(this)
            });
            return React.isValidElement(r)? r : null;
        }
        return null;
    }
    /*** permet de faire le rendu de certaines entête personalisés 
     * utile lorsque l'on veut par exemple afficher d'autres information au niveau de l'entête du tableau
    */
    renderCustomMenu(){
        const customMenu = []
        Object.map(this.props.customMenu,(menu,i)=>{
            if(isObj(menu)){
                const {onPress,label,text,children,...rest} = menu;
                const args = {context:this,refresh:this.refresh.bind(this)};
                const lCB = defaultVal(children,label,text);
                const labelText = typeof lCB ==='function'? lCB(args) : lCB;
                if(labelText === false || !React.isValidElement(labelText,true)) return;
                customMenu.push({
                    ...rest,
                    label : labelText,
                    onPress : (event)=>{
                        if(typeof onPress =='function'){
                            return onPress({...React.getOnPressArgs(event),...args})
                        }
                    }
                })
            }
        });
        return customMenu;
    }
    /*** aller à la dernière page */
    _goToLastPage(){
        let { start,limit} = this._pagination;
        let numPages = this.countPages();
        if(numPages <=1) return;
        this.handlePagination((numPages-1)*this._pagination.limit, this._pagination.limit, numPages);
    }

    _decrement(){
        let { start,limit,page, } = this._pagination;
        let newStart = Math.max(0, start - limit);
        let nextPage = page - 1;
        if(nextPage < 1) nextPage = 1;
        this.handlePagination(newStart, limit, nextPage);
    };

    /*** retourne la liste du nombre de pages */
    countPages()
    {
        return Math.ceil(this.INITIAL_STATE.data.length / this._pagination.limit);
    }


    /*** lorsqu'on clique sur la ligne */
    onRowPress (row,rowIndex,event){
        if(isFunction(this.props.onRowPress)){
            this.props.onRowPress.call(this,{row,allData:this.INITIAL_STATE.data,rowIndex,event,props:this.props,context:this});
        }
    }
    /** lorsqu'on double click sur la ligne */
    onRowDoubleClick(row,rowIndex,event){
        if(isFunction(this.props.onRowDoubleClick)){
            this.props.onRowDoubleClick.call(this,{row,allData:this.INITIAL_STATE.data,rowIndex,event,props:this,context:this});
        }
    }

    /*** aller à la première page */
    _goToFirstPage(){
        this.handlePagination(0, this._pagination.limit, 1);
    }

    _setRowsPerPage (value) {
        if(isObj(value) && isDecimal(value.value)){
            value = value.value;
        }
        value = defaultDecimal(value);
        this.handlePagination(0, value, 1);
    };
   isFilterable(){
        return this.props.filterable !== false && this.props.filters !== false ? true : false;
   }
   toggleFilters(showFilters,cb){
        if(!this._isMounted() || !this.isFilterable()) {
            this.isUpdating = false;
            return;
        }
        if(typeof showFilters !=='boolean' || showFilters === this.state.showFilters) return;
        if(this.isUpdating) return false;
        this.isUpdating = true;
        setTimeout(()=>{
            this.setState( {showFilters},()=>{
                this.isUpdating = false;
                this.setSessionData({showFilters});
            })
        },TIMEOUT);
   }
   showFilters(){
       return this.toggleFilters(true);
   }
    hideFilters (){
       return this.toggleFilters(false);
   }

    toggleFooters(showOrHide){
        if(typeof showOrHide !=='boolean' || this.canShowFooters() === showOrHide) return;
        if(!this._isMounted()) {
            this.isUpdating = false;
            return;
        }
        if(this.isUpdating) return false;
        this.isUpdating = true;
        setTimeout(()=>{
            if(this.hasSectionListData() && this.getSectionListDataSize()){
                return this.setIsLoading(true,()=>{
                    this.prepareData({data:this.INITIAL_STATE.data},(state)=>{
                        this.setState({...state,showFooters:showOrHide},()=>{
                            this.isUpdating = false;
                            this.setSessionData({showFooters:showOrHide});
                        })
                    })
                },true)
            }
            this.setState( {showFooters:showOrHide},()=>{
                this.isUpdating = false;
                this.setSessionData({showFooters:showOrHide})
            })
        },TIMEOUT)
    }
    showFooters(){
        return this.toggleFooters(true);
    }
    hideFooters (){
        return this.toggleFooters(false);
    }
    setState(a,b){
        super.setState(a,b);
    }
   toggleFixedTableState(){
       setTimeout(()=>{
            this.setIsLoading(true,()=>{
                const fixedTable = !this.state.fixedTable;
                this.setState({fixedTable},()=>{
                    this.updateLayout();
                    this.setSessionData("fixedTable",fixedTable);
                })
            },true)
       },TIMEOUT)
   }
   getSessionNameKey (){
        return defaultStr(this.props.table,this.props.tableName,this.props.sessionName);
   }
   /*** affiche ou masque une colonne filtrée */
   toggleFilterColumnVisibility(field){
        if(!isNonNullString(field)) return;
        setTimeout(()=>{
            this.setIsLoading(true,()=>{
                let filteredColumns = {...this.state.filteredColumns};
                filteredColumns[field] = defaultBool(filteredColumns[field],false) == false ? true : false;
                this.prepareColumns({filteredColumns});
                this.setState({filteredColumns},()=>{
                    this.setSessionData("filteredColumns"+this.getSessionNameKey(),filteredColumns);
                    if(!filteredColumns[field]){
                        this.filters[field] = defaultObj(this.filters[field]);
                        this.filters[field].value = this.filters[field].defaultValue = undefined;
                        this.doFilter({value:undefined,field})
                    }
                });
            },true)
        },TIMEOUT)
    }
   /*** affiche ou masque une colonne */
   toggleColumnVisibility(field,removeFocus){
        if(!isNonNullString(field)) return;
        setTimeout(()=>{
            let columns = {...this.state.columns};
            columns[field].visible = !columns[field].visible;
            const footers = this.getFootersFields();
            if(isObj(footers[field])){
                footers[field].visible = columns[field].visible;
            }
            this.setIsLoading(true,()=>{
                this.prepareColumns({columns});
                this.setState({columns});
            })
        },TIMEOUT)
   }
   /****le nombre maximum de courbes supportées */
   getMaxSeriesSize(){
        return getMaxSupportedSeriesSize();
   }
   prepareFilter(props,filteredColumns){
        filteredColumns.push(props);
   }
   renderFilter(props){
       return <Filter {...props}/>
   }
   prepareColumn(){}
   beforePrepareColumns(){}
   renderEmpty(){
        if(typeof this.props.renderEmpty =='function'){
            const r = this.props.renderEmpty();
            return React.isValidElement(r)? r : null;
        }
        return null;
   }
   isSectionListColumnConfigurable(column){
        if(!isObj(column) || !isNonNullString(column.field) || !isObj(this.state.columns[column.field])){
            return false;
        }
        const type = defaultStr(column.jsType,column.type).toLowerCase();
        return type.contains("date") || type =='time' ? true : false;
   }
   setConfiguratedValue(key,value){
        const val = this.getConfiguratedValues();
        if(isObj(key)){
            extendObj(val,key);
        } else if(isNonNullString(key)){
            val[key] = value;
        }
        return this.setSessionData("configuratedSectionListColumns",val);
   }
   getConfiguratedValues(key){
     this.configureSectionListSelectedValues = defaultObj(this.getSessionData("configuratedSectionListColumns"),this.configureSectionListSelectedValues);
     if(isNonNullString(key)) return this.configureSectionListSelectedValues[key];
     return this.configureSectionListSelectedValues;
   }
   /*** configure la  */
   configureSectionListColumn(column,toggleSectionList){
        if(!this.isSectionListColumnConfigurable(column)) return Promise.reject({message : 'type de colonne invalide, impossible de configurer la colonne, pour permettre qu\elle soit ajoutée dans les colonnes de groupe du tableau'});
        const confV = defaultObj(this.getConfiguratedValues(column.field));
        const format = defaultStr(confV.format,column.format,"dd/mm/yyyy")
        return new Promise((resolve,reject)=>{
            DialogProvider.open({
                title : 'Format de date',
                subtitle : false,
                fields : {
                    dateFormat : {
                        type : 'select_dateformat',
                        required : true,
                        text : 'Sélectionnez un format de date',
                        defaultValue : format,
                    }
                },
                onCancelButtonPress : ()=>{
                    DialogProvider.close();
                    reject({msg:'aucun format sélectionné'})
                },
                actions : [{
                    text : "Sélectionnez",
                    icon : "check",
                    onPress : ({data})=>{
                        column.format = data.dateFormat;
                        this.setConfiguratedValue(column.field,{format:column.format}); 
                        DialogProvider.close();
                        setTimeout(()=>{
                            resolve(column);
                            if(toggleSectionList !== false){
                                this.toggleColumnInSectionList(column.field,true);
                            }
                        },100)
                    },
                }]
            })
        })
   }
   toggleColumnInSectionList(columnName,enable){
        if(!isNonNullString(columnName) || !isObj(this.state.columns[columnName])) return;
        if(!isObj(this.state.sectionListColumns) || !Array.isArray(this.preparedColumns?.sectionListColumnsMenuItems))return;
        const menuItems = this.preparedColumns?.sectionListColumnsMenuItems;
        if(!menuItems.length) return;
        setTimeout(()=>{
            this.setIsLoading(true,()=>{
                const sectionListColumns = {...this.state.sectionListColumns};
                if(enable !== true && isObj(sectionListColumns[columnName])){
                    delete sectionListColumns[columnName];
                } else {
                    sectionListColumns[columnName] = {field:columnName};
                }
                const {sectionListColumns:pSListColumns} = this.prepareColumns({sectionListColumns});
                this.prepareData({data:this.INITIAL_STATE.data,sectionListColumns:pSListColumns},(state)=>{
                    this.setState({...state,sectionListColumns:pSListColumns},()=>{
                        this.setSessionData("sectionListColumns",Object.keys(pSListColumns));
                    });
                });
            },true);
        },TIMEOUT);
   }
   removeAllColumnsInSectionList(){
        const {sectionListColumns} = this.prepareColumns({sectionListColumns:{}});
        this.setIsLoading(true,()=>{
            this.prepareData({data:this.INITIAL_STATE.data,sectionListColumns},(state)=>{
                this.setState({...state,sectionListColumns,displayOnlySectionListHeaders:false},()=>{
                    this.setSessionData("sectionListColumns",null);
                    this.setSessionData("displayOnlySectionListHeaders",false);
                });
            });
        },true);
   }
   canDisplayOnlySectionListHeaders(){
        return this.hasFootersFields() && this.isSectionList() && this.hasSectionListData();
   }
   /*** si l'on peut rendre le contenu de type graphique */
   isChartRendable(){
     return !this.isPivotDatagrid() && this.hasFootersFields();
   }
   isValidChartConfig(){
        const config = this.state.chartConfig;
        return isNonNullString(config.x) && isNonNullString(config.y);
   }
   canRenderChart(){
        return this.isChartRendable() && isNonNullString(this.state.displayType) && displayTypes[this.state.displayType]?.isChart === true ? true : false;
   }
   persistDisplayType(displayType){
    this.setSessionData("displayType",displayType);
   }
   /***modifie le type de données d'affichage du tableau */
   setDisplayType(type){
        if(!isObj(type) || !isNonNullString(type.code) || !displayTypes[type.code]) return;
        const tt = displayTypes[type.code];
        if(this.state.displayType == tt.code) return; 
        const displayType = tt.code;
        if(tt.code == 'table'){
            return this.setIsLoading(true,()=>{
                this.setState({displayType},()=>{
                    this.persistDisplayType(displayType);
                });
            },true)
        } else {
            const cb = (chartConfig)=>{
                setTimeout(()=>{
                    this.setIsLoading(true,()=>{
                        this.setState({chartConfig,displayType},()=>{
                            this.persistDisplayType(displayType);
                        })
                    },true);
                },200);
            }
            if(!this.isValidChartConfig()){
                return this.configureChart(false).then((chartConfig)=>{
                    cb(chartConfig);
                });
            }
            cb({...this.state.chartConfig});
        }
   }
   getActiveAggregatorFunction(){
        if(isNonNullString(this.state.aggregatorFunction) && this.aggregatorFunctions[this.state.aggregatorFunction]){
            return this.aggregatorFunctions[this.state.aggregatorFunction]
        }
        return this.aggregatorFunctions[Object.keys(this.aggregatorFunctions)[0]];
   }
   toggleAbreviateValues(){
        setTimeout(()=>{
            this.setIsLoading(true,()=>{
                this.prepareData({data:this.INITIAL_STATE.data},(state)=>{
                    const abreviateValues = !this.state.abreviateValues;
                    this.setState({abreviateValues,...state},()=>{
                        this.setSessionData("abreviateValues",abreviateValues);
                    })
                });
            },true);
        },TIMEOUT);
   }
   /**** récupère l'item de menu permettant lié à la sélection de la fonction d'aggggrégation */
   getAggregatorFunctionsMenuItems(withDivider){
        if(!this.hasFootersFields()) return [];
        const m = [];
        const aggregatorFunction = this.getActiveAggregatorFunction().code;
        Object.map(this.aggregatorFunctions,(ag)=>{
            const active = ag.code == aggregatorFunction;
            m.push({
                ...ag,
                icon : active?"check":null,
                onPress : active ? undefined : ()=>{
                    this.toggleActiveAggregatorFunction(ag);
                }
            })
        });
        m.push({divider:true});
        m.push({text:"Abréger les valeurs numériques",textBold:!!this.state.abreviateValues,icon:this.state.abreviateValues?'check':null,onPress:this.toggleAbreviateValues.bind(this)})
        if(m.length){
            m.unshift({
                text : "Fonctions d'aggrégation",
                icon : "material-functions",
                style : [{fontWeight:'bold'}],
                //divider : true,
            });
            if(withDivider !== false){
                m.unshift({divider:true});
            }
            if(withDivider !== false){
                m[m.length-1].divider = true;
            }
        }
        return m;
   }
   toggleActiveAggregatorFunction(ag){
        if(!isValidAggregator(ag) || ag.code == this.state.aggregatorFunction) return null;
        setTimeout(()=>{
            this.setIsLoading(true,()=>{
                this.prepareData({data:this.INITIAL_STATE.data,aggregatorFunction:ag.code},(state)=>{
                    this.setState(state,()=>{
                        this.setSessionData("aggregatorFunction",ag.code);
                    })
                })
            },true);
        },TIMEOUT);
   }
   formatValue(value,format){
        return formatValue(value,format,this.state.abreviateValues);
    }
   renderAggregatorFunctionsMenu(){
        const m = this.getAggregatorFunctionsMenuItems(false,false);
        if(!m.length) return null;
        return <Menu
            items = {m}
            anchor = {(props)=>{
                return <Pressable {...props} style={[theme.styles.row]}>
                    <Icon {...props} name="material-functions" title = "Fonctions d'aggrégations. Veuillez sélectionner la fonction à utiliser par défaut pour la totalisation des données des colonnes de type nombre"></Icon>
                    {this.isDashboard() && <Label splitText numberOfLines={1} textBold>Fonction d'aggrégation</Label>||null}
                 </Pressable>
            }}
        />
   }
   configureSectionLists(){
        const config = this.getChartConfig();
        return new Promise((resolve)=>{
            DialogProvider.open({
                title : "Paramètres de groupe",
                data : config,
                fields : {
                    displayGroupLabels : {
                        type : "switch",
                        text  : "Afficher les libelés de groupées",
                        tooltip : "Afficher/Masquer les noms de colonnes sur les entêtes des valeurs groupées",
                        defaultValue : 1,
                    },
                    displayGroupLabelsSeparator : {
                        type : "text",
                        label : "Séparateur de valeurs d'entêtes",
                        title : "Définisser un séparateur pour les valeurs d'entêtes de groupe, lorsque le tableau est groupé par plusieurs colonnes",
                        defaultValue : ", "
                    },
                },
                actions : [
                    {
                        text : "Configurer",
                        icon : "check",
                        onPress : ({data})=>{
                            const chartConfig = {...config,...data};
                            this.setSessionData("chartConfig",chartConfig);
                            DialogProvider.close();
                            this.setIsLoading(true,true);
                            this.prepareData({data:this.INITIAL_STATE.data,config:chartConfig},(state)=>{
                                this.setState({...state,chartConfig},()=>{
                                    resolve(chartConfig)
                                })
                            })
                        }
                    }
                ]
            })
        })
   }
   configureChart(refreshChart){
        if(!this.isChartRendable()){
            return Promise.reject({message:'Impossible de configurer le graphe car le type de données ne permet pas de rendu de type graphe'});
        }
        const xItems = {},yItems = {},config = defaultObj(this.state.chartConfig);
        const series = {},seriesGroups = {};
        const footers = this.getFootersFields();
        const isValidConfig = this.isValidChartConfig();
        Object.map(this.state.columns,(field,f)=>{
            if(isObj(field) && !this.isSelectableColumn(field) && !this.isIndexColumn(field)){
                const type = defaultStr(field.jsType,field.type).toLowerCase();
                if(type === 'number' || type=='decimal'){
                    yItems[f] = field;
                    series[f] = field;
                    if(isObj(footers[f])){
                        seriesGroups[f] = field;
                    }
                } else {
                    xItems[f] = field;
                }
            }
        });
        const onValidatorValid = ({context,value})=>{
            if(context && value){
                const name = context.getName();
                const isHorizontal = name =="x";
                const oContext = context.getField(isHorizontal ? "y" : "x");
                if(!oContext) return;
                const v2 = oContext.getValue()
                if(v2 === value){
                    return "la valeur du champ [{0}] doit être différent de celle du champ [{1}]".sprintf(context.getLabel(),oContext.getLabel())
                }
                oContext.validate({value:v2,context:oContext});
            }
        }
        return new Promise((resolve,reject)=>{
            const data = this.getChartConfig();
            DialogProvider.open({
                title : 'Configuration des graphes',
                subtitle : false,
                data,
                fields : {
                    x : {
                        text : 'Axe des x[horizontal]',
                        type : "select",
                        required : true,
                        items : xItems,
                        defaultValue : config.x,
                        onValidatorValid,
                    },
                    y :  {
                        text : 'Axe des y[Vertical]',
                        type : "select",
                        required : true,
                        items : yItems,
                        defaultValue : config.y,
                        onValidatorValid,
                    },
                    series : {
                        text : 'Series',
                        type : "select",
                        items : series,
                        multiple : true,
                    },
                    sectionListHeadersSeries : {
                        text : "Series des données groupées",
                        type : "select",
                        items : seriesGroups,
                        multiple : true,
                    },
                    dataLabels : {
                        type : 'switch',
                        label : "Affich les etiquettes de valeurs",
                        checkedTooltip : "Les étiquettes de valeurs seront affichées sur le graphe",
                        checkedValue : true,
                        uncheckedValue : false,
                        defaultValue : this.isDashboard()? true : false,
                    },
                    abreviateValues : {
                        type : "switch",
                        label : "Abréger les valeurs numériques",
                        defaultValue : true,
                    },
                    showXaxis : {
                        type : "switch",
                        text : "Afficher l'axe des X",
                        type : "switch",
                        checkedValue : true,
                        uncheckedValue : false,
                        defaultValue : !this.isDashboard(),
                    },
                    showYaxis : {
                        type : "switch",
                        text : "Afficher l'axe des Y",
                        type : "switch",
                        checkedValue : true,
                        uncheckedValue : false,
                        defaultValue : !this.isDashboard(),
                    },
                    showLegend : {
                        type : "switch",
                        text : "Afficher la legende",
                        type : "switch",
                        checkedValue : true,
                        uncheckedValue : false,
                        defaultValue : !this.isDashboard(),
                    },
                    width : {
                        type : "number",
                        text : "Largeur du graphe",
                        tooltip : "Définissez la valeur 0 si vous voulez que le graphe occupe toute la largeur de con contenueur",
                        defaultValue : this.getDefaultChartWidth(),
                    },
                    height : {
                        type : "number",
                        text : "Hauteur du graphe",
                        validType : "numberGreaterThan[0]",
                        defaultValue : this.getDefaultChartHeight(),
                    },
                    stacked : stackSettings,
                    sparkline : {
                        type : 'switch',
                        text : "Sparkline",
                        checkedTooltip : "Le graphe a été définit pour être affiché dans un environnement petite surface",
                        checkedValue : true,
                        uncheckedValue : false,
                        settingKey : "chart",
                    },
                    title : {
                        text : "Titre du graphe",
                        format :'hashtag',
                    },
                    titleColor: {
                        text : "Couleur de titre",
                        type :"color",
                        format : "hashtag"
                    },
                    fileName : {
                        text : "Nom fichier en téléchargement",
                        format : "hashtag",
                        tooltip : "Veuillez spécifier le nom du fichier du graphe qui sera utilisée lors du téléchargement"
                    },
                },
                actions : [
                    {
                        text : "Configurer",
                        icon : "check",
                        onPress : ({data})=>{
                            const chartConfig = {...config,...data};
                            this.setSessionData("chartConfig",chartConfig);
                            DialogProvider.close();
                            if(!isValidConfig && refreshChart !== false){
                                return this.setState({chartConfig},()=>{
                                    resolve(chartConfig)
                                })
                            }
                            resolve(chartConfig);
                        }
                    }
                ]
            })
        })
   }
   getChartConfig(){
      return defaultObj(this.state.chartConfig);
   }
   getChartIsRendableArgs(){
        return {
            context:this,isSectionList:this.isSectionList(),hasSectionListData:this.hasSectionListData(),
            data : this.state.data,
            displayOnlySectionListHeaders : this.canDisplayOnlySectionListHeaders(),
        };
   }
   isDashboard(){
     return false;
   }
   /*** télécharge le chart actif */
   downloadChart(){
        if(!this.chartRef.current || !this.chartRef.current.dataURI) return Promise.reject({message:'Référence du graphique non valide'});
        return this.chartRef.current.dataURI().then(({ imgURI, blob })=>{
            const config = this.getChartConfig();
            const fileName = sprintf(defaultStr(config.fileName,config.title,"graphe"));
            FileSystem.write({content:imgURI,fileName})
        });
    }
   ///reoturne les options de menus à appliquer sur le char
   getChartMenus(){
        return  [
            {
                text : "Options du graphe",
                textBold : true,
                divider:true,
            },
            {
                text :"Télécharger",
                icon : "download",
                onPress : this.downloadChart.bind(this),
            }
        ]
   }
   getExportableFields(){
        return {
            fileName : {
                text : "Nom du fichier",
                format : "hashtag",
                required : true,
            },
            displayTotals : {
                type : "switch",
                label : "Exporter les entêtes des groupes",
                defaultValue :1,
            },
            /*abreviateValues : {
                text : "Abréger les valeurs numériques",
                type : "switch",
            },*/
            dateFormat : {
                text : "Format des dates",
                type : "dateFormat",
                required : true,
                defaultValue : DateLib.defaultDateFormat,
            },
        }
   }
   /***@see : https://docs.sheetjs.com/docs/api/utilities */
   exportToExcel(){
        const skey = "export-to-excel";
        const isOnlytotal = this.state.displayOnlySectionListHeaders;
        let displayOnlyHeader = this.canDisplayOnlySectionListHeaders() && isOnlytotal;
        const sData = defaultObj(this.getSessionData(skey));
        return DialogProvider.open({
            title : "Paramètre d'export excel",
            data : sData,
            fields : {
                ...this.getExportableFields(),
                sheetName : {
                    label : 'Nom de la feuille excel',
                    format : "hashtag",
                    required : true,
                },
                exportOnlyTotal : displayOnlyHeader && {
                    label : "Exporter uniquemnt les totaux",
                    defaultValue : 0,
                    type : "switch",
                },
                aggregatedValues : displayOnlyHeader ? {
                    label : "Exporter uniquement les totaux aggrégées",
                    defaultValue : 0,
                    type : "switch",
                }  : null,
                addEmptyRowAfterTotal : {
                    
                },
            },
            actions : [{text:'Exporter',icon : "check"}],
            onSuccess:({data:config})=>{
                this.setSessionData(skey,config);
                config.fileName = sprintf(config.fileName);
                config.sheetName = sanitizeSheetName(config.sheetName);
                const data = [];
                let totalColumns = 0;
                const cols = {};
                DialogProvider.close();
                Preloader.open("préparation des données...");
                const footers = this.getFooters();
                if(displayOnlyHeader && config.aggregatedValues){
                    const fValues = this.getFooterValues();
                    const headers = ["Fonction d'agrégation"];
                    const aggregatorFunctions = this.aggregatorFunctions;
                    Object.map(footers,(f,i)=>{
                        const col = this.state.columns[i];
                        if(!col || col.visible === false) return;
                        headers.push(defaultStr(col.label,col.text));
                        cols[i] = col;
                    });
                    data.push(headers);
                    Object.map(aggregatorFunctions,(ag,i)=>{
                        const d = [defaultStr(ag.label,ag.text,i)];
                        Object.map(fValues,(footer,field)=>{
                            if(!cols[field]) return;
                            d.push(defaultNumber(footer[i]))
                        });
                        data.push(d);
                    })
                } else {
                    const headers = [];
                    const hFooters = defaultObj(this.sectionListHeaderFooters);
                    const agFunc = this.state.aggregatorFunction;
                    const canExportOnlyTotal = isOnlytotal || (config.exportOnlyTotal && displayOnlyHeader);
                    if(canExportOnlyTotal){
                        headers.push("");
                    }
                    Object.map(this.state.columns,(col,i)=>{
                        if(!isObj(col) || col.visible === false || this.isSelectableColumn(col,i) || i === this.getIndexColumnName()) return;
                        if(canExportOnlyTotal && !(i in footers)) return;
                        cols[i] = col;
                        headers.push(defaultStr(col.label,col.text));
                        totalColumns++;
                    })
                    data.push(headers);
                    Object.map(this.state.data,(dat,index)=>{
                        ///si l'on a a faire à une colonne de type entete
                        const d = [];
                        if(dat.isSectionListHeader){
                            if(!config.displayTotals && !canExportOnlyTotal) return;
                            const {sectionListHeaderKey:key} = dat;
                            const val = key === this.emptySectionListHeaderValue ? this.getEmptySectionListHeaderValue() : key;
                            d.push(val);
                            if(!canExportOnlyTotal){
                                for(let i = 1;i<totalColumns;i++){
                                    d.push(null);
                                }
                                data.push(d);
                            } else {
                                const hF = hFooters[key];
                                if(isObj(hF) && isNonNullString(agFunc)){
                                    const dd = [];
                                    Object.map(cols,(col,i)=>{
                                        if(i in hF){
                                                const ff = hF[i];
                                                dd.push(defaultNumber(ff[agFunc]));
                                            } else {
                                                dd.push(null);
                                            }
                                    });
                                    if(canExportOnlyTotal){
                                        dd.unshift(val);
                                        data.push(dd);
                                    } else {
                                        data.push(d);
                                        data.push(dd);
                                    }
                                } else {
                                    data.push(d);
                                }
                            }
                            
                            
                        } else if(!canExportOnlyTotal) {
                            Object.map(cols,(col,i)=>{
                                const isDateField = defaultStr(col.type).toLowerCase().contains("date");
                                d.push(this.renderRowCell({
                                    data : dat,
                                    rowData : dat,
                                    rowCounterIndex : index,
                                    rowIndex : index,
                                    formatValue : false,
                                    renderRowCell : false,
                                    columnField : defaultStr(col.field,i),
                                    columnDef :{
                                        ...col,
                                        ...(isDateField?{format:config.dateFormat}:{})
                                    }
                                }));
                            })   
                            data.push(d);
                        }
                    });
                }
                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.aoa_to_sheet(data);
                XLSX.utils.book_append_sheet(wb, ws, config.sheetName);
                FileSystem.writeExcel({...config,workbook:wb}).then(({path})=>{
                    if(isNonNullString(path)){
                        notify.success("Fichier enregistré dans le répertoire {0}".sprintf(path))
                    }
                 }).finally(()=>{
                    Preloader.close();
                })
            }
        })
   }
   exportToPdf(){

   }
   renderExportableMenu(){
        if(this.isDashboard() || !defaultStr(this.state.displayType).toLowerCase().contains("table")) return null;
        const items = [];
        if(this.canExportToExcel()){
            items.push({
                text : "Exporter au format excel",
                icon : "file-excel",
                onPress: this.exportToExcel.bind(this),
            })
        }
        if(false && this.canExportToPDF()){
            items.push({
                text : "Exporter au format pdf",
                icon : "file-pdf-box",
                onPress : this.exportToPdf.bind(this)
            })
        }
        if(!items.length) return null;
        if(!this.isAccordion()){
            items.unshift({
                text : "Exporter les données",
                divider : true,
                textBold : true,
                icon : "export",
            })
        }
        return <Menu
            items = {items}
            title ="Export des données du tableau"
            anchor = {(a)=>{
                return <Icon title = {"Exporter les données du tableau"} {...a} name={"export"}/>
            }}
        />
   }
   renderDisplayTypes(){
        const m = [];
        let activeType = null,hasFoundChart = false,hasFoundTable = false;
        const hasConfig = this.isValidChartConfig();
        Object.map(this.displayTypes,(type,k)=>{
            let isChartDisabled = false;
            if(type.isChart === true ) {
                if(!this.isChartRendable()){
                    return null;
                }
                isChartDisabled = typeof type.isRendable =='function' && type.isRendable(this.getChartIsRendableArgs()) === false ? true : false;
                if(!hasFoundChart){
                    if(hasFoundTable){
                        m.push({divider:true});
                    }
                    hasFoundChart = true;
                    m.push({
                        divider : true,
                        text : "Configurer les graphes",
                        icon :"material-settings",
                        onPress : ()=>{
                            this.configureChart(false).then((chartConfig)=>{
                                this.setIsLoading(true,()=>{
                                    this.setState({chartConfig});
                                },true)
                            })
                        }
                    });
                }
            } else if(k === 'table'){
                hasFoundTable = true;
            }
            const active = this.state.displayType === k;
            if(active){
                activeType = type;
            }
            m.push({
                ...type,
                labelStyle : active &&  {fontWeight:'bold',color:theme.colors.primaryOnSurface} || null,
                right : <>
                    {active ? <Icon color={theme.colors.primaryOnSurface} name="check"/>: null}
                </>,
                disabled : isChartDisabled || type.isChart && !hasConfig ? true : undefined,
                onPress:()=>{
                    this.setDisplayType(type); 
                }
            });
        });
        if(m.length <= 1 || !activeType) return null;
        if(!isMobileOrTabletMedia()){
            m.unshift({text:"Type d'affichage des données",divider:true,textBold:true});
        }
        if(hasFoundChart){
            Object.map(this.getChartMenus(),(c,i)=>{
                m.push(c);
            })
        }
        return <Menu
            title = {"Type d'affichage ["+activeType.label+"]"}
            items = {m}
            anchor = {(p)=>{
                return <Pressable {...p} style={[theme.styles.row]}>
                    <Icon
                        {...p}
                        name = {activeType.icon}
                        color = {theme.colors.primaryOnSurface}
                        title = {"Les données s'affichent actuellement en {0}. Cliquez pour modifier le type d'affichage".sprintf(activeType.label)}
                    />
                    {this.isDashboard() && <Label textBold primaryOnSurface>{activeType.label||"Type d'affichage"}</Label>||null}
                </Pressable>
            }}
        />
   }
   getEmptySectionListHeaderValue(){
        return defaultStr(this.props.sectionListHeaderEmptyValue,"N/A");
   }
   /*** retourne les sectionHeaderSeries par défautt */
   getDefaultSectionHeadersSeries(){
      if(!this.isSectionList() || !this.hasFootersFields()) return [];
      const footersFields = this.getFootersFields();
      const r = [],max = this.getMaxSeriesSize();
      let counter = 0;
      for(let i in footersFields){
            const footer = footersFields[i];
            if(!isObj(footer)) continue;
            if(counter >= max) break;
            r.push(i);
            counter ++;
      }
      return r;
   }
   formatChartDataValue({value,column,options}){
        return value;
   }
   /***** 
    *   retourne les paramètres à passer au chart, lorsque les données sont groupées, ie les sectionsListColumns est non nulle
    *   @param {object} de la forme suivante : 
    *       @param {object} chartType le type de chart, l'un des types du tableau displayTypes en haut du présent fichier
    *       @param {object} yAxisColumn la colonne de l'axe vertical y
    *       @param {object} xAxisColumn la colonne de l'axe des x de la courbe, pris dans les configurations du chart, chartConfig
    *       @param {object} la fonction d'aggrégation, l'une des fonctions issues des fonctions d'aggrégations aggregatorsFuncions, @see : dans $components/Datagrid/Footer
    *   en affichage des tableaux de type sectionList, seul les colonnes de totalisation sont utilisées pour l'affichage du graphe
    *   Le nombre de graphes (series) à afficher est valable pour tous les graphes sauf les graphes de type pie/donut. 
    *   il est récupéré dans la variable chartConfig des configuration du chart, où par défaut le nombre de colonnes de totalisation des tableau (inférieur au nombre maximum de courbes surpportées par appexchart)
    */
   getSectionListHeadersChartOptions({chartType,yAxisColumn,xAxisColumn,aggregatorFunction}){
        if(!this.isSectionList()) return null;
        if(!isObj(chartType) || !isObj(yAxisColumn) || !yAxisColumn.field) return null;
        if(!isValidAggregator(aggregatorFunction)){
            aggregatorFunction = this.getActiveAggregatorFunction();
        }
        const code = aggregatorFunction.code;
        const isDonut = chartType.isDonut || chartType.isRadial;
        const config = this.getChartConfig();
        //@see : https://apexcharts.com/docs/series/
        ///lorsqu'on affiche uniquement les totaux des sections, alors la visualition se fait sur uniquement sur la base des valeurs
        ///on parcoure uniquement les entêtes des sectionLis
        const dataIndexes={};
        //la variable sectionListHeaderSeries, permet de récupérer les colonnes de type montant à utiliser pour le rendu du chart
        const tableFooters = this.getFootersFields();
        const defaultSectionListHeadersSeries = this.getDefaultSectionHeadersSeries();
        let seriesConfig = isDonut ? [] : Array.isArray(config.sectionListHeadersSeries) && config.sectionListHeadersSeries.length ? config.sectionListHeadersSeries : [];
        if(!isDonut){
            if(seriesConfig.length){
                const ss = [];
                seriesConfig.map((s)=>{
                    if(!isNonNullString(s) || !tableFooters[s]) return null;
                    ss.push(s);
                });
                seriesConfig = ss;
            }
            if(!seriesConfig.length){
                seriesConfig = defaultSectionListHeadersSeries;
            }
        }
        /**** boucle sur chaque éléments trouvée dans le tableau des données sectionListData */
        const loopForFooter = ({column,serieName,footers,header})=>{
            if(!isObj(column) || !isObj(footers)) return null;
            if(!isObj(footers[column.field])) return null;
            const footer = footers[column.field];
            if(typeof footer[code] !== 'number') return null;
            if(typeof footer[code] !== 'number') return null;
            if(header === this.emptySectionListHeaderValue){
                header = this.getEmptySectionListHeaderValue();
            }
            if(isDonut){
                dataIndexes[header] = footer[code];
            } else {
                dataIndexes[serieName] = defaultArray(dataIndexes[serieName]);
                dataIndexes[serieName].push({x:header,y:footer[code]});
            }
        }
        Object.map(this.sectionListData,(data,header)=>{
            if(!isObj(this.sectionListHeaderFooters[header])) return null;
            const footers = this.sectionListHeaderFooters[header];
            if(isDonut){
                loopForFooter({footers,header,column:yAxisColumn,columnField:yAxisColumn.field})
            } else {
                seriesConfig.map((s)=>{
                    const serie = this.state.columns[s];
                    const serieName = defaultStr(serie.label,serie.text,s);
                    this.chartSeriesNamesColumnsMapping[serieName] =  serie;
                    loopForFooter({footers,serie,columnField:s,serieName,header,column:tableFooters[s]})
                })
            }
        });
        if(isDonut){
            const series = [],labels = [];
            Object.map(dataIndexes,(serie,index)=>{
                series.push(serie);
                labels.push(index);
            });
            return {
                name : defaultStr(yAxisColumn.label,yAxisColumn.text,yAxisColumn.field),
                series,
                labels,
            }
        } else {
            const series = [];
            Object.map(dataIndexes,(data,name)=>{
                series.push({name,data});
            });
            return {
                series
            }
        }
   }
   getDefaultChartHeight(){
        return defaultNumber(this.props.chartProps?.height,this.isDashboard()?80:350);
   }
   getDefaultChartWidth(){
        return defaultNumber(this.props.chartProps?.width);
   }
   /*** permet de formatter les valeurs de la courbe en fonction du type passé en paramètre */
   chartValueFormattter(value,columnType){
        
   }
   renderChart(){
        if(!this.canRenderChart()) return null;
        if(!this.isValidChartConfig()) return null;
        const chartType = displayTypes[this.state.displayType];
        if(!isObj(chartType) || !isNonNullString(chartType.type)) return null;
        if(typeof chartType.isRendable =='function' && chartType.isRendable(this.getChartIsRendableArgs()) === false) {
            //console.warn("impossible d'afficher le graphe de type ",chartType.label," car le type de données requis pour le rendu de ce graphe est invalide")
            return null;
        }
        const isDonut = chartType.isDonut || chartType.isRadial;
        const config = this.getChartConfig();
        if(!this.state.columns[config.y]) return null;
        const yAxisColumn = this.state.columns[config.y];
        const type = defaultStr(yAxisColumn.jsType,yAxisColumn.type).toLowerCase();
        if(type !== 'number'&& type !== 'decimal') return null;
        const isEmptyY = config.x === this.emptySectionListHeaderValue;
        let seriesConfig = Array.isArray(config.series) && config.series.length ? config.series : [yAxisColumn.field];
        const snConfig = [];
        Object.map(seriesConfig,(s,v)=>{
            if(!isNonNullString(s) || !this.state.columns[s]) return null;
            snConfig.push(s);
        });
        seriesConfig = snConfig.length> 0 ? snConfig : [yAxisColumn.field];
        let xAxisColumn = null;
        if(!isEmptyY){
            if(!this.state.columns[config.x]){
                return null;
            }
            xAxisColumn = this.state.columns[config.x];
        }
        const aggregatorFunction = this.getActiveAggregatorFunction().eval;
        const emptyValue = this.getEmptySectionListHeaderValue();
        const indexes = {};
        let series = [],xaxis = {},customConfig = {};
        let count = 0;
        //on réinitialise le mappage entre les index
        Object.map(this.chartSeriesNamesColumnsMapping,(_,k)=>{
            delete this.chartSeriesNamesColumnsMapping[k];
        });
        if(!this.isSectionList()){
            const sColumns = {};
            Object.map(seriesConfig,(s,v)=>{
                if(!isNonNullString(s) || !this.state.columns[s]) return null;
                const columnDef = this.state.columns[s];
                if(!isObj(columnDef)) return null;
                sColumns[s] = columnDef;
            })
            this.state.data.map((data,index)=>{
                if(!isObj(data))return null;
                const txt = this.renderRowCell({
                    data,
                    rowData : data,
                    rowCounterIndex : index,
                    rowIndex : index,
                    columnDef : xAxisColumn,
                    renderRowCell : false,
                    columnField : xAxisColumn.field,
                });
                const text = isNonNullString(txt)? txt : emptyValue;
                Object.map(sColumns,(columnDef,s)=>{
                    indexes[s] = defaultObj(indexes[s]);
                    const current = indexes[s];
                    current[text] =  typeof current[text] =="number"? current[text] : 0;
                    const value = getFooterColumnValue({data,columnDef,columnField:columnDef.field});
                    const rArgs = aggregatorFunction =='average'?{sum:current[text]+value,count:count+1} : {};
                    current[text] = aggregatorFunction({value,total:current[text],data,columnDef,columnField:columnDef.field,count,...rArgs});
                });
            });
            Object.map(indexes,(values,serieName)=>{
                const col = this.state.columns[serieName];
                const name = defaultStr(col?.label,col?.text,serieName),data = [];
                Object.map(values,(v,i)=>{
                    data.push({
                        x : i,
                        y : v,
                    })
                })
                series.push({
                    name,
                    type : chartType.type,
                    data,
                })
                this.chartSeriesNamesColumnsMapping[name] = col;
            })
        } else {
            const configs = this.getSectionListHeadersChartOptions({chartType,aggregatorFunction,xAxisColumn,yAxisColumn});
            if(isObj(configs)){
                const {series :customSeries,xaxis:customXaxis,...rest} = configs;
                series = Array.isArray(customSeries) ? customSeries : series;
                xaxis = isObj(customXaxis)? customXaxis : xaxis;
                customConfig = rest;
            } else {
                return null;
            }
        }
        customConfig = defaultObj(customConfig);
        customConfig.chart = defaultObj(customConfig.chart);
        const chartProps = extendObj(true,{},this.props.chartProps,customConfig);
        const settings = defaultObj(chartType.settings);
        Object.map(settings,(s,key)=>{
            if(!isObj(s) || !(key in config)) return null;
            const settingKey = defaultStr(s.settingKey,"chart");
            chartProps[settingKey] = defaultObj(chartProps[settingKey]);
            chartProps[settingKey][key] = config[key];
        });
        const mappedColumns = {};
        const abreviateValues = defaultVal(config.abreviateValues,true) || this.state.abreviateValues;
        const dataLabelFormatter = typeof chartProps.dataLabels?.formatter =="function"? chartProps.dataLabels.formatter : undefined;
        const chartOptions = {
            ...chartProps,
            dataLabels : extendObj(true,{enabled:!this.isDashboard()},chartProps.dataLabels,{
                formatter : (value, { seriesIndex, dataPointIndex, w })=> {
                    const serie = w.config.series[seriesIndex];
                    const serieName = serie.name;
                    const column = mappedColumns[seriesIndex] || isDonut ? defaultObj((this.state.columns[yAxisColumn.field],yAxisColumn)): defaultObj(this.chartSeriesNamesColumnsMapping[serieName]);
                    if((column) && column.field){
                        mappedColumns[seriesIndex] = column;
                    }
                    const columnField = defaultStr(column.field, isDonut? config.y : undefined);
                    if(dataLabelFormatter){
                        return dataLabelFormatter({value,column,columnDef:column,columnField,serie,serieName,seriesIndex})
                    }
                    return this.formatValue(value,column.format);
                }
            }),
            title :extendObj(true,{}, {
                text: defaultStr(config.title,chartProps.title),
                align: 'left',
                //margin: 10,
                //offsetX: 0,
                //offsetY: 0,
                //floating: false,
                style: {
                  //fontSize:  '14px',
                  //fontWeight:  'bold',
                  //fontFamily:  undefined,
                  color: theme.Colors.isValid(config.titleColor)?config.titleColor : undefined,
                },
            },chartProps.title),
            series,
            chart : extendObj(true,{},
                {toolbar : {show : false}},
                chartProps.chart,
                {
                    height : defaultNumber(config.height,this.getDefaultChartHeight()),
                    width : defaultNumber(config.width) || this.getDefaultChartWidth() || undefined,
                    type : chartType.type
                },
            )
        }
        const labelColor = theme.Colors.isValid(config.labelColor)? config.labelColor : theme.colors.text; 
        if(!isDonut){
            chartOptions.xaxis = extendObj(true,{},{type: 'category'},chartProps.xaxis,{xaxis});
            const xLabels = chartOptions.xaxis.labels = defaultObj(chartOptions.xaxis.labels);
            xLabels.style = defaultObj(xLabels.style)
            xLabels.style.colors = (Array.isArray(xLabels.style.colors) && xLabels.style.colors.length || theme.Colors.isValid(xLabels.style.colors)) ? xLabels.style.colors : labelColor;
        } else {
            delete chartOptions.xaxis;
            //delete chartOptions.yaxis;
        }
        chartOptions.yaxis = extendObj(true,{},{type: 'category'},defaultObj(chartProps.yaxis));
        const yLabels = chartOptions.yaxis.labels = defaultObj(chartOptions.yaxis.labels);
        yLabels.style = defaultObj(yLabels.style)
        yLabels.style.colors = (Array.isArray(yLabels.style.colors) && yLabels.style.colors.length || theme.Colors.isValid(yLabels.style.colors)) ? yLabels.style.colors : labelColor;
        const yLabelsSerieName = series?.length == 1 && series[0] && series[0].name ? series[0].name : undefined;
        const yLabelsColumn = yLabelsSerieName ? this.chartSeriesNamesColumnsMapping[yLabelsSerieName] : undefined;
        let yLabelFormat = null;
        if(!isDonut && !yLabelFormat){
            for(let i in series){
                const v = series[i];
                if(!isObj(v) || !isNonNullString(v.name) || !this.chartSeriesNamesColumnsMapping[v.name]) break;
                if(yLabelFormat && this.chartSeriesNamesColumnsMapping[v.name]?.format !=yLabelFormat) {
                    yLabelFormat = null;
                    break;
                }
                if(!yLabelFormat){
                    yLabelFormat = this.chartSeriesNamesColumnsMapping[v.name]?.format;
                }
            }
        }
        yLabels.formatter = (value)=>{
            const format = (yLabelFormat =='money' || (isDonut && yAxisColumn.format =="money")) || (yLabelsColumn && yLabelsColumn.format =='money') ? 'money' : '';
            return this.formatValue(value,format);
        }
        chartOptions.chart.id = this.chartIdPrefix+"-"+defaultStr(chartType.key,"no-key");
        if(!chartType.isDonut){
            delete chartOptions.labels;
        }
        if(this.isDashboard() && typeof chartOptions.chart.sparkline !=='boolean'){
            chartOptions.chart.sparkline = true;
        }
        if(chartOptions.chart.sparkline){
            chartOptions.chart.sparkline = {enabled: true}
        } else delete chartOptions.chart.sparkline;
        //const spackLine = chartOptions.chart.sparkline;
        chartOptions.xaxis = defaultObj(chartOptions.xaxis);
        chartOptions.xaxis.labels = defaultObj(chartOptions.xaxis.labels);
        chartOptions.xaxis.labels.show  = ("showXaxis" in config) ? !!config.showXaxis : !this.isDashboard();
        
        chartOptions.yaxis.labels = defaultObj(chartOptions.yaxis.labels);
        chartOptions.yaxis.labels.show = ("showYaxis" in config) ? !!config.showYaxis : !this.isDashboard();
        
        chartOptions.legend = defaultObj(chartOptions.legend);
        chartOptions.legend.show = ("showLegend" in config) ? !!config.showLegend : !this.isDashboard();

        if("dataLabels" in config){
            chartOptions.dataLabels.enabled = !!config.dataLabels;
        }
        return <Chart
            options = {chartOptions}
            ref = {this.chartRef}
            onRender = {this.onRender.bind(this)}
            key = {chartOptions.chart.id+"-"+this.state.displayType}
        />
   }
   canShowFooters(){
      return this.state.showFooters || this.hasSectionListData() && this.state.displayOnlySectionListHeaders;
   }
   canShowFilters(){
        return this.state.showFilters
   }
   toggleDisplayOnlySectionListHeaders(){
        if(!this.canDisplayOnlySectionListHeaders()) return
        setTimeout(()=>{
            const showFooters = true;
            const displayOnlySectionListHeaders = !!!this.state.displayOnlySectionListHeaders;
            this.setSessionData("displayOnlySectionListHeaders",displayOnlySectionListHeaders);
            if(!displayOnlySectionListHeaders){
                return this.setIsLoading(true,()=>{
                    this.prepareData({data:this.INITIAL_STATE.data,displayOnlySectionListHeaders},(state)=>{
                        this.setState({...state,showFooters});
                    })
                })
            } else {
                this.setIsLoading(true,()=>{
                    const data = [];
                    this.state.data.map((d)=>{
                        if(isObj(d) && d.isSectionListHeader === true){
                            data.push(d);
                        }
                    });
                    this.setState({data,displayOnlySectionListHeaders,showFooters});
                },true)
            }
        },0);
   }
   /*** permet d'effectuer le rendu des colonnes groupable dans le menu item */
   renderSectionListMenu(){
        const m = Array.isArray(this.preparedColumns?.sectionListColumnsMenuItems)? this.preparedColumns?.sectionListColumnsMenuItems : [];
        const mm = [];
        Object.map(m,(_)=>{
            mm.push({
                ..._,
                items : undefined,
            })
        })
        if(!mm.length){
            return null;
        }
        const hasList = this.sectionListColumnsSize.current;
        return <Menu
            title = {"Grouper les données du tableau"}
            testID = {"RN_DatagridSectionListMenu"}
            anchor = {(props)=>{
                return <Pressable {...props} style={[theme.styles.row]}>
                    <Icon {...props} color={hasList?theme.colors.primaryOnSurface:undefined} name='format-list-group' title={"Grouper les éléments du tableau"}></Icon>
                    {this.isDashboard() && <Label style={[hasList && {color:theme.colors.primaryOnSurface}]} textBold>Grouper par</Label>||null}
                 </Pressable>
            }}
            items = {[
                {
                    text : "Grouper par",
                    icon : "group",
                    closeOnPress : false,
                    divider : true,
                    style : theme.styles.bold,
                    onPress : this.configureSectionLists.bind(this),
                },
                this.canDisplayOnlySectionListHeaders() && this.state.displayType =='table' && {
                    text : "Afficher uniquement totaux",
                    icon : this.state.displayOnlySectionListHeaders?"check":null,
                    onPress : this.toggleDisplayOnlySectionListHeaders.bind(this)
                },
                hasList && {
                    text : "Supprimer les groupes",
                    icon: "ungroup",
                    divider : true,
                    onPress : ()=>{
                        setTimeout(()=>{
                            this.removeAllColumnsInSectionList();
                        },100)
                    }
                },
                ...mm,
            ]}
        />
   }
   prepareColumns (args){
       this.beforePrepareColumns();
       args = defaultObj(args);
       const sectionListColumns = {};
       const sListColumns = isObj(args.sectionListColumns) ? args.sectionListColumns : this.getSectionListColumns();
       const filteredColumns = isObjOrArray(args.filteredColumns)?args.filteredColumns : isObjOrArray(this.state.filteredColumns) ? this.state.filteredColumns : {};
       const columns = args.columns || this.state.columns;
       const currentSortedColumn = isObj(args.sortedColumn) && args.sortedColumn.column? args.sortedColumn : defaultObj(this.sortRef.current);
       const visibleColumns = [],headerFilters = [],visibleColumnsNames={};
       const sectionListColumnsMenuItems = [],filterableColumnsNames = [];
       const sortable = defaultBool(this.props.sortable,true);
       const sortedColumns = {};
       let sortedColumnsLength = 0;
       let sortedColumn = {icon:"sort"}
       let filters = defaultBool(this.props.filters,true);
       if(this.props.toggleFilters ===false){
           filters = false;
       }
       let {filterOrOperator,filterAndOperator} = this.props;
       const widths = {};
       let totalWidths = 0;
       let columnIndex = 0,visibleColumnIndex=0;
       this.sectionListColumnsSize.current = 0;
       /*** la props widht de la colonne peut être en pourcentage
        * l'on peut également définir la valeur minWidth en entier qui représentera la longuer minimale du champ
        * la props fitWidth permet de dire que le champ devra occuper l'espace restant sur la page
        */
       Object.map(columns,(header,headerIndex) => {
            let {
                field,
                render,
                readOnly,
                disabled,
                visible,
                defaultValue,
                id,
                key,
                sortType,
                width,
                ...restCol
            } = header;
            restCol = Object.clone(defaultObj(restCol));
            let colFilter = defaultVal(restCol.filter,true);
            field = header.field = defaultStr(header.field,field,headerIndex);
            delete restCol.filter;
            
            const type = defaultStr(header.jsType,header.type,"text").toLowerCase();
            sortType = defaultStr(sortType,type).toLowerCase();
            if(typeof width =='string' && width.contains("%")){
                width = ((parseFloat(width.replaceAll(" ","").split('%')[0].trim())|0)*windowWidth)/100;
            }
            width = defaultDecimal(width);
            if(width <COLUMN_WIDTH/2){
                width = COLUMN_WIDTH;
            }
            if(type.contains("date")|| type.contains("time")){
                const mWidth = type.toLowerCase().contains('datetime')? (DATE_COLUMN_WIDTH+30) : DATE_COLUMN_WIDTH;
                width = Math.max(width,mWidth);
            } else if((type.contains("number") || type.contains("decimal") && this.props.format)){
                width = Math.max(width,DATE_COLUMN_WIDTH-30);
            } else if(type == "tel"){
                width = Math.max(width,DATE_COLUMN_WIDTH)
            } else if(type =="select_country" || type =='selectcountry'){
                width = Math.max(width,90);
            }
            if(typeof restCol.minWidth =='number'){
                width = Math.max(width,minWidth);
            }
            totalWidths +=width;
            widths[header.field] = width;
            const colProps = {id,key}
            colProps.key = isNonNullString(key)?key : (header.field||("datagrid-column-header-"+headerIndex))
            colProps.style = Object.assign({},StyleSheet.flatten(restCol.style));
            if(!visible){
                colProps.style.display = 'none';
            }
            const title = header.text = header.text || header.label || header.title||header.field
            visibleColumnsNames[header.field] = visible ? true : false;
           
            visibleColumns.push({
                onPress : ()=>{
                    setTimeout(() => {
                        this.toggleColumnVisibility(header.field);
                    },100);
                    return false;
                },
                title : title,
                icon : visible?CHECKED_ICON_NAME : null,
            });
            restCol.field = header.field;
            
            restCol.label = defaultStr(header.text,header.label) ;
            restCol.type = type;
            if(!restCol.label){
                console.error(header," has not label or text in datagrid",columns,this.props)
            }
            let isColumnSortable = false,isColumnSorted = false;
            if(sortable && header.sortable !== false){
                isColumnSortable = true;
                if(currentSortedColumn.column ==field){
                    isColumnSorted = true;
                    sortedColumn.field = currentSortedColumn.column;
                    sortedColumn.header = header;
                    sortedColumn.label = restCol.label;
                    const isDesc = currentSortedColumn.dir === "desc";
                    const sortDir = isDesc ? "descending" : "ascending";
                    const prefix = (sortType =='number' || sortType == 'decimal') ? "numeric" : sortType =='boolean'?'bool' : sortType.contains('date') ? 'calendar': sortType =='time'? 'clock' : 'alphabetical'; 
                    sortedColumn.icon = 'sort-'+prefix+'-'+sortDir;
                    sortedColumn.title = (isDesc ? "Trié par ordre décroissant":"Trié par ordre croissant ")+ " du champ ["+restCol.label+"]";
                    if(sortType.contains('date') || sortType.contains("time")){
                        sortedColumn.title = "le champ {0} est actuellement trié du plus {1} au plus {2}".sprintf(restCol.label,isDesc?"récent":"ancien",isDesc?"ancien":"récent")
                    } 
                }      
                sortedColumns[field] = restCol.label;
                sortedColumnsLength++;
            }
            
            colFilter = colFilter && filters !== false ? true : false;
            const sortedProps =  isColumnSorted ? {...sortedColumn} : {};
            let filterProps = {};
            if(colFilter){
                const fCol = defaultObj(this.filters[header.field]);
                this.filters[header.field] = fCol;
                filterableColumnsNames.push(header.field);
                delete restCol.sortable;
                filterProps = {
                    ...restCol,
                    type,
                    columnIndex,
                    visibleColumnIndex,
                    sortable:isColumnSortable,
                    sorted:isColumnSorted,
                    sortedColumn :sortedProps,///les props de la columns triée
                    sortedProps,
                    width,
                    columnField : field,
                    columnDef : header,
                    index : headerIndex,
                    visible,
                    key : header.field,
                    label : defaultStr(header.label,header.text),
                    orOperator : filterOrOperator,
                    andOperator : filterAndOperator,
                    searchIconTooltip : 'Filtre',
                    searchIcon : 'filter_list',  
                    defaultValue : defaultVal(fCol.defaultValue,restCol.defaultValue),
                    name : header.field,
                    onClearFilter : this.onClearFilter.bind(this),
                    onChange : this.onFilterChange.bind(this),
                    operator : fCol.operator,
                    action : defaultStr(fCol.originAction,fCol.action),
                };
                this.currentFilteringColumns[header.field] = filterProps;
                this.prepareFilter(filterProps,headerFilters); 
            }
            this.prepareColumn({
                visible,
                type,
                columnIndex,
                visibleColumnIndex,
                sortable:isColumnSortable,
                sorted:isColumnSorted,
                sortedColumn :sortedProps,///les props de la columns triée
                sortedProps,
                props:{...restCol,...colProps},
                field,
                width,
                columnField : field,
                columnDef : header,
                index : headerIndex,
                filterProps,
                key : header.field,
                filter :colFilter, 
            },headerFilters)
            
            if(this.props.groupable !== false && header.groupable !== false && !this.isSelectableColumn(header,header.field) && !this.isIndexColumn(header,header.field)){
                const isInSectionListHeader = isObj(sListColumns[field]);
                if(isInSectionListHeader){
                    sectionListColumns[field] = {
                        ...header,
                         width,
                         type,
                         ...sListColumns[field],
                         ...defaultObj(this.getConfiguratedValues(field)),
                    };///les colonnes de sections
                    this.sectionListColumnsSize.current++;
                }
                const mItem = {
                    ...header,
                    field,
                    type,
                    onPress : ()=>{
                        this.toggleColumnInSectionList(field);
                        return false;
                    },
                    title : title,
                    icon : isInSectionListHeader?CHECKED_ICON_NAME : null,
                };
                if(this.isSectionListColumnConfigurable(mItem)){
                    mItem.right = (p)=>{
                        return <Icon name="material-settings" {...p} onPress={(e)=>{
                            //React.stopEventPropagation(e);
                            this.configureSectionListColumn({...mItem,...defaultObj(sectionListColumns[field])});
                            //return false;
                        }}/>
                    }
                }
                sectionListColumnsMenuItems.push(mItem);
            }
            columnIndex++;
            visibleColumnIndex++;
            
        })
        this.preparedColumns.sortedColumns = sortedColumns;
        this.preparedColumns.sortedColumn = sortedColumn;
        this.preparedColumns.sortedColumnsLength = sortedColumnsLength;
        this.preparedColumns.visibleColumns = visibleColumns;
        this.preparedColumns.visibleColumnsNames = visibleColumnsNames;
        this.preparedColumns.filters = headerFilters;
        this.preparedColumns.filteredColumns = filteredColumns;
        this.preparedColumns.widths = widths;
        this.preparedColumns.totalWidths = totalWidths;
        this.preparedColumns.sectionListColumns = sectionListColumns;
        this.preparedColumns.sectionListColumnsMenuItems = sectionListColumnsMenuItems;
        this.preparedColumns.filterableColumnsNames = filterableColumnsNames;
        return this.preparedColumns;
   }
   getPaginatedSelectedRows(data){
        data = isArray(data)? data : this.INITIAL_STATE.data;
        if(JSON.stringify(this._previousSortObj) !== JSON.stringify(this.sortRef.current) || JSON.stringify(this._previousPagination) !== JSON.stringify(this._pagination) && this.getPaginatedData().length !== data.length){
            return {};
        }
        return this.selectedRows;
   }
   getFooterValues(){
        return defaultObj(this.___evaluatedFootersValues);
   }

   /**** s'il s'agit d'une section list */
   isSectionList (sectionListColumns){
        sectionListColumns = isObj(sectionListColumns) ? sectionListColumns : this.state.sectionListColumns;
        return !this.isPivotDatagrid() && isObj(sectionListColumns) && Object.size(sectionListColumns,true) ? true : false;
   }
   /**** si le datagrid admet les sectionDatas */
   hasSectionListData(){
    return this.hasFoundSectionData.current;
   }
   /*** vérifie si l'on a la colonne passée en paramètre */
   hasColumn(column){
        column = isObj(column)? defaultStr(column.field) : defaultStr(column);
        if(!column) return false;
        return isObj(this.state.columns) && this.state.columns[column]&& true || false;
   }
    formatSectionListHeader(sectionListHeader){
        if(!isNonNullString(sectionListHeader)) return "";
        if(this.props.sectoonListHeaderUpperCase !== false){
            sectionListHeader = sectionListHeader.toUpperCase();
        }
        return sectionListHeader.trim();
    }
    getSectionListDataSize(){
        return defaultNumber(this.sectionListDataSize.current)
    }
    prepareData(args,cb){
        let {pagination,config,aggregatorFunction:customAggregatorFunction,displayOnlySectionListHeaders:cdisplayOnlySectionListHeaders,data,force,sectionListColumns,updateFooters} = defaultObj(args);
        cb = typeof cb ==='function'? cb : typeof args.cb == 'function'? args.cb : undefined;
        config = isObj(config) && Object.size(config,true)? config : this.getChartConfig();
        const aggregatorFunction = isNonNullString(customAggregatorFunction) && customAggregatorFunction in  this.aggregatorFunctions ? this.aggregatorFunctions[customAggregatorFunction] : this.getActiveAggregatorFunction();
        sectionListColumns = isObj(sectionListColumns) ? sectionListColumns : this.state.sectionListColumns;
        const displayOnlySectionListHeaders = typeof cdisplayOnlySectionListHeaders == 'boolean'?cdisplayOnlySectionListHeaders : this.state.displayOnlySectionListHeaders;
        let isArr = Array.isArray(data);
        //let push = (d,index) => isArr ? newData.push(d) : newData[index] = d;
        const hasLocalFilter = this.props.filters !== false && this.hasLocalFilters;
        const footersColumns = this.getFootersFields(),hasFootersFields = this.hasFootersFields();
        const canUpdateFooters = !!(updateFooters !== false && hasFootersFields);
        this.hasFoundSectionData.current = false;
        this.sectionListDataSize.current = 0;
        const isSList = this.isSectionList(sectionListColumns);
        const sortingField = isNonNullString(this.sortRef.current.column) && isObj(this.state.columns) && this.state.columns[this.sortRef.current.column] || {};
        const hasSortField = Object.size(sortingField,true);
        if(this.canAutoSort() && isNonNullString(this.sortRef.current.column) && hasSortField){
            let field = sortingField;
            const sortConfig = Object.assign({},this.sortRef.current);
            sortConfig.getItem = (item,columnName,{getItem})=>{
                if(isObj(item) && (field.type =='decimal' || field.type =="number")){
                    const v = item[columnName];
                    return isDecimal(v)? v : isNonNullString(v)? parseDecimal(v) : 0;
                }
                return getItem(item,columnName);
            }
            data = sortBy(data,sortConfig);//on trie tout d'abord les données
        }
        if(hasLocalFilter || !isArr || canUpdateFooters || isSList) {
            if(canUpdateFooters){
                this.___evaluatedFootersValues = {}
            }
            const newData = [];
            const columns = sectionListColumns;
            const sectionListColumnsSize = this.sectionListColumnsSize.current;
            const hasSectionColumns = this.sectionListColumnsSize.current > 0;
            if(isSList){
                Object.map(this.sectionListData,(v,i)=>{
                    delete this.sectionListData[i];
                });
                if(canUpdateFooters){
                    //on réinnitialise tous les footes
                    Object.map(this.sectionListHeaderFooters,(v,i)=>{
                        delete this.sectionListHeaderFooters[i];
                    })
                }
            }
            let currentSectionListFooter = null;
            let sectionListData = {};//l'ensemble des données de sectionList
            Object.map(data,(d,i,rowIndex)=>{
                if(!isObj(d) || (hasLocalFilter && this.doLocalFilter({rowData:d,rowIndex:i}) === false)){
                    return;
                }
                if(hasSectionColumns){
                    let sHeader = this.getSectionListHeader({config,data:d,columnsLength : sectionListColumnsSize,fieldsSize:sectionListColumnsSize,sectionListColumnsLength:sectionListColumnsSize,sectionListColumnsSize,allData:data,rowData:d,index:i,rowIndex,context:this,columns,fields:columns});
                    if(sHeader === false) return;//on omet la donnée si la fonction de récupération de son header retourne false
                    if(!isNonNullString(sHeader) || sHeader.toLowerCase().trim() =="undefined"){
                        if(this.props.ignoreEmptySectionListHeader !== false){
                            sHeader = this.emptySectionListHeaderValue;
                        } else return;
                    }
                    let r  = this.formatSectionListHeader(sHeader);
                    if(!Array.isArray(sectionListData[r])){
                        sectionListData[r] = [];
                        this.sectionListDataSize.current++;
                    }
                    sectionListData[r].push(d); 
                    if(canUpdateFooters){
                        ///garde pour chaque éléments de groue, la valeur des champs de son footer
                        this.sectionListHeaderFooters[r] = defaultObj(this.sectionListHeaderFooters[r]);
                        currentSectionListFooter = this.sectionListHeaderFooters[r];
                    }
                    this.hasFoundSectionData.current = true;
                }

                if(canUpdateFooters){
                    const result = [this.___evaluatedFootersValues]
                    if(currentSectionListFooter){
                        result.push(currentSectionListFooter);
                    }
                    Object.map(footersColumns,(columnDef,field)=>{
                        evalSingleValue({data:d,aggregatorFunction,aggregatorFunctions:this.aggregatorFunctions,columnDef,field,result,displayLabel:false})
                    });
                }
                newData.push(d);
                //push(d,i);
            });
            if(this.hasFoundSectionData.current && hasSortField && defaultStr(sortingField.type).toLowerCase().contains("date")){
                DateLib.sort(Object.keys(sectionListData)).map((k)=>{
                    this.sectionListData[k] = sectionListData[k];
                    return k;
                });
            } else {
                Object.map(sectionListData,(v,k)=>{
                    this.sectionListData[k] = v;
                })
            }
            data = newData;
        } 
        this.INITIAL_STATE.data = data;
        if(this.hasFoundSectionData.current){
            data = [];
            for(let i in this.sectionListData){
                //this.sectionListData[i] = sortConfig ? sortBy(this.sectionListData[i],sortConfig):this.sectionListData[i];
                //const v = i;// === this.emptySectionListHeaderValue ? "" : i;
                data.push({isSectionListHeader:true,sectionListHeaderKey:i});
                if(!displayOnlySectionListHeaders){
                    this.sectionListData[i].map((d)=>{
                        data.push(d);
                    })
                }
            }
        } 
        if(!this.hasSectionListData() && this.canPaginateData()){
            pagination = this.initPagination(pagination);
            pagination.rows = data.length;    
            this._pagination = pagination;
            data = this.pagin(data,pagination.start,pagination.limit,pagination.page);
            this.setSelectedRows(this.getPaginatedSelectedRows(data));
        } else if(force){
            this.setSelectedRows();
        }
        const state = {data,displayOnlySectionListHeaders,aggregatorFunction:aggregatorFunction.code};
        if((cb)){
            cb(state);
        }
        return state;
    }
    getSectionListHeader(args){
        if(this.getSectionListHeaderProp){
           return this.getSectionListHeaderProp(args);
        }
        const chartConfig = isObj(args.config) && Object.size(args.config,true)? args.config : this.getChartConfig();
        const displayGroupLabels = "displayGroupLabels" in chartConfig? chartConfig.displayGroupLabels : true;
        const displayGroupLabelsSeparator = typeof chartConfig.displayGroupLabelsSeparator =='string'? chartConfig.displayGroupLabelsSeparator : arrayValueSeparator;
        const {fields,sectionListColumnsSize} = args;
        const d = [];
        Object.map(fields,(field,i)=>{
            const txt = this.renderRowCell({
                ...args,
                columnDef : field,
                renderRowCell : false,
                isSectionListHeader : true,
                columnField : defaultStr(field.field,i),
            });
            if(!isNonNullString(txt) && typeof txt !=='number') return;
            if(sectionListColumnsSize == 1 || !displayGroupLabels){
                d.push(txt);
            } else {
                d.push("{0} : {1}".sprintf(defaultStr(field.label,field.txt),txt))
            }
        });
        return d.length ? d.join(displayGroupLabelsSeparator) : undefined;
     }
    /*** retourne le type d'item à rendre à la fonction flashlist 
     * @see : https://shopify.github.io/flash-list/docs/guides/section-list
    */
    getFlashListItemType(item){
        return typeof item === "string" || isObj(item) && item.isSectionListHeader === true ? "sectionHeader" : "row";;
    }
    /****permet de faire le rendu flashlist */
    renderFlashListItem(args){
        if(!this.hasSectionListData()) return null;
        args = defaultObj(args);
        let {item,rowProps,rowStyle} = args;
        if(!isObj(item) || item.isSectionListHeader !== true || !isNonNullString(item.sectionListHeaderKey)) return null;
        args.isAccordion = this.isAccordion();
        args.columns = this.preparedColumns.visibleColumns;
        args.columnsNames = this.preparedColumns.visibleColumnsNames;
        const key = item.sectionListHeaderKey;
        const label = key === this.emptySectionListHeaderValue ? this.getEmptySectionListHeaderValue() : key;
        const style = typeof this.props.getSectionListHeaderStyle =='function' ? this.props.getSectionListHeaderStyle(args) : null;
        const cStyle = typeof this.props.getSectionListHeaderContentContainerStyle =="function" ?this.props.getSectionListHeaderContentContainerStyle(args) : undefined;
        const lStyle = typeof this.props.getSectionListHeaderLabelStyle =='function' ? this.props.getSectionListHeaderLabelStyle(args) : null;
        
        rowProps = defaultObj(rowProps);
        const rowKey = defaultVal(args.rowIndex,args.index,args.rowCounterIndex);
        const testID  = rowProps.testID = defaultStr(args.testID,"RN_DatagridSectionListHeader")+"_"+rowKey;
        if(Array.isArray(rowStyle)){
            if(style){
                rowStyle.push(style);
            }
        }
        let cells = null;
        const isA = this.isAccordion();
        if(this.canShowFooters() && isObj(this.sectionListHeaderFooters[key])){
            const {visibleColumnsNames,widths} = defaultObj(this.preparedColumns);
            if(isObj(visibleColumnsNames) &&isObj(widths)){
                cells = [];
                const footers = this.sectionListHeaderFooters[key];
                Object.map(visibleColumnsNames,(v,column)=>{
                    if(!v || typeof widths[column] !== 'number') {
                        return null;
                    }
                    if(!column) return null;
                    const width = widths[column];
                    const key2 = key+column;
                    if(!this.state.columns[column] || !footers[column]) {
                        if(this.isAccordion()) return null;
                        cells.push(<View key={key2} testID={testID+"_FooterCellContainer_"+key2} style={[tableStyles.headerItemOrCell,{width}]}></View>)
                    } else {
                        const footer = footers[column];
                        cells.push(<View key={key2} testID={testID+"_FooterCellContainer_"+key2} style={[tableStyles.headerItemOrCell,!isA?{width,alignItems:'flex-start',justifyContent:'flex-start'}:{marginLeft:0,paddingLeft:0,marginRight:5}]}>
                            <Footer
                                key = {key2}
                                testID={testID+"_FooterItem_"+key2}
                                {...footer}
                                abreviate = {this.state.abreviateValues}
                                aggregatorFunction = {this.getActiveAggregatorFunction().code}
                                aggregatorFunctions = {this.aggregatorFunctions}
                                displayLabel = {this.isAccordion()}
                                //anchorProps = {{style:[theme.styles.ph1,theme.styles.mh05]}}
                            />  
                        </View>)
                    }
                });
            }
        }
        return <View testID={testID+"_ContentContainer"}  style={[theme.styles.w100,isA && this.state.displayOnlySectionListHeaders && {borderTopColor:theme.colors.divider,borderTopWidth:1},isA ? [theme.styles.ph2,theme.styles.pt1] : [theme.styles.pt1,theme.styles.ph1],theme.styles.justifyContentCenter,theme.styles.alignItemsCenter,theme.styles.pb1,!cells && theme.styles.ml1,theme.styles.mr1,cStyle]}>
            <Label testID={testID+"_Label"} splitText numberOfLines={3} textBold style={[theme.styles.w100,{color:theme.colors.primaryOnSurface,fontSize:isA?15 :16},lStyle]}>{label}</Label>
            {cells ? <View testID={testID+"_TableRow"} style = {[theme.styles.w100,theme.styles.row,isA && theme.styles.pt1,theme.styles.alignItemsFlexStart,this.isAccordion() && theme.styles.rowWrap]}
            >{cells}</View> : null}
        </View>
    }
    isRowSelected(rowKey,rowIndex){
        if(isObj(rowKey)){
            rowKey = this.getRowKey(rowKey,rowIndex);
        }
        if(isObj(this.selectedRows[rowKey])) return true;
        if(typeof rowKey !=='string' && typeof rowKey !=='number' || !isObj(this.selectedRowsRefs[rowKey])) return false;
        return !!this.selectedRowsRefs[rowKey].checked;
    }
   /*** permet de définir les lignes sélectionnées du datagrid */
   setSelectedRows (rows){
       let obj = this.selectedRows;
       this.selectedRowsCount = 0;
       Object.getOwnPropertyNames(obj).forEach((prop)=> {
            delete obj[prop];
            const sRowRef = this.selectedRowsRefs[prop];
            if(isObj(sRowRef) && sRowRef.check && sRowRef.uncheck){
                sRowRef.uncheck(false);
            }
       });
       Object.map(rows,(row,i)=>{
            if(this.canSelectRow(row)) {
                const rowKey = this.getRowKey(row,i);
                this.selectedRowsCount++;
                this.selectedRows[rowKey] = row;
                const sRowRef = this.selectedRowsRefs[rowKey];
                if(isObj(sRowRef) && sRowRef.check && sRowRef.uncheck){
                    sRowRef.check(false);
                }
            }
        });
        this.toggleSelectableColumnCheckbox();
       return this.selectedRows;
   }
   

    getProgressBar(props){
        if(typeof props !=='object' || !props){
            props = {};
        }
        const ProgressBar = this.props.progressBar;
        const children = React.isValidElement(ProgressBar) ? ProgressBar : 
            this.props.useLinesProgressBar === true || this.props.useLineProgressBar === true ? CommonDatagridComponent.LineProgressBar(props)
            : React.isComponent(ProgressBar) ?<ProgressBar/> : this.getDefaultPreloader(props);
        return <DatagridProgressBar
            {...props}
            onChange = {(context)=>{
                this.isLoadingRef.current = context.isLoading;
            }}
            isLoading = {defaultBool(this.props.isLoading,this.isLoading())}
            children = {children}  
            ref = {this.progressBarRef}
        />
    }
    handlePagination(start, limit, page) {
        this._previousPagination = this._pagination;
        this._pagination = {
            start,
            limit,
            page,
            rows : this.INITIAL_STATE.data.length
        }
        let data = this.pagin(this.INITIAL_STATE.data,start, limit,page)
        this.setSelectedRows(this.getPaginatedSelectedRows());
        this.setState({data},()=>{
            setTimeout(()=>{
                this.setSessionData({paginationLimit:limit})
            },1)
        });
    };

    ///supprime tous les filtres s'ils existenent
    _clearAllFilters (){
        this.isClearingAllFilters = true;
        let filters = {};
        let defValue = undefined;
        Object.map(this.filters,(f,i)=>{
            if(!isObj(f)) return;
            defValue = undefined;
            if(f.type =="select") defValue = [];
            filters[i] = {...f,value:defValue,defaultValue:defValue}
        });
        Object.map(this.filteredValues,(v,i)=>{
            delete this.filteredValues[i];
        })
        this.filters = filters;
        this.refresh(true);
        this.isClearingAllFilters = false;
    }
    clearAllFilters(){
        if(isObj(this.state.filteredColumns)){
            let filteredColumns = {...this.state.filteredColumns};
            for(let k in filteredColumns){
                filteredColumns[k] = false;
            }
            this.prepareColumns({filteredColumns});
            this.setState({filteredColumns},()=>{
                this.setSessionData("filteredColumns"+this.getSessionNameKey(),{});
                this._clearAllFilters();
            })
        } else {
            this._clearAllFilters();
        }
    }
    onClearFilter (arg){
        return;
        let {field,name,type} = defaultObj(arg);
        field = defaultStr(field,name);
        if(field){
            let v = defaultStr(type).toLowerCase() == "select"? []:undefined
            this.filters[field] = {value:v,defaultValue:v}
            this.doFilter({value:v,field,force:true})
        }
    }
    /*** si la valeur de filtre peut être utilisée */
    canHandleFilterVal(f){
        return canHandleFilter(f);
    }
    onFilterChange(arg){
        this.filteredValues = defaultObj(this.filteredValues);
        let {field,operator,originAction,action,value} = defaultObj(arg);     
        const filter = isNonNullString(field)? this.currentFilteringColumns[field] : null;   
        if(!isObj(filter)) return;
        if(isNonNullString(operator) && isNonNullString(action)){
            this.filteredValues[field] = {
                operator,action,value,field
            }
            filter.defaultValue = arg.defaultValue;
            filter.operator = operator;
            filter.action = defaultStr(originAction,action);            
        } 
        if(this.isClearingAllFilters) return;
        return this.doFilter(arg);
    }
    ///si les filtres devront être convertis au format SQL
    willConvertFiltersToSQL(){
        return !!defaultVal(this.props.convertFiltersToSQL,willConvertFiltersToSQL());;
    }
    /*** retourne la liste des colonnes sur lesquelles on peut effectuer un filtre*/
    getFilterableColumnsNames(){ 
        const {filterableColumnsNames} = defaultObj(this.preparedColumns);
        return Array.isArray(filterableColumnsNames)? filterableColumnsNames : [];
    }
    /*** récupère les filtres en cours du datagrid
     * @param {boolean} prepare si les filtres seront apprêtés grace à la méthode prepareFilters de $cFilters 
     * @param {boolean} convertFiltersToSQL si les filtres seront convertis au formatSQL
     */
    getFilters(args){
        args = defaultObj(args);
        const prepare = typeof args.prepare =='boolean'? args.prepare : typeof args.prepareFilters =='boolean' ? args.prepareFilters : true;
        this.filters = extendObj(true,{},this.filteredValues,this.filters);
        const convertFiltersToSQL = typeof args.convertToSQL =="boolean"? args.convertToSQL : typeof args.convertFiltersToSQL =="boolean"? args.convertFiltersToSQL : false;
        if(prepare === false) return this.filters;
        return prepareFilters(this.filters,{filter:this.canHandleFilterVal.bind(this),convertToSQL:convertFiltersToSQL});
    }
    hasFilters (){
        if(!this.isFilterable()) return false;
        const filters = this.getFilters({prepare:false});
        for(let i in filters){
            if(isObj(filters[i]) && filters[i].field && 'value' in filters[i]) return true;
        }
        return false;
    }
    renderFiltersMenu(forceD){
        if(!this.isFilterable()) return null;
        const  showFilters = this.canShowFilters();
        const anchor = p=> forceD !== true && isMobileOrTabletMedia()? <Icon
            icon = "filter-plus"
            {...p}
        /> :<Button
            normal
            children = "Filtres"
            icon = "filter-plus"
            {...p}
            style={theme.styles.mh05}
            contentStyle = {[theme.styles.justifyContentFlexStart]}
        />;
        const toggleItem = {
            icon : showFilters?'eye-off':'eye',
            children : showFilters?'Masquer/Filtres':'Afficher/Filtres',
            onPress : x => showFilters?this.hideFilters():this.showFilters(),
        }
        if(false && this.hasFilters()){
             return  <Menu
                anchor = {anchor}
                items = {[
                   toggleItem,
                   {
                     text : "Tout effacer",
                     icon : "filter-remove",
                     onPress : this.clearAllFilters.bind(this),
                   } 
                ]}
            />
        }
        return anchor(toggleItem)
    }
    onChangeDataSources(args){
        let {dataSources,server} = args;
        if(this.props.onChangeDataSources =='function' && this.props.onChangeDataSources({dataSources,prev:this.currentDataSources}) === false) return;
        this.currentDataSources = dataSources;
        this.setSessionData({selectedDatabases:dataSources}) 
        if(JSON.stringify({dataSources:this.previousDataSources}) != JSON.stringify({dataSources})){
            if(isObj(this.props.dataSourceSelectorProps) && isFunction(this.props.dataSourceSelectorProps.onChange)){
                args.datagridContext = this;
                this.props.dataSourceSelectorProps.onChange(args);
            }
            this.refresh(true);
        } 
        this.previousDataSources = dataSources;
        this.previousServer = server;
    }
    beforeFetchData(){}
    fetchData({fetchOptions}){
        if(typeof this.props.fetchData =='function'){
            const r = this.props.fetchData(fetchOptions);
            if(isPromise(r)){
                return r.then((data)=>{
                    if(isObjOrArray(data)){
                        this.setIsLoading(true,()=>{
                            this.prepareData({data},(state)=>{
                                this.setState(state)
                            })
                        },true)
                    }
                })
            }
        }
        return Promise.resolve(this.state.data);
    }
    /****  Filtre le tableau */
    doFilter ({value,field,selector,event,force}){
        if(!this._isMounted()) return;
        this.canDoFilter = false;
        selector = defaultObj(selector);
        field = defaultStr(field,selector.field);
        if(!isNonNullString(field)) return;
        let prevVal = defaultObj(this.filters[field]);
        this.filters[field] = {...selector,value,event};
        if(force !== true){
            let newVal = this.filters[field];
            let prev = {action : prevVal.action,value:prevVal.value,operator:prevVal.operator},
                current = {action : newVal.action,value:newVal.value,operator:newVal.operator}
                if(isObjOrArray(current.value)){
                    current.value = JSON.stringify(current.value);
                }
                if(isObjOrArray(prev.value)){
                    prev.value = JSON.stringify(prev.value);
                }
            if((prev.action === undefined && prev.value === undefined && prev.operator === undefined && (value === undefined || value === '' || value === null)) || (JSON.stringify(prev) === JSON.stringify(current) && prev.value == current.value)){
                return Promise.resolve([]);
            }
        }
        if(this.canPaginateData()){
            this._pagination = defaultObj(this._pagination);
            this._pagination.page = 1;
            this._pagination.start = 0;
        }
        this.filtersSelectors = {selector:this.getFilters()};
        return this.fetchData({force:true,isFiltering : true,fetchOptions:this.filtersSelectors});
    }
    onSetQueryLimit(){
        if(!this.canSetQueryLimit()) return;
        const current = this.currentDatagridQueryLimit;
        const cValue = this.getQueryLimit();
        if(cValue == current) return;
        this.refresh(true);
    }
    setQueryLimit(){
        if(!this.canHandleQueryLimit()) return;
        this.currentDatagridQueryLimit = this.getSessionData("dataSourceQueryLimit");
        setQueryLimit(this.currentDatagridQueryLimit,(limit)=>{
            this.setSessionData("dataSourceQueryLimit",limit)
            notify.success("Le nombre maximal d'élément à récuperer par page a été définit à la valeur "+(limit==0?" infinit ":limit.formatNumber())+". Cette valeur sera prise en compte à la prochaine réactualisation du tableau")
        });
    }
    
    canSetQueryLimit(){
        return this.canHandleQueryLimit() && isDecimal(this.props.queryLimit) && (this.props.queryLimit >=0) ? false : true;
    }
    getQueryLimit(){
        if(isDecimal(this.props.queryLimit) && (this.props.queryLimit >=0)) return this.props.queryLimit 
        let sLimit = this.getSessionData("dataSourceQueryLimit");
        if(isDecimal(sLimit) && sLimit >= 0) return sLimit;
        return 0;
    }
    canHandleQueryLimit(){
        if(typeof this.props.handleQueryLimit ==='boolean'){
            return this.props.handleQueryLimit;
        }
        return true;
    }
    renderQueryLimit(content){
        if(!this.canHandleQueryLimit()) return null;
        let cLImit = this.getQueryLimit();
        if(cLImit == 0) cLImit = " infinit"
        let s = "";
        let canSetQ = this.canSetQueryLimit();
        if(canSetQ){
            s = ".\nPressez pendent quelques secondes pour modifier cette valeur du nombre limite d'éléments de la liste par page";
        }
        else if(isDecimal(cLImit)){
            cLImit = (" de "+cLImit.formatNumber())
        }
        content = isDecimal(content) || typeof content =="string" ? <Label primary textBold style={styles.queryLimit}>{content}</Label> : React.isValidElement(content)? content : null;
        return <Tooltip title={"Le nombre maximal d'éléments à récupérer depuis la base de données pour la liste est "+cLImit+s} Component={Label} cursorPointer={canSetQ}>
            <Pressable style={[theme.styles.row]} onLongPress={canSetQ?this.setQueryLimit.bind(this):undefined}>
                {content}
                {isDecimal(cLImit) && cLImit > 0 && <Label primary textBold style={styles.queryLimit}> | {cLImit.formatNumber()}</Label>}
            </Pressable>
       </Tooltip>
    }
    getFetchDataOpts(){
        return this.props.fetchDataOpts;
    }

    forceRefresh(){
        this.refresh(true);
    }
    /***retourne la hauteur maximale du composant FlashList */
    getMaxListHeight(){
        const {height:winheight} = Dimensions.get("window");
        const layout = defaultObj(this.layoutRef.current);
        let maxHeight = winheight-100;
        if(layout && typeof layout.windowHeight =='number' && layout.windowHeight){
            const diff = winheight - Math.max(defaultNumber(layout.y,layout.top),100);
            if(diff<=350){
                maxHeight = Math.max(Math.min(winheight,350),200);
            } else {
                maxHeight = diff;
            }
        }
        return maxHeight;
    }
    refresh (force,cb){
        if(isFunction(force)){
            let t = cb;
            cb = force;
            force = isBool(t)? t : true;
        }
        return new Promise((resolve,reject)=>{
            setTimeout(()=>{
                return this.fetchData({force:defaultBool(force,true)}).then((data)=>{
                    if(isFunction(cb)){
                        cb(data);
                    }
                    if(typeof this.props.onRefreshDatagrid ==='function'){
                        this.props.onRefreshDatagrid({context:this,force});
                    }
                }).then(resolve).catch(reject);
            },100);
        })
    }
    onResizePage(){
        this.updateLayout();
    }
    componentDidMount(){
        super.componentDidMount();
        APP.on(APP.EVENTS.RESIZE_PAGE,this._events.RESIZE_PAGE);
        APP.on(APP.EVENTS.SET_DATAGRID_QUERY_LIMIT,this._events.SET_DATAGRID_QUERY_LIMIT);
    }
    componentWillUnmount(){
        super.componentWillUnmount();
        APP.off(APP.EVENTS.RESIZE_PAGE,this._events.RESIZE_PAGE);
        APP.off(APP.EVENTS.SET_DATAGRID_QUERY_LIMIT,this._events.SET_DATAGRID_QUERY_LIMIT);
        this.clearEvents();
    }

    /*** s'il s'agit d'un datagrid virtualisé, ie à utiliser le composant react-base-table */
    isVirtual(){
        return false;
    }

    getRowKey(row,rowIndex){
        let k = rowIndex;
        const rowKey = this.props.rowKey;
        if(isNonNullString(rowKey) && isObj(row) && (isNonNullString(row[rowKey]) || isDecimal(row[rowKey]))){
            return row[rowKey];
        } 
        if(isFunction(this.props.getRowKey)){
            k = this.props.getRowKey({row,rowData:row,data:row,rowIndex,item:row,index:rowIndex,context:this});
        } else if(isObj(row)){
            return React.getKey(row,rowIndex);
        } else k = rowIndex;
        if(isObj(row) && isNonNullString(row.rowKey)){
            k +=row.rowKey;
        }
        return isDecimal(k) ? k : defaultStr(k,uniqid("row-key-datagrid"));
    }
    /*** récupère la plage de donnée visible au travers la pagination */
    getPaginatedData(){
        return Array.isArray(this.state.data)? this.state.data: []
    }
    /*** retourne le nombre maximal d'éléments sélectionnables */
    getMaxSelectedRows(){
        return 0;
    }
    ///retourne la longueur réelle du nombre d'éléments du tableau en excluant les valerus d'entêtes de section
    getStateDataSize(includeSectionListDataSize){
        const dSize = defaultNumber(this.state.data.length);
        if(!dSize) return 0;
        if(includeSectionListDataSize === false) return dSize;
        return Math.max(dSize - this.getSectionListDataSize(),0);
    }
    getMaxSelectableRows(){
        let max = this.getMaxSelectedRows();
        const dataSize = this.getStateDataSize();
        if(dataSize){
            max = max ? Math.min(max,dataSize,max) : dataSize;
        }
        return Math.max(max-this.getSectionListDataSize(),0);
    }
    canSetIsLoading(){
        return isObj(this.progressBarRef.current) && typeof this.progressBarRef.current.setIsLoading =='function' ? true : false;
    }
    onRender(){
        if(this.isRenderingRef.current === true){
            setTimeout(()=>{
                this.isRenderingRef.current = false;
                return this.setIsLoading(false,undefined,undefined,"yes mannnnaaaaaa");
            },500);
        }
    }
    /***
     * @param {boolean} loading
     * @param {function | boolean} cb | enablePointerEvents
     * @param {boolean|function} enablePointerEvents
     */
    setIsLoading (loading,cb,enablePointerEvents,timeout){
        if(typeof cb =='boolean'){
            const t = enablePointerEvents;
            enablePointerEvents = cb;
            cb = t;
        }
        if(typeof enablePointerEvents =='boolean'){
            this.enablePointerEventsRef.current = enablePointerEvents;
        }
        timeout = typeof timeout =='number'? timeout : 500;
        cb = typeof cb =='function'? cb : x=>true;
        if(this.canSetIsLoading() && typeof loading =='boolean'){
            if(loading === true){
                this.isRenderingRef.current = true;
            } else if(this.isRenderingRef.current === true){
                  return setTimeout(cb,timeout);;
              }
               return this.progressBarRef.current.setIsLoading(loading,()=>{
                setTimeout(cb,timeout);
            });
        } else {
           setTimeout(cb,timeout);
        }
    }
     /**** met à jour l'état de progression de la mise à jour du tableau */
     updateProgress(isLoading,cb){
        this.isLoadingRef.current = defaultBool(isLoading,!!!this.isLoadingRef.current);
        cb = typeof cb =='function'?cb : typeof isLoading =='function'? isLoading : null
        if(isLoading){
            this.isRenderingRef.current = true;
        }
        if(this.canSetIsLoading()){
            return this.setIsLoading(isLoading,cb);
        }
        cb && setTimeout(() => {
            cb();
        }, 200);
    }
    isAllRowsSelected(update){
        return this.selectedRowsCount && this.selectedRowsCount === this.getMaxSelectableRows()? true : false;
    }
    getDefaultPaginationRowsPerPageItems (){
        return [5,10,15,20,25,30,40,50,60,80,100];
    }
    measureLayout(cb,force,layoutRef){
        cb = typeof cb === 'function'? cb : x=>x;
        layoutRef = layoutRef || this.layoutRef.current;
        return new Promise((resolve)=>{
            if(layoutRef && layoutRef.measureInWindow){
                layoutRef.measureInWindow((x, y, width, height) => {
                    const r = this.getLayoutState({ x, y, width, height },force);
                    cb(r);
                    resolve(r);
                });
            }
        })
    }
    getLayoutState(layout,force){
        layout = defaultObj(layout);
        const {width,height} = Dimensions.get("window");
        layout.windowWidth = width;
        layout.windowHeight = height;
        const prevLayout = defaultObj(this.state.layout)
        const prevY = Math.abs(defaultDecimal(prevLayout.y)-defaultDecimal(layout.y));
        const prevHeight = Math.abs(defaultDecimal(prevLayout.height)-defaultDecimal(layout.height));
        const prevWindowWidth = Math.abs(defaultDecimal(prevLayout.windowWidth)-defaultDecimal(layout.windowWidth));
        const prevWindowHeight = Math.abs(defaultDecimal(prevLayout.windowHeight)-defaultDecimal(layout.windowHeight));
        if(force !== true && prevY < 20 && prevHeight < 20 && prevWindowWidth <= 100 && prevWindowHeight <= 50) return null;
        return {
            layout,
        }
    }
    getPointerEvents(){
        if(this.enablePointerEventsRef.current) return true;
        if(this.props.isLoading){
            return "none";
        }
        return this.isLoading()? "none":"auto";
    }
    updateLayout(p){
        this.measureLayout(state=>{
            if(isObj(state)){
                this.layoutRef.current = state;
                return;
                if(!this.state.isReady){
                    state.isReady = true;
                }
                this.setState(state);
            }
        },isObj(p) && typeof p.force ==='boolean'?p.force : !this.state.isReady)
    }
    isTableData(){
        return false;
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        if((stableHash(nextProps.data) === stableHash(this.props.data))) {
            return false;
        }
        this.setIsLoading(true,true);
        this.prepareData({...nextProps,force:true},(state)=>{
            this.setState(state)
        });
    }
    getDefaultPreloader(props){
        return CommonDatagridComponent.getDefaultPreloader();
    }
    isLoading (){
        if(this.state.isReady === false || this.isRenderingRef.current) return true;
        if(typeof this.props.isLoading =='boolean') return this.props.isLoading;
        return this.isLoadingRef.current === true ? true : false;
    }
    getLinesProgressBar(){
        return CommonDatagridComponent.LinesProgressBar(this.props);
    }
    /*** si le datagrid sera sortable */
    isSortable(){
        return this.isDatagrid() && this.props.sortable !== false? true : false;
    }
    canAutoSort(){
        return this.isSortable() && this.props.autoSort !==false ? true : false;
    }
    isSelectable(){
        return this.props.selectable !== false ? true : false;
    }
    isSelectableMultiple(){
        return this.isSelectable() && defaultBool(this.props.selectableMultiple,true)
    }
    getSort(){
        return defaultObj(this.sortRef.current);
    }
    renderHeaderCell({columnDef,containerProps,columnField}){
        if(this.isSelectableColumn(columnDef,columnField)){
            const style = this.getSelectableColumNameStyle();
            if(isObj(containerProps)){
                containerProps.style = [this.getSelectableColumNameStyle(),containerProps.style];
            }
            return <Checkbox
                testID = "RN_SelectColumnHeaderCell"
                checked  ={this.isAllRowsSelected()?true:false}
                key = {this.getSelectableColumName()}
                secondaryOnCheck
                style = {style}
                ref = {this.selectableColumnRef}
                onPress = {({checked})=>{
                    this.handleAllRowsToggle(!checked);  
                    return;
                }}
            />
        }
        let ret = columnDef.label || columnDef.text || columnDef.field;
        const {sortedColumn} = this.preparedColumns;
        const sortable = columnDef.sortable !== false ? true : false;
        const isColumnSorted = sortable && sortedColumn.field === columnField && sortedColumn.icon ? true : false;
        const sortMe = (event)=>{
            React.stopEventPropagation(event);
            this.sort(columnField);
        };
        return <TouchableRipple disabled={!sortable} style={styles.sortableColumn} onPress={sortMe}>
            <>
                {isColumnSorted ? <Icon
                    {...sortedColumn}
                    size = {24}
                    style = {[sortedColumn.style,styles.sortedColumnIcon]}
                    name = {sortedColumn.icon}
                    onPress = {sortMe}
                    primary
                />: null}
                <Label textBold style={[{fontSize:13}]} primary={isColumnSorted}>{ret}</Label>
            </>
        </TouchableRipple>
    }
    canScrollTo(){
        return this.state.data.length? true :false;
    }
    /**** permet d'afficher le menu item lié aux champs triables */
    getSortableMenuMenuItem(){

    }
    getTestID(){
        return defaultStr(this.props.testID,'RN_DatagridComponent');
    }
    renderTitle (){
        const testID = this.getTestID();
        const title = typeof this.props.title =="function"? this.props.title({context:this}) : this.props.title;
        const titleProps = defaultObj(this.props.titleProps);
        return React.isValidElement(title) ? <Label testID={testID+"_Title"} {...titleProps} style={[theme.styles.w100,titleProps.style]}>
            {title}
        </Label> : null
    }
    getInitialData (){
        return this.INITIAL_STATE.data;
    }
    getData(){
        return this.state.data;
    }
    renderSelectableCheckboxCell(props){
        const {containerProps} = props;
        if(isObj(containerProps)){
            containerProps.style = [this.getSelectableColumNameStyle(),containerProps.style];
        }
        return <Checkbox
            testID = {"RN_SelectableColumnName_"+(props.field||props.columnField+props.index)}
            {...props}
            style = {[props.style,this.getSelectableColumNameStyle()]}
            key = {props.rowKey}
        />
    }
    renderSelectFieldCell(args){
        return this.renderSelectFieldCell(args);
    }
    /*** retourne le rendu d'une cellule de la ligne du tableau 
    @parm, rowData, object, la ligne à afficher le rendu du contenu
    @param , rowInidex, l'indice de la ligne dont on affiche le rendu en cours
    @param, columnDef, l'objet colonne dont on veut afficher le rendu pour la ligne
    @param, columnField, le nom du champ correspondant à la cellule,
    //l'objet data peut être un tableau de type string si et seulement si, le tableau dispose d'une seule colonnne
    //le formatteur de cellule, peut être : 
            soit une fonction, soit une promesse.
            qu'il s'agisse d'une fonction où d'une promesse, la valeur retournée est un composant react
            quant il s'agit d'une fonction, celle-ci se doit de retourner toujours un composant react
            différent du td d'un table et ne doit pas être un TableColumn de md
    */
    renderRowCell (arg){
        let {rowData,rowKey,rowIndex,handleSelectableColumn,formatValue,rowCounterIndex,renderRowCell:customRenderRowCell,isSectionListHeader,columnDef,columnField} = arg;
        const renderText = isSectionListHeader === true || customRenderRowCell === false ? true : false;
        if(!isObj(rowData)) return renderText ? null : {render:null,extra:{}};
        rowIndex = isDecimal(rowIndex)? rowIndex : isDecimal(index)? index : undefined;
        rowCounterIndex = isDecimal(rowCounterIndex) ? rowCounterIndex : isDecimal(rowIndex)? rowIndex+1 : defaultDecimal(rowCounterIndex);
        if(this.isSelectableColumn(columnDef,columnField)){
            if(renderText) return null;
            rowKey = rowKey ? rowKey : this.getRowKey(rowData,rowIndex);
            return {render :handleSelectableColumn === false ? null : this.renderSelectableCheckboxCell({
            ...arg,
            rowKey,
            rowData,
            checked : this.isRowSelected(rowKey,rowIndex),
            rowsRefs : this.selectedRowsRefs,
            onChange : ({checked})=>{
                this.handleRowToggle({row:rowData,rowData,rowIndex,rowKey,selected:checked})
            }
            }),style:{},extra:{style:{}}};
        } else if((columnField == this.getIndexColumnName())){
             if(renderText) return null;
            return {render : rowCounterIndex.formatNumber(),style:{},extra:{}};
        }
        return renderRowCell({
            ...arg,
            rowIndex,
            rowCounterIndex,
            formatValue,
            context : this,
            getRowKey : this.getRowKey.bind(this),
            abreviateValues : this.state.abreviateValues,
        })
    }
    static LinesProgressBar (props){
        return <DatagridContentLoader {...props}/>
    }
    static LineProgressBar (props){
        return CommonDatagridComponent.LinesProgressBar(props);
    }
}

export const ProgressBar = CommonDatagridComponent.LinesProgressBar;

CommonDatagridComponent.getDefaultPreloader = (props)=>{
    return <Preloader {...defaultObj(props)}/>
}

const chartDisplayType = PropTypes.oneOf(Object.keys(displayTypes).filter(type=>{
    const x = displayTypes[type];
    return typeof x =='object' && x && typeof x.disabled !== true && x.isChart === true && true || false;
}));
CommonDatagridComponent.propTypes = {
    title : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.string,
        PropTypes.node,
        PropTypes.element,
    ]),
    canMakePhoneCall : PropTypes.bool,//si l'on peut faire un appel sur la données sélectionnées
    makePhoneCallProps : PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.func,
    ]),
    filterable : PropTypes.bool, //si le composant peut être filtrable
    /*** si les filtres de données seront convertis au format SQL avant d'effectuer la requête distante */
    convertFiltersToSQL : PropTypes.bool,
    isLoading : PropTypes.bool,///si les données sont en train d'être chargées
    session : PropTypes.bool, /// si les données de sessions seront persistées
    exportTableProps : PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.object,
    ]),
    /*** si l'opérateur or de filtre est accepté */
    filterOrOperator : PropTypes.bool,
    /*** si l'opérateur and de filtre est accepté */
    filterAndOperator : PropTypes.bool,
    /**** les actions qui s'appliquent lorsqu'une où plusieurs lignes sont sélectionnées */
    selectedRowsActions : PropTypes.oneOfType([PropTypes.object,PropTypes.array,PropTypes.func]),
    /** Les actions de la barre d'outil du datagrid : il peut s'agit d'une fonction qui lorsqu'elle est appelée retourne l'ensemble des actions du datagrid
     *  La fonction prend en paramètre : 
     *  selectedRows : this.selectedRows : les lignes sélectionnées
        data : this.state.data : les données du datagrid
        rows : this.state.data : les données du datagrid
        allData : this.INITIAL_STATE.data : l'ensemble des données du datagrid
        mobile : bool si le rendu est fait en environnement mobile ou non
        props : {} les props passés au composant
        selected : true|| false //bolean pour spécifier s'il s'agit du rendu des actions des lignes sélectionnées
     * 
    */
    actions : PropTypes.oneOfType([PropTypes.object,PropTypes.array,PropTypes.func]), //idem à selectedRowsActions
    /*** spécifie si les filtres seront affichés */
    filters : PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.object,
    ]),
    showActions : PropTypes.bool,//si on affichera les actions du datagrid
    /*** affiche ou masque les filtres */
    showFilters : PropTypes.bool,
    /*** si le pied de page sera affiché */
    showFooters : PropTypes.bool,
    /*** les donnnées peuvent être soient retournées par une fonction, soit par un tableau soit une promesse */
    data : PropTypes.oneOfType([PropTypes.array, PropTypes.func,PropTypes.object]),//.isRequired,
    columns:PropTypes.oneOfType([PropTypes.array,PropTypes.object]),//.isRequired,
    selectable : PropTypes.bool, //si les lignes sont sélectionnables,
    /*** Si plusieurs lignes peuvent être sélectionnées au même moment */
    selectableMultiple : PropTypes.bool,
    showPagination : PropTypes.bool, //la pagination est toujours affichée
    showPaginationOnTop:PropTypes.bool, //si la pagination sera affiché en haut du tableau,
    pagin : PropTypes.bool,
    paginate : PropTypes.bool,
    sortable : PropTypes.bool,//si le tableau pourra être trié
    onRowSelected : PropTypes.func, //lorsqu'une ligne est sélectionnée
    onRowsSelected : PropTypes.func, // lorsque toutes les lignes du tableau sont sélectionnées
    onRowDeselected : PropTypes.func, //lorsqu'une ligne est désélectionnée
    onRowsDeselected : PropTypes.func,//lorsque toutes les lignes du datagrid sont désélectionnées
    onRowDoubleClick : PropTypes.func,//évènement appelé en cas de double clic sur la ligne
    onRowPress : PropTypes.func, //évènement appelé lorsqu'on clique sur la ligne
    column : PropTypes.shape({
        filter_value : PropTypes.any, //la valeur par défaut du champ de filtre de colonne
        field : PropTypes.string.isRequired,
        text : PropTypes.string,
        /*** si le filtre de la colonne sera affiché : default : true*/
        filter : PropTypes.bool,
    }),
    pagination:PropTypes.shape({
        start: PropTypes.number, //la page initiale : default:1
        limit: PropTypes.number, //la limite par page
        rows: PropTypes.number, //le nombre total de ligne dans le tableau
        page : PropTypes.page,//la page actuelle
        next: PropTypes.string, //la chaine de caractère pour l'affichage de la page suivante
        previous: PropTypes.string, //la chaine de caractère pour l'affichage de la page précédente
        ///....props:PropTypes.object //les props à appliquer à l'objet pagination
    }),
    sort : PropTypes.shape({
        column : PropTypes.string,
        dir : PropTypes.string,
        ignoreCase : PropTypes.bool,
        /**** 
         *  cette fonction est utilisée pour le rendu de l'item au moment du tri du tableau
         *  @param : obj : l'objet courrant à trier
         *  @param : colunmName : string, le nom de la colonne de trie
         */
        getItem : PropTypes.func 
    }),
    /**** la props filter, permet de filtrer les données qui seront utilisées pour le rendu du composant Dropdown 
     *  {row,data,allData}
     *  @param : {
     *         component : string, le composant qui appelle la fonction de filtre : datagrid dans notre cas
     *         props : object : les props du composant qui appelle la fonction
    *          row ou data : la ligne  courant,
    *          datas ou allData : l'ensemble des données du datagrid
    *          rowIndex ou index : l'indice de la ligne courante,
    *          items : la liste de tous les items,
    *          index : l'indice de l'item,
    *          _index : le numéro de l'indice : s'il s'agit d'un tableau 
    *          ,itemIndex
     *  }
     * 
    */
    filter : PropTypes.func, 
    /*** la barre de progression */
    progressBar : PropTypes.node,
    /*** fonction permettant de retourner l'unique clé des éléments du tableau */
    getRowKey : PropTypes.func,
    ///la fonction utilisée pour l'impression du datagrid
    print : PropTypes.func,
    printOptions: PropTypes.object,
    /*** si le datagrid est imprimable */
    printable : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.string,
        PropTypes.bool
    ]),
    archive : PropTypes.func,
    archivable : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.string,
        PropTypes.bool
    ]),
    /*** si le rendu du datagrid est exportable */
    exportable : PropTypes.bool,
    baseId : PropTypes.string,
    mobile: PropTypes.bool,
    tablet: PropTypes.bool,
    ///pour l'affichage où non des filtres
    toggleFilters : PropTypes.bool,
    desktop: PropTypes.bool,
    onRefreshDatagrid : PropTypes.func,//lorsque le datagrid est actualisé, rafraichir
    ///les props à apppliquer à l'accordion
    /**** l'accordion peut rendre un objet ou un objet react ou null 
     * si c'est un objet, alors il peut être de la forme :  
     * {
     *   title : PropTypes.node , //le titre du header
     *   avatar : PropTypes.string(dataUrl,src,other) || PropTypes.node, ///l'avatar,
     *   rowClassName : la class à appliquer à la ligne
     *   rowProps : les props à appliquer à la ligne de la liste
     *   headerClassName : la class à appliquer au header de la ligne
     *   primaryText : //
     *   primaryTextRigth : 
     *   secondaryText : 
     *   secondaryTextRight
     * }
    */
    accordion :PropTypes.func,
    accordionProps : PropTypes.object,
    /*** pour le rendu du footer, pied de page en affichage accordion */
    sessionName : PropTypes.string,
    onFetchData : PropTypes.func,
    handleQueryLimit : PropTypes.bool, ///si le datagrid devra gérer les queryLimit
    /**** les menus customisés à ajouter au composant Datagrid */
    customMenu : PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.objectOf(PropTypes.object),
    ]),
    /****les colonnes via lesquelles le tableau est groupé par defaut */
    sectionListColumns : PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.arrayOf(PropTypes.string),
    ]),
    sectionListHeaderEmptyValue : PropTypes.string, //la valeur vide par défaut à afficher dans les entêtes du table
    ignoreCaseOnSectionListHeader : PropTypes.bool,//si l'on ignorera la casse dans le sectionlISThEADER
    sectoonListHeaderUpperCase : PropTypes.bool, //si le sectionListHeader sera en majuscule
    getSectionListHeaderLabelStyle : PropTypes.func,//la fonction permettant de récupérer les styles à appliquer sur le composant label de la section header
    getSectionListHeaderContentContainerStyle : PropTypes.func, //retourne les styles à appliquer sur le contentContainer de la sectionListHeader
    getSectionListHeaderStyle : PropTypes.func, // la fonction permettant de récupérer les propriétés particulières à appliquer au style passé en paramètre
    /*** spécifie si le datagrid est groupable et si l'on utilisera les sectionList du composant FLashList pour le rendu du tableau 
     * si une colonne n'est pas groupable alors elle ne peut pas apparaître dans les sectionList
    */
    groupable : PropTypes.bool,
    /*la fonction permettant de récupérer l'entête de la sectionList pour la données passée en paramètre
        @param {object : {data:{object},context:{this},allData:[]}}
        @return {string}
    */
    getSectionListHeader : PropTypes.func,
    ignoreEmptySectionListHeader : PropTypes.bool, // si l'on ignorera les sectionList data dont l'entête, le sectionListHeader est empty
    /**** la fonction permettant de faire le rendu dun contenu paginé, personalisé */
    renderCustomPagination : PropTypes.func,
    getActionsArgs : PropTypes.func,//fonction permettant de récupérer les props supplémentaires à passer aux actions du datagrid
    displayOnlySectionListHeaders : PropTypes.bool,// si uniquement les entêtes des sections seront affichés, valides uniquement en affichage des sectionHeader 
    /*** les options de configuration du graphe */
    chartConfig : PropTypes.shape({
        //type : PropTypes.oneOfType(chartDisplayType).isRequired,//le type de graphe : l'une des valeurs parmis les éléments cités plus haut
        x : PropTypes.string.isRequired, //l'axe horizontal
        y : PropTypes.string.isRequired, //l'axe des y, les colonnes de type nombre
        series : PropTypes.arrayOf(PropTypes.string), //les séries, le nombre de courbe a afficher sur le graphe, en fonction du type
        /**** les series à utiliser pour l'affichage des données lorsque les colonnes sont groupées, ie les montant de totalisation sont utilisés */
        sectionListHeadersSeries : PropTypes.arrayOf(PropTypes.string),
    }),
    /*** la permission autorisée pour l'export en pdf */
    exportToPDFAllowedPerm : PropTypes.string,
    /*** la permission autorisée pour l'export en excel*/
    exportToExcelAllowedPerm : PropTypes.string,
    /*** la permission que doit avoir l'utilisateur pour pouvoir visualiser les graphes à partir du diagrame */
    chartAllowedPerm : PropTypes.string,
    displayType : chartDisplayType,
    /*** les types d'afichates supportés par l'application */
    displayTypes : PropTypes.arrayOf(chartDisplayType),
    /***le code de la fonction d'aggregation à utilier par défaut, dans la liste des fonctions d'aggrégations du composant */
    aggregatorFunction : PropTypes.string,
    /*** permet de faire une mutation sur les options de la recherche, immédiatement avant le lancement de la recherche */
    fetchOptionsMutator : PropTypes.func,
    useLinesProgressBar  : PropTypes.bool,//si le progress bar lignes horizontale seront utilisés
    abreviateValues : PropTypes.bool, //si les valeurs numériques seront abregées
}

const styles = StyleSheet.create({
    queryLimit : {
        fontSize : 16
    },
    sortableColumn : {
        flexDirection : 'row',
        flex : 1,
        alignItems : 'center',
    },
    sortedColumnIcon : {
        paddingVertical : 0,
        paddingHorizontal : 0,
        marginHorizontal : 0,
        marginVertical : 0,
        marginLeft : -10,
        //paddingRight : 2,
        //width : 27,
    },
})

/**** cette fonction permet de retourner le nom de la source de données à utiliser pour l'exécution de la requête */
export const getDataSource = CommonDatagridComponent.getDataSource = (arg)=>{
    if(isNonNullString(arg)){
        arg = {dataSource:arg};
    }
    arg = defaultObj(arg);
    let {dataSource} = arg;
    if(typeof (dataSource) =='function'){
        dataSource = dataSource(arg)
    }
    return defaultStr(dataSource);
}