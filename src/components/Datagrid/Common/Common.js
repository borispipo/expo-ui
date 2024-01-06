import theme,{ StyleProps} from '$theme';
import APP from "$capp";
import {isMobileOrTabletMedia} from "$cplatform/dimensions";
import PropTypes from "prop-types";
import {ObservableComponent as AppComponent} from "$react"
import $session from "$session";
import Auth from "$cauth";
import Tooltip from "$ecomponents/Tooltip";
import setQueryLimit from "./setQueryLimit";
import {showConfirm} from "$ecomponents/Dialog";
import Label from "$ecomponents/Label";
import Icon,{COPY_ICON} from "$ecomponents/Icon";
import filterUtils from "$cfilters";
import {sortBy,isDecimal,defaultVal,sanitizeSheetName,extendObj,isObjOrArray,isObj,isDataURL,defaultNumber,defaultStr,isFunction,defaultBool,defaultArray,defaultObj,isNonNullString,defaultDecimal} from "$cutils";
import {Datagrid as DatagridContentLoader} from "$ecomponents/ContentLoader";
import React from "$react";
import DateLib from "$lib/date";
import Filter,{canHandleFilter,prepareFilters} from "$ecomponents/Filter";
import {CHECKED_ICON_NAME} from "$ecomponents/Checkbox";
import { COLUMN_WIDTH,DATE_COLUMN_WIDTH,DATE_TIME_COLUMN_WIDTH } from "../utils";
import { StyleSheet,Dimensions} from "react-native";
import Preloader from "$ecomponents/Preloader";
import Checkbox from "../Checkbox";
import { TouchableRipple } from "react-native-paper";
import { evalSingleValue,Footer,getFooterColumnValue,isValidAggregator,extendAggreagatorFunctions} from "../Footer";
import { makePhoneCall,canMakePhoneCall as canMakeCall} from "$makePhoneCall";
import copyToClipboard from "$capp/clipboard";
import { Pressable } from "react-native";
import DatagridProgressBar from "../ProgressBar";
import View from "$ecomponents/View";
import {Menu} from "$ecomponents/BottomSheet";
import {styles as tableStyles} from "$ecomponents/Table";
import {DialogProvider} from "$ecomponents/Form/FormData";
import Chart,{getMaxSupportedSeriesSize} from "$ecomponents/Chart";
import notify from "$cnotify";
import FileSystem from "$file-system";
import sprintf from "$cutils/sprintf";
import { renderRowCell,formatValue,arrayValueSeparator } from "./utils";
import Button from "$ecomponents/Button";
import stableHash from "stable-hash";
import * as XLSX from "xlsx";
import {parseMangoQueries} from "$ecomponents/Filter";
import events from "../events";
import {MORE_ICON} from "$ecomponents/Icon"
import ActivityIndicator from "$ecomponents/ActivityIndicator";
import {createTableHeader,fields as pdfFields,pageHeaderMargin,sprintf as pdfSprintf} from "$cpdf";
import {isWeb,isMobileNative} from "$cplatform";
import { createPDF,getFields as getPdfFields } from '$expo-ui/pdf';

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

const checkPerm = (perm,args)=>{
    return typeof perm ==='function'? perm(args) : isNonNullString(perm) ? Auth.isAllowedFromStr(perm) : typeof perm =='boolean'? perm : true;
}

/*****
 * Pour spécifier qu'un champ du datagrid n'existe pas en bd il s'ufit de suffixer le nom du champ par le suffix : "FoundInDB" et de renseigner false comme valeur 
de l'objet rowData de cette propriété
 */
export default class CommonDatagridComponent extends AppComponent {
    constructor(props){
        super(props);
        this.autobind();
        let {
            data,
            selectedRows,
            renderChartIsAllowed,
            exportToPDFIsAllowed,
            exportToExcelIsAllowed,
            renderSectionListIsAllowed,
            checkPerms : customCheckPerms,
            ...rest
        } = props;
        if(this.bindResizeEvents()){
            extendObj(this._events,{
                SET_DATAGRID_QUERY_LIMIT : this.onSetQueryLimit.bind(this),
            });
        }
        if(this.props.resetSessionData === true){
            this.resetSessionData();
        }
        rest = defaultObj(rest);
        this._pagination = defaultObj(rest.pagination);
        this.hasLocalFilters = false;
        data = (data && typeof data == 'object')? Object.toArray(data):[];
        const sData = this.getSessionData()
        sData.showFooters = defaultVal(sData.showFooters,this.isTableData());
        sData.fixedTable = defaultBool(sData.fixedTable,false);
        this.rowsByKeys = {};
        this.rowsKeysIndexes = [];
        extendObj(this.state, {
            data,
            showFilters : this.isFilterable() && defaultBool(props.showFilters,(sData.showFilters? true : this.isPivotDatagrid())) || false,
            showFooters : defaultBool(props.showFooters,(sData.showFooters? true : false)),
            fixedTable : sData.fixedTable
        });
        const disTypes = {};
        let hasFoundDisplayTypes = false;
        const pArgs = {context:this,data,props:this.props}
        const perm = checkPerm(renderChartIsAllowed,pArgs)
        const ePDFIsAllowed = checkPerm(exportToPDFIsAllowed,pArgs);
        const eExcelISAllowed = checkPerm(exportToExcelIsAllowed,pArgs);
        const renderSectionListIsAllowedP = checkPerm(renderSectionListIsAllowed,pArgs);
        if(typeof customCheckPerms =='function'){
            customCheckPerms({context:this});
        }
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
            selectedRowsKeys : {value : new Set()},
            [footerFieldName] : {
                value : uniqid(footerFieldName),override:false, writable: false
            },
            renderProgressBarRef : {
                value : {current : null}
            },
            isLoadingRef : {
                value : {current:false}
            },
            isChartAllowed : {value : perm},
            isExcellExportAllowed : {value:eExcelISAllowed},
            isPDFExportAllowed : {value: ePDFIsAllowed},
            renderSectionListIsAllowed : {value:renderSectionListIsAllowedP},
            currentFilteringColumns : {value:{}},
            emptySectionListHeaderValue : {value : uniqid("empty-section-list-header-val").toUpperCase()},
            getSectionListHeaderProp : {value : typeof this.props.getSectionListHeader =='function'? this.props.getSectionListHeader : undefined},
            sectionListData : {value : {}},//l'ensemble des données de sectionList
            sectionListHeaderFooters : {value : {}},
            sectionListDataKeys  : {value : new Set()},
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
            hidePreloaderOnRenderKey : {value : uniqid("hide-preloader-on-render")},
            canRenderProgressBarKey : {value : uniqid("can-render-pgroessbar")},
            chartSeriesNamesColumnsMapping : {value : {}},//le mappage entre les index des series et les colonnes coorespondantes
        });
        this.setSelectedRows(selectedRows);
        const config = extendObj(true,{},this.props.chartConfig,this.getSessionData("config"));
        Object.map(config,(v,k)=>{
            if(typeof v =='function'){
                delete config[k];
            }
        });
        this.state.fetchOnlyVisibleColumns = !!defaultVal(this.props.fetchOnlyVisibleColumns,config.fetchOnlyVisibleColumns,this.getSessionData("fetchOnlyVisibleColumns"));
        const abreviateVals = this.getSessionData("abreviateValues");
        this.state.abreviateValues = abreviateVals !== undefined ? !!abreviateVals : "abreviateValues" in this.props? !!this.props.abreviateValues : true;
        const sessionAggregator = this.getSessionData("aggregatorFunction"); 
        this.state.aggregatorFunction= this.isValidAggregator(config.aggregatorFunction) && config.aggregatorFunction || this.isValidAggregator(this.props.aggregatorFunction) && this.props.aggregatorFunction || this.isValidAggregator(sessionAggregator) && sessionAggregator || Object.keys(this.aggregatorFunctions)[0];;
        this.isLoading = this.isLoading.bind(this);
        this.renderProgressBar = this.renderProgressBar.bind(this);
        this.sortRef.current.dir = defaultStr(this.sortRef.current.dir,this.sortRef.current.column == "date"?"desc":'asc')
        this.hasColumnsHalreadyInitialized = false;
        this.state.columns = this.initColumns(props.columns);
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
        const {sectionListColumns} = this.prepareColumns();
        this.state.sectionListColumns = sectionListColumns;
        if(this.canHandleColumnResize()){
            this.state.columnsWidths = this.preparedColumns.widths;
        }
        this.state.config = config;
        if(!("sparkline" in this.state.config) && this.isDashboard()){
            this.state.config.sparkline = true;
        }
        const dType = defaultStr(this.getSessionData("displayType"),this.props.displayType,"table");
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
        this.currentDataSources = Object.toArray(this.getSessionData().selectedDataSources);
        this.setSessionData({selectedDataSources:this.currentDataSources});
        this.persistDisplayType(this.state.displayType);
    }
    /*** si l'on peut récuperer à distance, les colonnes seulement visibles */
    canFetchOnlyVisibleColumns(){
        return this.isTableData() && this.props.canFetchOnlyVisibleColumns && this.isFilterable() && true || false;
    }
    isFetchOnlyVisibleColumnsEnabled(){
        return this.canFetchOnlyVisibleColumns() && !!this.state.fetchOnlyVisibleColumns;
    }
    fetchDataIfCanFetchColumnsIfVisible(){
        if(!this.canFetchOnlyVisibleColumns()) return;
        this.toggleHidePreloaderOnRender(false);
        return this.fetchData({force:true});
    }
    toggleFetchOnlyVisibleColumns(){
        if(!this.canFetchOnlyVisibleColumns()){
            return Promise.reject({});
        }
        const fetchOnlyVisibleColumns = !this.isFetchOnlyVisibleColumnsEnabled();
        this.setIsLoading(true,()=>{
            this.setSessionData("fetchOnlyVisibleColumns",fetchOnlyVisibleColumns);
            this.setState({fetchOnlyVisibleColumns},this.fetchDataIfCanFetchColumnsIfVisible.bind(this))
        },TIMEOUT);
    }
    isValidAggregator(aggregatorFunction){
        return isNonNullString(aggregatorFunction) && isValidAggregator(this.aggregatorFunctions[aggregatorFunction])
    }
    /*** si une ligne peut être selectionable */
    canSelectRow(row){
        const s = isObj(row) && row.isSectionListHeader !== true ? true : false;
        if(!s) return false;
        if(typeof this.props.isRowSelectable =='function'){
            return !!this.props.isRowSelectable({row,rowData:row,context:this});
        }
        return true;
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
    getSessionKey (){
        const sessionName = this.props.sessionName;
        const userCode = Auth.getLoggedUserCode();
        if(!isNonNullString(sessionName) || (!isNonNullString(userCode) && !this.isDatagrid())) return false;
        return this.getSessionPrefix()+sessionName.ltrim(this.getSessionPrefix()).replaceAll(" ",'_')+userCode;
    }
    getSessionData (sessionKey){
        const key = this.getSessionKey();
        const dat = this.props.session !== false && isNonNullString(key) ? defaultObj($session.get(key)) : {}
        if(isNonNullString(sessionKey)){
            return dat[sessionKey];
        }
        return dat;
    }
    setSessionData (sessionKey,sessionValue,reset){
        if(this.props.session === false) return;
        const key = this.getSessionKey();
        if(!isNonNullString(key)) return false;
        if(reset === true){
            $session.set(key,{});
            return {};
        }
        const dat = defaultObj(this.getSessionData());
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
    resetSessionData(){
        return this.setSessionData(null,null,true);
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
        const d = [];
        Object.map(args.selectedRows,(doc)=>{
            if(isObj(doc)){
                d.push(doc);
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
    isSWRDatagrid(){
        return !!this.props.isSWRDatagrid;
    }
    callSRowCallback({selected,row,rowIndex,key,cb}){
        const count = this.getSelectedRowsCount();
        const sArg = this.getActionsArgs(selected);
        sArg.count = this.getSelectedRowsCount();
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
                this.props.onRowsDeselected.call(this,{...sArg,context:this,props:this.props});
            }
        }
        if(isFunction(cb)){
            cb(selected,row,rowIndex,{...sArg,context:this})
        }
    }
    getSelectedRowsCount (){
        return this.selectedRowsKeys.size;
    }

    //si la ligne peut être sélectionnée
    canSelectCheckedRow(){
        if(!this.isSelectable()) return false;
        if(this.isSelectableMultiple()) return true;
        return this.getSelectedRowsCount() <= 1 ? true : false;
    }
    getSelectedRowsKeys(){
        return Array.from(this.selectedRowsKeys);   
    }
    getSelectedRows(){
        const ret = {};
        this.selectedRowsKeys.forEach((rowKey)=>{
            ret[rowKey] = this.getRowByKey(rowKey);
        });
        return ret;
    }
    /**** fonction appelée lorsque l'on clique sur la checkbox permettant de sélectionner la ligne */
    handleRowToggle ({rowIndex,rowKey,index,cb,callback},cb2){
        if(!this.isValidRowKey(rowKey)) return false;
        const row = this.getRowByKey(rowKey);
        if(!isObj(row) || !this.canSelectRow(row)) return false;
        const selected = !!!this.isRowSelected(rowKey);
        let selectableMultiple = this.isSelectableMultiple();
        rowIndex = defaultNumber(rowIndex,index);
        cb = defaultFunc(cb,callback,cb2)
        const size = this.getSelectedRowsCount();
        if(selected && !this.canSelectCheckedRow()){
            notify.warning("Vous ne pouvez sélectionner plus d'un élément");
            return false;
        }
        if(selected){
            let max = this.getMaxSelectedRows();
            if(max && size>= max){
                notify.warning("Vous avez atteint le nombre maximum d'éléments sélectionnable, qui est de "+max.formatNumber())
                return false;
            }
        }
        if(!selectableMultiple){
            this.setSelectedRows();
        }
        if(selected){
            this.selectedRowsKeys.add(rowKey);
        } else {
            this.selectedRowsKeys.delete(rowKey);
        }
        this.trigger(events.ON_ROW_TOGGLE,{selected,rowData:row,row,rowIndex,rowKey});
        this.callSRowCallback({selected,rowData:row,row,rowIndex,rowKey,cb});
        return !!selected;
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
    updateDatagridActions(cb){
        this.trigger(events.ON_ROW_TOGGLE,null);
    }
    handleAllRowsToggle(update){
        if(!defaultVal(this.props.selectableMultiple,true) && this.getSelectedRowsCount() && this.getPaginatedData().length){
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
        this.trigger(events.ON_ALL_ROWS_TOGGLE,{selectedRows:data});
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
        const newColumns = {};
        let colIndex = 0;
        if(this.canHandleSelectableColumn()){
            newColumns[this.getSelectableColumName()] = {
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
            newColumns [this.getIndexColumnName()] =  { 
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
        const rowKeysColumns = {};
        Object.mapToArray(columns,(headerCol1,headerIndex)=>{
            if(!isObj(headerCol1)) return;
            const header = Object.clone(headerCol1);
            header.field = defaultStr(header.field, headerIndex)
            if(header.primaryKey){
                rowKeysColumns[header.field] = true;
            }
            if(isAccordion && header.accordion === false) return null;
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
            newColumns[header.field] = header;
            /*** les pieds de pages sont les données de type decimal, où qu'on peut compter */
            if(header.footer !== false && ((arrayValueExists(['decimal','number','money'],header.type) && header.format) || header.format == 'money' || header.format =='number')){
                footers[header.field] = Object.clone(header);
            }
            if(!this.hasColumnsHalreadyInitialized){
                this.initColumnsCallback({...header,colIndex,columnField:header.field});
            }
        });
        this.rowKeysColumns = Object.keys(rowKeysColumns);
        return newColumns;
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
    getActionsArgs (selected){
        const r = isObj(selected)? selected : {};
        const isMobile = isMobileOrTabletMedia();
        const ret = {
            ...dataSourceArgs,
            rowsByKeys : this.rowsByKeys,
            rowsKeysIndexes : this.getRowsKeysIndexes(),
            showConfirm,
            Preloader,
            notify,
            selected : defaultBool(selected,false),
            ...r,
            isMobile,
            isDesktop : !isMobile,
            component:'datagrid',
            data : this.state.data,
            rows : this.state.data,
            allData : this.INITIAL_STATE.data,
            props : this.props,
            selectedRows : this.getSelectedRows(),
            selectedRowsCount : this.getSelectedRowsCount(),
            context:this,
            isAccordion : this.isAccordion(),
            isTableData : this.isTableData(),
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

    copyToClipboard({selectedRows,...rest}){
        let keys = Object.keys(selectedRows);
        let row = selectedRows[keys[0]];
        if(!isObj(row)){
            return notify.error("Impossible de copier le premier élément sélectionné du tableau car il est invalide");
        }
        return copyToClipboard({...rest,isDatagrid:true,data:row,fields : this.props.columns,sessionName:defaultStr(this.props.sessionName,"datagrid")});
    }
    
    /*** les actions représentes les différents menus apparaissant lorsqu'une ligne est sélectionnée
     *   ou pas.
     */
    renderSelectedRowsActions(sActions){
        let {makePhoneCallProps,canMakePhoneCall,archivable} = this.props;
        const size = this.getSelectedRowsCount();
        let r = [];
        let endActs = [];
        if(size <=0) {
            return r
        };
        let selectedR = this.props.selectedRowsActions;
        const sArgs = this.getActionsArgs(true);
        sArgs.size = sArgs.selectedRowsCount = this.getSelectedRowsCount();
        sArgs.selectedRowsKeys = this.getSelectedRowsKeys();
        sArgs.selectedRows = this.getSelectedRows();
        if(isFunction(selectedR)) {
            selectedR = selectedR.call(this,sArgs)
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
            const rowKey = this.getRowKeyByIndex(0), rowData = defaultObj(this.getRowByKey(rowKey));
            const table = defaultStr(this.props.table,this.props.tableName).trim();
            let callProps = typeof makePhoneCallProps == 'function'? makePhoneCallProps({rowData,rowKey,table,tableName:table,data:rowData,key:rowKey,context:this,props:this.props}) : makePhoneCallProps;
            if(callProps !== false){
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
        if(typeof this.props.onSort =='function' && this.props.onSort({context:this,sort,data:this.INITIAL_STATE.data,fields:this.state.columns,columns:this.state.columns}) === false){
            return;
        }
        const call = ()=>{
            this.prepareData({data:this.INITIAL_STATE.data,updateFooters:false},(state)=>{
                this.setState(state);
            });
        };
        const max = isMobileOrTabletMedia()? 200 : 5000;
        if(this.INITIAL_STATE.data.length > max){
            return this.setIsLoading(true,call);
        }
        return call();
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
    renderDataSourceSelector(){
        const t = !this.props.handleTitle ? null : isNonNullString(this.props.title) || typeof this.props.title ==='number' ? <Label textBold primary style={[theme.styles.fs14]} testID={"RN_DatagridTitleProp"}>{this.props.title}</Label> : React.isValidElement(this.props.title)? this.props.title : null;
        const table = defaultStr(this.props.table,this.props.tableName);
        const dS = dS === false ? null : typeof this.props.dataSourceSelector ==='function'? this.props.dataSourceSelector({
            defaultValue : this.currentDataSources,
            onChange : this.onChangeDataSources.bind(this),
            tableName:table,
            table,
            isAccordion : this.isAccordion,
            context : this,
        }) : null;
        if(React.isValidElement(dS)){
            return <View testID={'RN_Datagrid_DataSourceSelectorContainer'} style={[theme.styles.flex,theme.styles.flexRow,theme.styles.justifyContentFlexStart,theme.styles.alignItemsCenter]}>
                {dS}
                {t}
            </View>
        }
        return t;
    }
    /*** permet de faire le rendu de certaines entête personalisés 
     * utile lorsque l'on veut par exemple afficher d'autres information au niveau de l'entête du tableau
    */
    renderCustomMenu(){
        const customMenu = []
        if(this.canFetchOnlyVisibleColumns()){
            const isFE = this.isFetchOnlyVisibleColumnsEnabled();
            customMenu.push({
                text : "Valeurs Cols visibles",
                tooltip : "Récupérer uniquement les valeurs des colonnes visibles",
                icon : "material-radio-button-{0}".sprintf(isFE?"on":"off"),
                onPress : (e)=>{
                    this.toggleFetchOnlyVisibleColumns();
                }
            })
        }
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
                },)
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
                    this.setSessionData("fixedTable",fixedTable);
                })
            })
       },TIMEOUT)
   }
   getSessionNameKey (){
        return defaultStr(this.props.table,this.props.tableName,this.props.sessionName);
   }
   /*** affiche ou masque une colonne filtrée */
   toggleFilterColumnVisibility1(field){
        if(!isNonNullString(field)) return;
        this.setIsLoading(true,()=>{
            const filteredColumns = {...this.state.filteredColumns};
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
        },TIMEOUT);
    }
    toggleFilterColumnVisibility(field,visible){
        if(!isNonNullString(field)) return;
        const filteredColumns = {...this.state.filteredColumns};
        if(typeof visible !=='boolean'){
            visible = !!!filteredColumns[field];
        }
        filteredColumns[field] = visible;
        this.setSessionData("filteredColumns"+this.getSessionNameKey(),filteredColumns);
        this.trigger("toggleFilterColumnVisibility",{field,columnField:field,visible});
        return visible;
    }
    
   /*** affiche ou masque une colonne 
    @param {string} field
   */
   toggleColumnVisibility(field,removeFocus){
        if(!isNonNullString(field)) return;
        let columns = {...this.state.columns};
        columns[field].visible = !columns[field].visible;
        const footers = this.getFootersFields();
        if(isObj(footers[field])){
            footers[field].visible = columns[field].visible;
        }
        this.setIsLoading(true,()=>{
            this.prepareColumns({columns});
            this.setState({columns},this.fetchDataIfCanFetchColumnsIfVisible.bind(this));
        },TIMEOUT);
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
                withScrollView : true,
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
        });
   }
   canDisplayOnlySectionListHeaders(){
        return this.hasFootersFields() && this.isSectionList() && this.hasSectionListData();
   }
   /*** si l'on peut rendre le contenu de type graphique */
   isChartRendable(){
     return !this.isPivotDatagrid() && this.hasFootersFields();
   }
   isValidChartConfig(){
        const config = this.state.config;
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
            })
        } else {
            const cb = (config)=>{
                this.setIsLoading(true,()=>{
                    this.setState({config,displayType},()=>{
                        this.persistDisplayType(displayType);
                    })
                },200);
            }
            if(!this.isValidChartConfig()){
                return this.configureChart(false).then((config)=>{
                    cb(config);
                });
            }
            cb({...this.state.config});
        }
   }
   getActiveAggregatorFunction(){
        if(isNonNullString(this.state.aggregatorFunction) && this.aggregatorFunctions[this.state.aggregatorFunction]){
            return this.aggregatorFunctions[this.state.aggregatorFunction]
        }
        return this.aggregatorFunctions[Object.keys(this.aggregatorFunctions)[0]];
   }
   toggleAbreviateValues(){
        this.setIsLoading(true,()=>{
            this.prepareData({data:this.INITIAL_STATE.data},(state)=>{
                const abreviateValues = !this.state.abreviateValues;
                this.setState({abreviateValues,...state},()=>{
                    this.setSessionData("abreviateValues",abreviateValues);
                })
            });
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
   formatValue(value,format,columnField){
        const formatter = isNonNullString(columnField) && isObj(this.state.columns[columnField]) && typeof this.state.columns[columnField].formatValue =='function' && this.state.columns[columnField].formatValue|| undefined;
        return formatValue(value,format,this.state.abreviateValues,formatter);
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
        const config = this.getConfig();
        return new Promise((resolve)=>{
            DialogProvider.open({
                title : "Paramètres de groupe",
                data : config,
                withScrollView : true,
                fields : {
                    displayGroupLabels : {
                        type : "switch",
                        text  : "Afficher les libelés de groupées",
                        tooltip : "Afficher/Masquer les noms de colonnes sur les entêtes des valeurs groupées",
                        defaultValue : 0,
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
                            const nConfig = {...config,...data};
                            this.setSessionData("config",nConfig);
                            DialogProvider.close();
                            this.setIsLoading(true, ()=>{
                                this.prepareData({data:this.INITIAL_STATE.data,config:nConfig},(state)=>{
                                    this.setState({...state,config:nConfig},()=>{
                                        resolve(nConfig)
                                    });
                                })
                            });
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
        const xItems = {},yItems = {},config = defaultObj(this.state.config);
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
            const data = this.getConfig();
            DialogProvider.open({
                title : 'Configuration des graphes',
                subtitle : false,
                data,
                withScrollView : true,
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
                        defaultValue : false,
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
                        formatValue : ({value})=>{
                            return value.formatNumber()+" px";
                        },
                    },
                    height : {
                        type : "number",
                        text : "Hauteur du graphe",
                        validType : "numberGreaterThan[0]",
                        defaultValue : this.getDefaultChartHeight(),
                        formatValue : ({value})=>{
                            return value.formatNumber()+" px";
                        },
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
                            const nConfig = {...config,...data};
                            this.setSessionData("config",nConfig);
                            DialogProvider.close();
                            if(!isValidConfig && refreshChart !== false){
                                return this.setState({config:nConfig},()=>{
                                    resolve(nConfig)
                                })
                            }
                            resolve(nConfig);
                        }
                    }
                ]
            })
        })
   }
   getConfig(){
      return defaultObj(this.state.config);
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
            const config = this.getConfig();
            const fileName = sprintf(defaultStr(config.fileName,config.title,"graphe"));
            FileSystem.write({content:imgURI,fileName})
        });
    }
   ///reoturne les options de menus à appliquer sur le char
   getChartMenus(){
        const menus =  [
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
        ];
        Object.map(this.props.chartActions,(menu,t)=>{
            if(!isObj(menu)) return;
            const {onPress} = menu;
            menus.push({
                ...menu,
                onPress : (event)=>{
                    if(!this.chartRef.current) return;
                    const args = React.getOnPressArgs(event);
                    args.chartContext = this.chartRef.current;
                    if(typeof onPress =='function'){
                        onPress(args);
                    }
                }
            })
        })
        return menus;
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
            fields : {
                text : "Champs à exporter",
                items : this.state.columns,
                type : "select",
                itemValue : ({item,index})=>index,
                filter : ({item,index})=> isObj(item) && item.exportable !== false,
                renderItem : ({item,index})=> item?.label || item?.text || index,
                multiple : true,
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
   SetExportOptions({excel,pdf}){
        const skey = excel ? "export-to-excel":"export-to-other";
        const isOnlytotal = this.state.displayOnlySectionListHeaders;
        const displayOnlyHeader = this.canDisplayOnlySectionListHeaders() && isOnlytotal;
        const sData = defaultObj(this.getSessionData(skey));
        const pdfConfig = this.getPdfConfig();
        const sFields = pdf ? getPdfFields (pdfConfig) : {};
        return new Promise((resolve,reject)=>{
            return DialogProvider.open({
                title : `Paramètre d'export ${excel?"excel":"pdf"}`,
                data : sData,
                withScrollView : true,
                fields : {
                    ...this.getExportableFields(),
                    sheetName : excel && {
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
                    pdfDocumentTitle : {
                        text : "Titre du document",
                        multiple : true,
                    },
                    ...sFields,
                },
                actions : [{text:'Exporter',icon : "check"}],
                onSuccess: (args)=>{
                    args.sessionKeyName = skey;   
                    args.displayOnlyHeader = displayOnlyHeader;
                    args.isOnlytotal = isOnlytotal;
                    args.sessionData = sData;
                    args.pdfConfig = pdfConfig;
                    args = this.handleTableExport({...args,excel,pdf});
                    DialogProvider.close();
                    resolve(args);
                    return args;
                },
                onCancel : reject,
            })
        })
   }
   /***@see : https://docs.sheetjs.com/docs/api/utilities */
   exportToExcel(){
    return this.SetExportOptions({excel:true}).then((opts)=>{
        const {data,config} = opts;
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, config.sheetName);
        FileSystem.writeExcel({...config,workbook:wb}).then(({path})=>{
            if(isNonNullString(path)){
                notify.success("Fichier enregistré dans le répertoire {0}".sprintf(path))
            }
         }).finally(()=>{
            Preloader.close();
        });
    }).finally(Preloader.close);
   }
   getPdfConfig(){
        const opts = typeof this.props.pdfConfig =="function"? this.props.pdfConfig({context:this}) : null;
        if(isObj(opts)) return opts;
        return defaultObj(this.props.pdfConfig);
   }
   exportToPdf(){
    return this.SetExportOptions({excel:false,pdf:true}).then((opts)=>{
        const {data,config:cConfig,pdfConfig} = opts;
        const config = extendObj({},pdfConfig,cConfig);
        data[0] = createTableHeader(data[0],{...config,filter:(a)=>{
            return true;
        }});
        const pT = defaultStr(config.pdfDocumentTitle).trim();
        const pdfDocumentTitle = pT ? pdfSprintf(pT,{fontSize : 20,color : "red"}) : null;
        const content = [{
            table : {
                body : data,
            }
        }];
        if(pdfDocumentTitle){
            content.unshift(pdfDocumentTitle);
        }
        return createPDF({...config,content});
    }).finally(Preloader.close);
}
   handleTableExport(args){
        let {sessionKeyName,excel,pdf,isOnlytotal,displayOnlyHeader,data:config} = args;
        this.setSessionData(sessionKeyName,config);
        config.fileName = sprintf(config.fileName);
        config.sheetName = sanitizeSheetName(config.sheetName);
        const data = [];
        let totalColumns = 0;
        const cols = {};
        Preloader.open("préparation des données...");
        const footers = this.getFooters();
        const hasFields = !!config.fields.length;
        const fields = config.fields;
        const headers = [];
        const fValues = this.getFooterValues();
        if(displayOnlyHeader && config.aggregatedValues){
            headers.push("Fonction d'agrégation");
            const aggregatorFunctions = this.aggregatorFunctions;
            Object.map(footers,(f,i)=>{
                if(hasFields && !fields.includes(i)) return;
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
                    const v = defaultNumber(footer[i]);
                    d.push(pdf ? this.formatValue(v,footer.format,field):v);
                });
                data.push(d);
            })
        } else {
            const hFooters = defaultObj(this.sectionListHeaderFooters);
            const agFunc = this.state.aggregatorFunction;
            const canExportOnlyTotal = isOnlytotal || (config.exportOnlyTotal && displayOnlyHeader);
            if(canExportOnlyTotal){
                headers.push(pdf?{text:""}:"");
            }
            Object.map(this.state.columns,(col,i)=>{
                if(hasFields && !fields.includes(i)) return;
                if(!isObj(col) || col.visible === false || this.isSelectableColumn(col,i) || i === this.getIndexColumnName()) return;
                if(canExportOnlyTotal && !(i in footers)) return;
                cols[i] = col;
                const textVal = defaultStr(col.label,col.text);
                if(pdf && !textVal){
                    headers.push({text:""});
                } else {
                    headers.push(textVal);
                }
                totalColumns++;
            });
            data.push(headers);
            if(canExportOnlyTotal && isNonNullString(agFunc)){
                const totalFooter = [pdf?{text:"TOTAUX",fontSize:16,bold:true}:"TOTAUX"];
                Object.map(fValues,(f,i)=>{
                    if(!isObj(f) || hasFields && !fields.includes(i) || !(agFunc in f)) return;
                    const vNum = defaultNumber(f[agFunc]);
                    const text = pdf ? this.formatValue(vNum,f.format,i) : vNum;
                    totalFooter.push(pdf?{text,bold:true,fontSize:15,alignment:"center",color:"red"}:text);
                });
                data.push(totalFooter);
            }
            Object.map(this.state.data,(dat,index)=>{
                ///si l'on a a faire à une colonne de type entete
                const d = [];
                if(dat.isSectionListHeader){
                    if(!config.displayTotals && !canExportOnlyTotal) return;
                    const {sectionListHeaderKey:key} = dat;
                    let val = key === this.emptySectionListHeaderValue ? this.getEmptySectionListHeaderValue() : key;
                    if(pdf){
                        val = {text : val, colSpan :totalColumns,bold:true,fontSize:15};
                    }
                    d.push(val);
                    if(!canExportOnlyTotal){
                        for(let i = 1;i<totalColumns;i++){
                            d.push(null);
                        }
                        data.push(d);
                        const hF = hFooters[key];
                        if(isObj(hF) && isNonNullString(agFunc)){
                            const totalSectionFooter = [];
                            Object.map(cols,(col,i)=>{
                                if(i in hF){
                                    const ff = hF[i];
                                    const vNum = defaultNumber(ff[agFunc]);
                                    const text = pdf ? this.formatValue(vNum,col.format,i) : vNum;
                                    totalSectionFooter.push(pdf?{text,bold:true,fontSize:15,alignment:"center"}:text);
                                } else {
                                    totalSectionFooter.push(null);
                                }
                            });
                            data.push(totalSectionFooter);
                        }
                    } else {
                        const hF = hFooters[key];
                        if(isObj(hF) && isNonNullString(agFunc)){
                            const dd = [];
                            Object.map(cols,(col,i)=>{
                                if(i in hF){
                                    const ff = hF[i];
                                    const vNum = defaultNumber(ff[agFunc]);
                                    const text = pdf ? this.formatValue(vNum,col.format,i) : vNum;
                                    dd.push(pdf?{text,bold:true,fontSize:15,alignment:"center"}:text);
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
                            if(canExportOnlyTotal){
                                d.push(null);
                            }
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
                            formatValue : !pdf,
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
        return {...args,data,headers,config}
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
        if(this.canExportToPDF()){
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
                        tooltip : "Cliquez pour configurer les graphes",
                        onPress : ()=>{
                            this.configureChart(false).then((config)=>{
                                this.setIsLoading(true,()=>{
                                    this.setState({config});
                                })
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
    *       @param {object} xAxisColumn la colonne de l'axe des x de la courbe, pris dans les configurations du chart, config
    *       @param {object} la fonction d'aggrégation, l'une des fonctions issues des fonctions d'aggrégations aggregatorsFuncions, @see : dans $components/Datagrid/Footer
    *   en affichage des tableaux de type sectionList, seul les colonnes de totalisation sont utilisées pour l'affichage du graphe
    *   Le nombre de graphes (series) à afficher est valable pour tous les graphes sauf les graphes de type pie/donut. 
    *   il est récupéré dans la variable chartConfig des configuration du chart, où par défaut le nombre de colonnes de totalisation des tableau (inférieur au nombre maximum de courbes surpportées par appexchart)
    */
   getSectionListHeadersChartOptions({chartType,yAxisColumn,xAxisColumn,aggregatorFunction}){
        if(!this.isSectionList()) return null;
        if(!isObj(chartType) || !isObj(yAxisColumn) || !yAxisColumn.field) return null;
        if(!this.isValidAggregator(aggregatorFunction)){
            aggregatorFunction = this.getActiveAggregatorFunction();
        }
        const code = aggregatorFunction.code;
        const isDonut = chartType.isDonut || chartType.isRadial;
        const config = this.getConfig();
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
        return defaultNumber(this.props.chartProps?.height,this.props.chartConfig?.height,this.isDashboard()?100:350);
   }
   getDefaultChartWidth(){
        return defaultNumber(this.props.chartProps?.width,this.props.chartConfig?.width);
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
        const config = this.getConfig();
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
        let chartWidth = defaultNumber(config.width) || this.getDefaultChartWidth() || undefined;
        if(chartWidth ===0){
            chartWidth = undefined;
        }
        const chartOptions = {
            ...chartProps,
            dataLabels : extendObj(true,{enabled:false},chartProps.dataLabels,{
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
                    return this.formatValue(value,column.format,columnField);
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
                    width : chartWidth,
                    type : chartType.type
                },
            )
        }
        const labelColor = theme.Colors.isValid(config.labelColor)? config.labelColor : theme.setAlphaColor(theme.colors.text); 
        if(!isDonut){
            chartOptions.xaxis = extendObj(true,{},{type: 'category'},chartProps.xaxis,xaxis);
            const xLabels = chartOptions.xaxis.labels = defaultObj(chartOptions.xaxis.labels);
            xLabels.style = defaultObj(xLabels.style)
            xLabels.style.colors = (Array.isArray(xLabels.style.colors) && xLabels.style.colors.length || theme.Colors.isValid(xLabels.style.colors)) ? xLabels.style.colors : labelColor;
        } else {
            delete chartOptions.xaxis;
            //delete chartOptions.yaxis;
        }
        chartOptions.yaxis = extendObj(true,{},{type: 'category'},defaultObj(chartProps.yaxis));
        const yLabels = chartOptions.yaxis.labels = defaultObj(chartOptions.yaxis.labels);
        yLabels.align = "right";
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
            return this.formatValue(value,format,yAxisColumn.field);
        }
        chartOptions.chart.id = this.chartIdPrefix+"-"+defaultStr(chartType.key,"no-key");
        if(!chartType.isDonut){
            delete chartOptions.labels;
        }
        const sparkline = !!(typeof config.sparkline !==undefined ? (isObj(config.sparkline)? config.sparkline.enabled : config.sparkline) : (isObj(chartOptions.chart.sparkline)? chartOptions.chart.sparkline.enabled:chartOptions.chart.sparkline));
        chartOptions.chart.sparkline = {enabled: sparkline}
        chartOptions.xaxis = defaultObj(chartOptions.xaxis,config.xaxis);
        chartOptions.xaxis.labels = defaultObj(chartOptions.xaxis.labels);
        const xLabels = chartOptions.xaxis.labels;
        const showXaxis = sparkline ? false : ("showXaxis" in config) ? !!config.showXaxis : !this.isDashboard();
        xLabels.show  = showXaxis;
        chartOptions.xaxis.show = sparkline ? false :  "show" in chartOptions.xaxis ? !! chartOptions.xaxis.show : showXaxis;
        xLabels.style = Object.assign({},xLabels.style);
        xLabels.style.colors = (Array.isArray(xLabels.style.colors) && xLabels.style.colors.length || theme.Colors.isValid(xLabels.style.colors)) ? xLabels.style.colors : labelColor;
        
        chartOptions.yaxis.labels = defaultObj(chartOptions.yaxis.labels);
        const showYaxis = sparkline ? false : ("showYaxis" in config) ? !!config.showYaxis : !this.isDashboard();
        chartOptions.yaxis.show = sparkline ? false : "show" in chartOptions.yaxis ? !! chartOptions.yaxis.show : showYaxis;
        chartOptions.yaxis.labels.show = showYaxis;
        chartOptions.yaxis.show = "show" in chartOptions.yaxis ? !!chartOptions.yaxis : showYaxis;
        
        chartOptions.legend = defaultObj(chartOptions.legend);
        chartOptions.legend.show = ("showLegend" in config) ? !!config.showLegend : !this.isDashboard();
        chartOptions.legend.labels = Object.assign({},chartOptions.legend.labels);
        const legendLabels = chartOptions.legend.labels;
        chartOptions.legend.labels.colors = (Array.isArray(legendLabels.colors) && legendLabels.colors.length || theme.Colors.isValid(legendLabels.colors)) ? legendLabels.colors : labelColor;
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
      if(!this.hasFootersFields()) return false;
      return this.state.showFooters || this.hasSectionListData() && this.state.displayOnlySectionListHeaders;
   }
   canShowFilters(){
        return this.isFilterable() && this.state.showFilters
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
                });
            } else {
                this.setIsLoading(true,()=>{
                    const data = this.state.data.filter((d)=>d?.isSectionListHeader === true);
                    this.setState({data,displayOnlySectionListHeaders,showFooters});
                })
            }
        },0);
   }
   /*** permet d'effectuer le rendu des colonnes groupable dans le menu item */
   renderSectionListMenu(){
        if(!this.renderSectionListIsAllowed) return null;
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
                    right : (p)=><Icon {...p} name="material-settings"/>,
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
       const nSectionList = {};
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
                datagridMenuItems,
                ...restCol
            } = header;
            this.filteredValues = defaultObj(this.filteredValues);
            restCol = Object.clone(defaultObj(restCol));
            let colFilter = defaultVal(restCol.filter,true);
            const columnField = field = restCol.field = header.field = restCol.field = defaultStr(field,headerIndex);
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
                const mWidth = type.toLowerCase().contains('datetime')? DATE_TIME_COLUMN_WIDTH : DATE_COLUMN_WIDTH;
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
            widths[columnField] = width;
            const colProps = {id,key}
            colProps.key = isNonNullString(key)?key : (columnField||("datagrid-column-header-"+headerIndex))
            colProps.style = Object.assign({},StyleSheet.flatten(restCol.style));
            if(!visible){
                colProps.style.display = 'none';
            }
            visibleColumnsNames[columnField] = visible ? true : false;
            const label = header.label = header.text = restCol.label = header.text && React.isValidElement(header.text,true) ? header.text : header.label && React.isValidElement(header.label,true)? header.label : columnField;
            const title = label || header.title && React.isValidElement(header.title,true)? header.title : columnField
            
            visibleColumns.push({
                onPress : ()=>{
                    setTimeout(() => {
                        this.toggleColumnVisibility(columnField);
                    },100);
                    return false;
                },
                title,
                label,
                icon : visible?CHECKED_ICON_NAME : null,
                right : false ? (p)=><Icon {...p} icon="material-gear"
                    onPress = {(e)=>{console.log(e," is pressed toddd config")}}
                /> : undefined
            });
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
                const fCol = defaultObj(this.filters[columnField]);
                this.filters[columnField] = fCol;
                filterableColumnsNames.push(columnField);
                delete restCol.sortable;
                const defaultFilterProps = {
                    operator : fCol.operator,
                    action : defaultStr(fCol.originAction,fCol.action),
                    defaultValue : defaultVal(fCol.defaultValue,restCol.defaultValue),
                }
                const filteringVal = this.filteredValues[columnField];
                if(!isObj(filteringVal)){
                    this.filteredValues[columnField] = defaultFilterProps;
                } else {
                    if("value" in filteringVal){
                        defaultFilterProps.defaultValue = filteringVal.value;
                    }
                    if("operator" in filteringVal){
                        defaultFilterProps.operator = filteringVal.operator;
                    }
                    if("action" in filteringVal){
                        defaultFilterProps.action = filteringVal.action;
                    }
                }
                filterProps = {
                    ...Object.clone(restCol),
                    type,
                    columnIndex,
                    visibleColumnIndex,
                    sortable:isColumnSortable,
                    sorted:isColumnSorted,
                    sortedColumn :sortedProps,///les props de la columns triée
                    sortedProps,
                    width,
                    columnField,
                    field,
                    index : headerIndex,
                    visible,
                    key : columnField,
                    label,
                    orOperator : defaultBool(filterOrOperator,header.orOperator,true),
                    andOperator : defaultBool(this.props.filterAndOperator,header.andOperator,true),
                    searchIconTooltip : 'Filtre',
                    searchIcon : 'filter_list',  
                    name : columnField,
                    onClearFilter : this.onClearFilter.bind(this),
                    onChange : this.onFilterChange.bind(this),
                    ...defaultFilterProps,
                };
                this.currentFilteringColumns[columnField] = filterProps;
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
                //columnDef : header,
                index : headerIndex,
                filterProps,
                key : columnField,
                filter :colFilter, 
            },headerFilters)
            
            if(this.props.groupable !== false && header.groupable !== false && !this.isSelectableColumn(header,columnField) && !this.isIndexColumn(header,columnField)){
                const isInSectionListHeader = isObj(sListColumns[field]);
                if(isInSectionListHeader){
                    nSectionList[field] = {
                        ...header,
                         width,
                         type,
                         ...sListColumns[field],
                         ...defaultObj(this.getConfiguratedValues(field)),
                    };///les colonnes de sections
                    this.sectionListColumnsSize.current++;
                }
                const mItem = {
                    ...restCol,
                    field,
                    type,
                    onPress : ()=>{
                        this.toggleColumnInSectionList(field);
                        return false;
                    },
                    title,
                    icon : isInSectionListHeader?CHECKED_ICON_NAME : null,
                };
                if(this.isSectionListColumnConfigurable(mItem)){
                    mItem.right = (p)=>{
                        return <Icon name="material-settings" {...p} onPress={(e)=>{
                            //React.stopEventPropagation(e);
                            this.configureSectionListColumn({...mItem,...defaultObj(nSectionList[field])});
                            //return false;
                        }}/>
                    }
                }
                sectionListColumnsMenuItems.push(mItem);
            }
            columnIndex++;
            visibleColumnIndex++;
            
        })
        Object.map(sListColumns,(f,i)=>{
            if(i in nSectionList){
                sectionListColumns[i] = nSectionList[i];
            }
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
        this.preparedColumns.filteredValues = this.filteredValues;
        this.preparedColumns.filtersByColumnsNames = this.currentFilteringColumns; //l'objet contenant pour chaqun des field name, le filterProp correspondant
        return this.preparedColumns;
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
    return !!this.getSectionListDataSize();
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
        return this.sectionListDataKeys.size;
    }
    isValidRowKey(rowKey){
        return !!(isNonNullString(rowKey) || typeof rowKey =='number');
    }
    getPreparedColumns(){
        return this.preparedColumns;
    }
    getColumns(){
        return isObj(this.state.columns)? this.state.columns : {};
    }
    prepareData (args,cb){
        let {pagination,config,aggregatorFunction:customAggregatorFunction,displayOnlySectionListHeaders:cdisplayOnlySectionListHeaders,data,force,sectionListColumns,sectionListCollapsedStates,updateFooters} = defaultObj(args);
        cb = typeof cb ==='function'? cb : typeof args.cb == 'function'? args.cb : undefined;
        config = isObj(config) && Object.size(config,true)? config : this.getConfig();
        const aggregatorFunction = isNonNullString(customAggregatorFunction) && customAggregatorFunction in  this.aggregatorFunctions ? this.aggregatorFunctions[customAggregatorFunction] : this.getActiveAggregatorFunction();
        sectionListColumns = isObj(sectionListColumns) ? sectionListColumns : this.state.sectionListColumns;
        sectionListCollapsedStates = isObj(sectionListCollapsedStates)? sectionListCollapsedStates: defaultObj(this.state.sectionListCollapsedStates);
        const displayOnlySectionListHeaders = typeof cdisplayOnlySectionListHeaders == 'boolean'?cdisplayOnlySectionListHeaders : this.state.displayOnlySectionListHeaders;
        let isArr = Array.isArray(data);
        //let push = (d,index) => isArr ? newData.push(d) : newData[index] = d;
        const hasLocalFilter = this.props.filters !== false && this.hasLocalFilters;
        const footersColumns = this.getFootersFields(),hasFootersFields = this.hasFootersFields();
        const canUpdateFooters = !!(updateFooters !== false && hasFootersFields);
        this.sectionListDataKeys.clear();
        this.rowsByKeys = {};
        this.rowsKeysIndexes = [];
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
                const rKey = this.getRowKey(d,i);
                if(!this.isValidRowKey(rKey)) return;
                this.rowsByKeys[rKey] = d;
                this.rowsKeysIndexes.push(rKey);
                if(hasSectionColumns  && this.renderSectionListIsAllowed){
                    let sHeader = this.getSectionListHeader({config,data:d,columnsLength : sectionListColumnsSize,fieldsSize:sectionListColumnsSize,sectionListColumnsLength:sectionListColumnsSize,sectionListColumnsSize,allData:data,rowData:d,index:i,rowIndex,context:this,columns,fields:columns});
                    if(sHeader === false) return;//on omet la donnée si la fonction de récupération de son header retourne false
                    if(!isNonNullString(sHeader) || sHeader.toLowerCase().trim() =="undefined"){
                        if(this.props.ignoreEmptySectionListHeader !== false){
                            sHeader = this.emptySectionListHeaderValue;
                        } else return;
                    }
                    const r  = this.formatSectionListHeader(sHeader);
                    this.sectionListDataKeys.add(r);
                    if(!Array.isArray(sectionListData[r])){
                        sectionListData[r] = [];
                    }
                    sectionListData[r].push(d); 
                    if(canUpdateFooters){
                        ///garde pour chaque éléments de groue, la valeur des champs de son footer
                        this.sectionListHeaderFooters[r] = defaultObj(this.sectionListHeaderFooters[r]);
                        currentSectionListFooter = this.sectionListHeaderFooters[r];
                    }
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
            if(this.getSectionListDataSize() && hasSortField && defaultStr(sortingField.type).toLowerCase().contains("date")){
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
        } else {
            const newData = [];
            Object.map(data,(d,i,rowIndex)=>{
                if(!isObj(d)) return;
                const rowKey = this.getRowKey(d,i,rowIndex);
                if(!this.isValidRowKey(rowKey)) return;
                this.rowsByKeys[rowKey] = d;
                this.rowsKeysIndexes.push(rowKey);
                newData.push(d);
            });
            data = newData;
        }
        this.INITIAL_STATE.data = data;
        if(this.getSectionListDataSize()){
            data = [];
            this.sectionListDataKeys.forEach((sectionListHeaderKey)=>{
                data.push({isSectionListHeader:true,sectionListHeaderKey});
                if(!displayOnlySectionListHeaders){
                    this.sectionListData[sectionListHeaderKey].map((d)=>{
                        data.push(d);
                    })
                }
            });
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
        const state = {data,displayOnlySectionListHeaders,sectionListCollapsedStates,aggregatorFunction:aggregatorFunction.code};
        if((cb)){
            cb(state);
        }
        return state;
    }
    getSectionListHeader(args){
        if(this.getSectionListHeaderProp){
           return this.getSectionListHeaderProp(args);
        }
        const config = isObj(args.config) && Object.size(args.config,true)? args.config : this.getConfig();
        const displayGroupLabels = "displayGroupLabels" in config? config.displayGroupLabels : false;
        const displayGroupLabelsSeparator = typeof config.displayGroupLabelsSeparator =='string'? config.displayGroupLabelsSeparator : arrayValueSeparator;
        const {fields} = args;
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
            const labelText = defaultStr(field.label,field.text);
            if(!displayGroupLabels || !labelText){
                d.push(txt);
            } else {
                d.push("{0} : {1}".sprintf(labelText,txt))
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
    getSectionListCollapsedStates(){
        return defaultObj(this.state.sectionListCollapsedStates)
    }
    isSectionListCollapsed(sectionListKey){
        return isNonNullString(sectionListKey)? !!this.getSectionListCollapsedStates()[sectionListKey] : false;
    }
    toggleSectionListCollapsedState(sectionKey){
        const s = getSectionListCollapsedStates;
        if(!isNonNullString(sectionKey)) return;
        s[sectionKey] = !!!s[sectionKey];
        this.setIsLoading(true,()=>{
            this.setState({sectionListCollapsedStates:{...s}});
        },TIMEOUT);
    }
    /****permet de faire le rendu flashlist */
    renderFlashListItem(args){
        if(!this.hasSectionListData()) return null;
        args = defaultObj(args);
        let {item,rowStyle} = args;
        if(!isObj(item) || item.isSectionListHeader !== true || !isNonNullString(item.sectionListHeaderKey)) return null;
        args.isAccordion = this.isAccordion();
        args.columns = this.preparedColumns.visibleColumns;
        args.columnsNames = this.preparedColumns.visibleColumnsNames;
        const key = item.sectionListHeaderKey;
        const label = key === this.emptySectionListHeaderValue ? this.getEmptySectionListHeaderValue() : key;
        const {renderSectionListHeaderOnFirstCell} = args;
        const sectionListHeaderContainerProps = defaultObj(args.sectionListHeaderContainerProps);
        const style = typeof this.props.getSectionListHeaderStyle =='function' ? this.props.getSectionListHeaderStyle(args) : null;
        const cStyle = typeof this.props.getSectionListHeaderContentContainerStyle =="function" ?this.props.getSectionListHeaderContentContainerStyle(args) : undefined;
        const lStyle = typeof this.props.getSectionListHeaderLabelStyle =='function' ? this.props.getSectionListHeaderLabelStyle(args) : null;
        const rowKey = defaultVal(args.rowIndex,args.index,args.rowCounterIndex);
        const rowIndex = defaultNumber(args.rowIndex,args.index);
        const testID  = defaultStr(args.testID,"RN_DatagridSectionListHeader")+"_"+rowKey;
        if(Array.isArray(rowStyle)){
            if(style){
                rowStyle.push(style);
            }
        }
        const cells = [];
        const Cell = React.isComponent(args.Cell) ? args.Cell : View;
        const isA = this.isAccordion();
        const sectionListHeaderProps = defaultObj(args.sectionListHeaderProps);
        const headerContent = <Label testID={testID+"_Label"} splitText numberOfLines={3} textBold {...sectionListHeaderProps} style={[theme.styles.w100,{color:theme.colors.primaryOnSurface,fontSize:isA?15 :16},isA && tableStyles.accordionSectionListHeader,lStyle,theme.styles.ph1,sectionListHeaderProps.style]}>{label}</Label>;
        let hasAlreadRenderMainHeaderOnFirstCell = false;
        if(this.canShowFooters() && isObj(this.sectionListHeaderFooters[key])){
            const {visibleColumnsNames,widths} = defaultObj(this.preparedColumns);
            if(isObj(visibleColumnsNames) &&isObj(widths)){
                const footers = this.sectionListHeaderFooters[key];
                Object.map(visibleColumnsNames,(v,column)=>{
                    if(!v || !column) {
                        return null;
                    }
                    const width = widths[column];
                    const key2 = key+column;
                    const cellProps = Cell !== View ? {width,isSectionListHeader:true,columnField:column} : {style:{width}};
                    if(!this.state.columns[column] || !footers[column]) {
                        if(this.isAccordion()) return null;
                        const canD = renderSectionListHeaderOnFirstCell && !hasAlreadRenderMainHeaderOnFirstCell;
                        const cProps = canD ? sectionListHeaderContainerProps : {};
                        cells.push(<Cell {...cellProps} {...cProps} key={key2} testID={testID+"_FooterCellContainer_"+key2} style={[{marginLeft:0,paddingLeft:0,marginRight:0,paddingRight:0},cellProps.style,cProps.style]}
                            children = {canD ? headerContent:null}
                        />)
                    } else {
                        const footer = footers[column];
                        const canD = renderSectionListHeaderOnFirstCell && !hasAlreadRenderMainHeaderOnFirstCell;
                        const cProps = canD ? sectionListHeaderContainerProps : {};
                        cells.push(<Cell {...cellProps} {...cProps} key={key2} width={width} testID={testID+"_FooterCellContainer_"+key2} style={[tableStyles.headerItemOrCell,!isA?{alignItems:'flex-start',justifyContent:'flex-start'}:{marginLeft:0,paddingLeft:0,marginRight:5,paddingTop:5,paddingBottom:5},cellProps.style,cProps.style]}>
                            {canD ? headerContent:null}
                            <Footer
                                key = {key2}
                                testID={testID+"_FooterItem_"+key2}
                                {...footer}
                                abreviate = {this.state.abreviateValues}
                                aggregatorFunction = {this.getActiveAggregatorFunction().code}
                                aggregatorFunctions = {this.aggregatorFunctions}
                                displayLabel = {this.isAccordion()}
                            />  
                        </Cell>)
                    }
                    hasAlreadRenderMainHeaderOnFirstCell = true;
                });
            }
        }
        if(React.isComponent(args.Row)){
            return <args.Row index={rowIndex} rowData={item} rowIndex={rowIndex} isSectionListHeader  cells={cells} headerContent={headerContent}/>
        }
        return <View testID={testID+"_ContentContainer"}  style={[theme.styles.w100,isA && this.state.displayOnlySectionListHeaders && {borderTopColor:theme.colors.divider,borderTopWidth:1},isA ? [theme.styles.ph2,theme.styles.pt1] : [theme.styles.pt1,theme.styles.noPadding,theme.styles.noMargin],theme.styles.justifyContentCenter,theme.styles.alignItemsCenter,theme.styles.pb1,!cells && theme.styles.ml1,theme.styles.mr1,cStyle]}>
            {headerContent}
            {cells.length ? <View testID={testID+"_TableRow"} style = {[theme.styles.w100,theme.styles.row,isA && theme.styles.pt1,theme.styles.alignItemsFlexStart,this.isAccordion() && theme.styles.rowWrap]}
            >{cells}</View> : null}
        </View>
    }
    isRowSelected(rowKey,rowIndex){
        if(isObj(rowKey)){
            rowKey = this.getRowKey(rowKey,rowIndex);
        }
        if(!this.isValidRowKey(rowKey)){
            rowKey = this.getRowKeyByIndex(rowIndex);
        }
        if(!this.isValidRowKey(rowKey)) return false;
        return this.selectedRowsKeys.has(rowKey);
    }
   /*** permet de définir les lignes sélectionnées du datagrid */
   setSelectedRows (rows){
       this.selectedRowsKeys.clear();
       const sRows = {};
       Object.map(rows,(row,i)=>{
            const rowKey = this.getRowKey(row,i);
            if(this.canSelectRow(row) && this.isValidRowKey(rowKey)) {
                this.selectedRowsKeys.add(rowKey);
                sRows[rowKey] = row;
            }
        });
       return sRows;
    }
   
    renderProgressBar(props){
        if(this.props.renderProgressBar === false || !this.canRenderProgressBar()) return null;
        if(typeof props !=='object' || !props || Array.isArray(props)){
            props = {};
        }
        const ProgressBar = this.props.renderProgressBar;
        const children = React.isValidElement(ProgressBar) ? ProgressBar : 
            this.props.useLinesProgressBar === true || this.props.withLineProgressBar ===true || this.props.useLineProgressBar === true ? CommonDatagridComponent.LineProgressBar(props)
            : React.isComponent(ProgressBar) ?<ProgressBar/> : this.getDefaultPreloader(props);
        return <DatagridProgressBar
            {...props}
            datagridContext = {this}
            onChange = {(context)=>{
                this.isLoadingRef.current = context.isLoading;
            }}
            isLoading = {this.isLoading()}
            children = {children}  
            ref = {this.renderProgressBarRef}
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
    ///si les filtres devront être parsé, pour être preparés au format SQL
    canConvertFiltersToSQL(){
        return !!(this.props.parseMangoQueries);;
    }
    /*** retourne la liste des colonnes sur lesquelles on peut effectuer un filtre*/
    getFilterableColumnsNames(){ 
        const {filterableColumnsNames} = defaultObj(this.preparedColumns);
        return Array.isArray(filterableColumnsNames)? filterableColumnsNames : [];
    }
    /*** récupère les filtres en cours du datagrid
     * @param {boolean} prepare si les filtres seront apprêtés grace à la méthode prepareFilters de $cFilters 
     * @param {boolean} parseMangoQueries, si l'on doit parser les filtres initialement au format mangoqueries, les preparer au format SQL
     */
    getFilters(args){
        args = defaultObj(args);
        const prepare = typeof args.prepare =='boolean'? args.prepare : typeof args.prepareFilters =='boolean' ? args.prepareFilters : true;
        this.filters = extendObj(true,{},this.filteredValues,this.filters);
        const parseMangoQueries = typeof args.parseMangoQueries =="boolean"? args.parseMangoQueries : typeof args.parseMangoQueries =="boolean"? args.parseMangoQueries : false;
        if(prepare === false) return this.filters;
        return prepareFilters(this.filters,{filter:this.canHandleFilterVal.bind(this),parseMangoQueries});
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
    /**** cette fonction est appeléee lorsque la source de données change
        le composant dataSourceSelector doit retourner un table dataSelector, qui prendra en paramètre l'objet onChange, qui systématiquement doit être appelé lorsque la source de données change
    */
    onChangeDataSources(args){
        let {dataSources} = defaultObj(args);
        if(!Array.isArray(dataSources)) return;//la fonction onChangeDataSource doit retourner un dataSource de type array
        if(this.props.onChangeDataSources =='function' && this.props.onChangeDataSources({dataSources,prev:this.currentDataSources}) === false) return;
        if(React.isEquals(this.previousDataSources,dataSources)) return;
        this.currentDataSources = dataSources;
        this.setSessionData({selectedDatabases:dataSources}) 
        this.refresh(true);
        this.previousDataSources = dataSources;
    }
    beforeFetchData(){}
        /**** retourne la liste des items, utile lorsqu'une s'agit d'une fonction 
        Lorsque data est une chaine de caractère, alors elle doit être sous la forme recommandée par la function 
        getDataFunc de l'object dataSource
        la props data, peut être une chaine de caractère contenant le nom de la base et de la bd de travail de l'application
        example common[articles], dans ce cas, la fonction fetchData, aura pour rôle de chercher toutes les données qui match
        la table dans la base common.
        Elle pourra éventuellement passer directement la limite et les filtres à la fonction fetchdata
        si renderProgressBar est à false alors la progression ne sera pas affiché
    */
    fetchData ({cb,callback,force,renderProgressBar,fetchOptions,...rest}){
        const sData = this.INITIAL_STATE.data || (!this.isTableData() || typeof this.props.fetchData !='function') ? this.props.data : this.state.data;
        if(!this._isMounted()) return Promise.resolve(sData);
        if(this.isFetchingData) {
            if(!isPromise(this.fetchingPromiseData)){
                this.fetchingPromiseData = Promise.resolve(sData)
            }
            return this.fetchingPromiseData;
        };
        this.isFetchingData = true;
        cb = typeof cb =='function'? cb : typeof callback =='function'? callback : undefined;
        this.toggleCanRenderProgressBar(renderProgressBar);
        this.fetchingPromiseData = new Promise((resolve,reject)=>{
            setTimeout(()=>{
                if(typeof cb === 'boolean'){
                    force = cb;
                    cb = undefined;
                }
                fetchOptions = this.getFetchOptions({fetchOptions,parseMangoQueries:false});
                if(typeof this.props.fetchOptionsMutator =='function' && this.props.fetchOptionsMutator({fetchOptions,context:this}) === false){
                    this.isFetchingData = false;
                    return resolve(sData);
                }
                if(this.beforeFetchData({fetchOptions,force,context:this,renderProgressBar}) === false) return resolve(sData);
                if(this.canConvertFiltersToSQL()){
                    fetchOptions.selector = parseMangoQueries(fetchOptions.selector);
                }
                if(typeof this.props.beforeFetchData =='function' && this.props.beforeFetchData({...rest,renderProgressBar,context:this,force,fetchOptions,options:fetchOptions}) === false){
                    this.isFetchingData = false;
                    return resolve(sData);
                }
                if(force !== true && isArray(this.INITIAL_STATE.data)) {
                    return this.resolveFetchedDataPromise({cb,data:this.INITIAL_STATE.data}).then(resolve).catch(reject)
                }
                let fetchData  = undefined;
                if(isFunction(this.props.fetchData)){
                    /**** l'on peut définir la props fetchData, qui est la fonction appelée pour la recherche des données */
                    fetchData = this.props.fetchData.call(this,fetchOptions);
                }
                fetchData = isFunction(fetchData)? fetchData.call(this,fetchOptions) : fetchData;
                this.setIsLoading(true,()=>{
                    if(isPromise(fetchData)){
                        return fetchData.then(data=>{
                            return this.resolveFetchedDataPromise({cb,data,force}).then((data)=>{
                                resolve(data);
                            }).catch((e)=>{
                                console.log(e,' fetching datagrid data')
                                reject(e);
                            });
                        }).catch((e)=>{
                            console.log(e," resolve fetching data for datagrid");
                            return this.resolveFetchedDataPromise({cb,data:[],force}).then((data)=>{
                                resolve(data);
                            }).catch((e)=>{
                                console.log(e,' fetching datagrid data')
                                reject(e);
                            });;
                        })
                    } else {
                        const data = isObjOrArray(fetchData)? fetchData : sData;
                        return this.resolveFetchedDataPromise({cb,data,force}).then((data)=>{
                            resolve(data);
                        }).catch((e)=>{
                            console.log(e,' fetching datagrid data')
                            reject(e);
                        });
                    }     
                });
            },1);
        })
        return this.fetchingPromiseData;
    }
    resolveFetchedDataPromise(arg){
        arg = defaultObj(arg);
        const d = arg.data;
        if(isObj(d) && d.data && typeof d.data ==='object'){
            arg.data = d.data;
            arg.total = defaultNumber(arg.total,arg.data.total);
        }
        const {cb,data} = arg;
        return new Promise((resolve)=>{
            this.prepareData(arg,(state)=>{
                state.data = Array.isArray(state.data)? state.data : [];
                if(typeof this.props.onFetchData =='function'){
                    this.props.onFetchData({...arg,allData:data,context:this,props:this.props,data:state.data})
                }
                this.setState(state,()=>{
                    if(isFunction(cb)) {
                        cb(data)
                    } 
                    resolve(data);
                    this.isFetchingData = undefined;
                    this.setIsLoading(false);
                })
            });
        })
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
        return this.fetchData({force:true,renderProgressBar:true});
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
    /*** récupère les fetchOptions du datagrid */
    getFetchOptions({fetchOptions}){
        const fetchFilters = this.getFilters({parseMangoQueries : false});
        fetchOptions = Object.clone(isObj(fetchOptions)? fetchOptions : {});
        fetchOptions.selector = defaultObj(fetchOptions.selector);
        fetchOptions.dataSources = this.currentDataSources;
        fetchOptions.selector = fetchFilters;
        fetchOptions.sort = this.getSort();
        const canIncludeField = typeof this.props.includeFieldsInFetchOptions =='boolean'? this.props.includeFieldsInFetchOptions : true;
        if(canIncludeField){
            const ff = this.getFilterableColumnsNames();
            let fields = ff;
            if(this.isFetchOnlyVisibleColumnsEnabled()){
                fields = [];
                Object.map(ff,(field)=>{
                    if(isNonNullString(field) && isObj(this.state.columns[field]) && this.state.columns[field].visible !== false){
                        fields.push(field);
                    }
                });
            }
            fetchOptions.fields = fields;
        }
        let limit = this.getQueryLimit();
        if(limit > 0 && !this.isPivotDatagrid()){
            fetchOptions.limit = limit;
        } else {
            if(!isDecimal(fetchOptions.limit) || fetchOptions.limit <=0){
                delete fetchOptions.limit
            }
        }
        if(this.isSWRDatagrid()){
            fetchOptions.withTotal = true;
        }
        return fetchOptions;
    }
    getFetchDataOpts(){
        return this.props.fetchDataOpts;
    }

    forceRefresh(){
        this.refresh(true);
    }
    /***
        @param {boolean|object}
        @param {function|object}
    */
    refresh (force,cb){
        const opts = isObj(force)? force : isObj(cb)? cb : {};
        if(isFunction(force)){
            let t = cb;
            cb = force;
            force = isBool(t)? t : true;
        }
        opts.onSuccess = cb = typeof cb =="function"? cb : typeof opts.onSuccess =='function'? opts.onSuccess : undefined;
        opts.force = defaultBool(force,opts.force,true)
        return new Promise((resolve,reject)=>{
            return this.fetchData(opts).then((data)=>{
                if(isFunction(cb)){
                    cb(data,{...opts,context:this});
                }
                if(typeof this.props.onRefresh ==='function'){
                    this.props.onRefresh({...opts,context:this});
                }
            }).then(resolve).catch(reject);
        })
    }
    componentDidMount(){
        super.componentDidMount();
        APP.on(APP.EVENTS.SET_DATAGRID_QUERY_LIMIT,this._events.SET_DATAGRID_QUERY_LIMIT);
    }
    componentWillUnmount(){
        super.componentWillUnmount();
        APP.off(APP.EVENTS.SET_DATAGRID_QUERY_LIMIT,this._events.SET_DATAGRID_QUERY_LIMIT);
        this.clearEvents();
    }

    /*** s'il s'agit d'un datagrid virtualisé, ie à utiliser le composant react-base-table */
    isVirtual(){
        return false;
    }
    getRowKey(row,rowIndex){
        let k = rowIndex;
        if(isFunction(this.props.getRowKey)){
            k = this.props.getRowKey({row,rowData:row,data:row,rowIndex,item:row,index:rowIndex,context:this});
            if(typeof k =='string' && k || typeof k =='number'){
                return k;
            }
        } 
        const rowKey = this.props.rowKey;
        const rKey = Array.isArray(this.rowKeysColumns) && this.rowKeysColumns.length ? this.rowKeysColumns : null;
        if(rKey){
            const rr = React.getKeyFromObj(row,rKey);
            if(rr){
                return rr;
            }
        }
        const rkey = React.getKeyFromObj(row,rowIndex,rowKey);
        if(rkey){
            return rkey;
        }
        if(isNonNullString(rowKey) && isObj(row) && (isNonNullString(row[rowKey]) || isDecimal(row[rowKey]))){
            return row[rowKey];
        } 
        if(isObj(row)){
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
        return (this.renderProgressBarRef.current) && typeof this.renderProgressBarRef.current.setIsLoading =='function' ? true : false;
    }
    canHidePreloaderOnRender(){
        const cH = this[this.hidePreloaderOnRenderKey];
        return typeof cH =='boolean'? cH : true;
    }
    toggleCanRenderProgressBar(toggle){
        toggle = typeof toggle =='boolean'? toggle : true;
        this[this.canRenderProgressBarKey] = toggle;
        return toggle;
    }
    canRenderProgressBar(){
        return this[this.canRenderProgressBarKey] !== false;
    }
    toggleHidePreloaderOnRender(toggle){
        this[this.hidePreloaderOnRenderKey] = !!toggle;
    }
    onRender(){
        if(!this.props.isLoading && this.isLoadingRef.current){
            this.setIsLoading(false);
            return;
        }
    }
    /***
     * @param {boolean} loading
     * @param {function | boolean} cb | enablePointerEvents
     */
    setIsLoading (loading,cb,timeout){
        loading = this.props.isLoading === true ? true : typeof loading =='boolean'? loading : false;
        timeout = typeof timeout =='number'? timeout : 500;
        cb = typeof cb =='function'? cb : x=>true;
        this.isLoadingRef.current = loading;
        this.trigger("toggleIsLoading",{isLoading:loading});
        return setTimeout(cb,timeout);
    }
    isAllRowsSelected(){
        const count = this.getSelectedRowsCount() - this.getSectionListDataSize();
        if(count <= 0) return false;
        return count >= this.getMaxSelectableRows();
    }
    getDefaultPaginationRowsPerPageItems (){
        return [5,10,15,20,25,30,40,50,60,80,100];
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
        if(this.enablePointerEventsRef.current) return "auto";
        if(this.props.isLoading == true){
            return "none";
        }
        return "auto";
    }
    isTableData(){
        return false;
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        if(false && !React.areEquals(this.props.columns,nextProps.columns)){
            const newColumns = this.initColumns(nextProps.columns);
            console.log("will prepare column ",newColumns,this.state.columns);
            this.setIsLoading(true,()=>{
                this.setState({columns:newColumns},()=>{
                    this.prepareColumns();
                    console.log("preparing data ",nextProps);
                    this.prepareData({...nextProps,force:true},(state)=>{
                        console.log("setting state data",state,this.state);
                        this.setState(state)
                    })
                })
            },0);
            return;
        }
        const cb = ()=>{
            if(typeof nextProps.isLoading =='boolean' && nextProps.isLoading !== this.isLoading()){
                this.setIsLoading(nextProps.isLoading);
            }
            return false;
        }
        if(nextProps.data === this.props.data || React.areEquals(nextProps.data,this.props.data)) {
            return cb();
        }
        const newStableHash = stableHash(nextProps.data);
        this.prevStableDataHash = this.prevStableDataHash !== undefined ? this.prevStableDataHash : stableHash(this.props.data);
        if(newStableHash == this.prevStableDataHash) return cb();
        this.prevStableDataHash = newStableHash;
        this.setIsLoading(true,()=>{
            this.prepareData({...nextProps,force:true},(state)=>{
                this.setState(state)
            })
        },0);
    }
    getDefaultPreloader(props){
        return CommonDatagridComponent.getDefaultPreloader({isDashboard:this.isDashboard()});
    }
    isLoading (){
        if(this.state.isReady === false) return true;
        if(typeof this.props.isLoading =='boolean') return this.props.isLoading;
        return !!this.isLoadingRef.current;
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
        const isIndex = true;//this.isIndexColumn(columnDef,columnField);
        if(this.isSelectableColumn(columnDef,columnField)){
            const style = this.getSelectableColumNameStyle();
            if(isObj(containerProps)){
                containerProps.style = [this.getSelectableColumNameStyle(),containerProps.style];
            }
            return <Checkbox
                testID = "RN_SelectColumnHeaderCell"
                toggleAll
                key = {this.getSelectableColumName()}
                secondaryOnCheck
                style = {[style]}
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
            <View testID={"RN_DatagridHeaderCellContainer_"+columnField} style={[theme.styles.row,theme.styles.flex1,theme.styles.justifyContentFlexStart,theme.styles.alignItemsCenter]}>
                {isColumnSorted ? <Icon
                    {...sortedColumn}
                    size = {24}
                    style = {[sortedColumn.style,styles.sortedColumnIcon]}
                    name = {sortedColumn.icon}
                    onPress = {sortMe}
                    primary
                />: null}
                <Label testID={"RN_DatagridHeaderCellLabel_"+columnField} textBold style={[{fontSize:13}]} primary={isColumnSorted}>{ret}</Label>
                {!isIndex ? <Menu
                    anchor={(p)=><Icon name={MORE_ICON} {...p} size={20} style={[p.style,theme.styles.noMargin,theme.styles.noPadding]} primary={isColumnSorted||p.primary}/>}
                    items = {{
                        toggleVisibility : {
                            icon : 'eye',
                            text : `Masquer la colone [${ret}]`,
                            onPress : (e)=>{
                                this.toggleColumnVisibility(columnField);
                            }
                        }
                    }}
                />:null}
            </View>
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
        const title = typeof this.props.title =="function"? this.props.title({context:this,config:this.getConfig()}) : this.props.title;
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
    canRenderActions(){
        return this.props.showActions !== false && this.props.renderActions !== false;
    }
    renderSelectFieldCell(args){
        return this.renderSelectFieldCell(args);
    }
    getRowByKey(rowKey){
        return (this.isValidRowKey(rowKey))  && isObj(this.rowsByKeys[rowKey]) && this.rowsByKeys[rowKey] || null;
    }
    getRowsKeysIndexes(){
        return Array.isArray(this.rowsKeysIndexes) ? this.rowsKeysIndexes : [];
    }
    getRowKeyByIndex(rowIndex){
        if(typeof rowIndex !='number') return undefined;
        const idx = this.getRowsKeysIndexes();
        if(rowIndex < idx.length && rowIndex>=0){
            return idx[rowIndex];
        }
        return undefined;
    }
    getRowByIndex(rowIndex){
        const rowKey = this.getRowKeyByIndex(rowIndex);
        return rowKey !== undefined ? this.getRowByKey(rowIndex) : null;
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
        isSectionListHeader = isSectionListHeader || rowData.isSectionListHeader;
        if(!isSectionListHeader && this.state.displayOnlySectionListHeaders){
            return {render:null};
        }
        rowKey = this.isValidRowKey(rowKey) ? rowKey : this.getRowKey(rowData,rowIndex);
        rowCounterIndex = isDecimal(rowCounterIndex) ? rowCounterIndex : isDecimal(rowIndex)? rowIndex+1 : defaultDecimal(rowCounterIndex);
        if(this.isSelectableColumn(columnDef,columnField)){
            if(renderText) return null;
            return {render :handleSelectableColumn === false ? null : this.renderSelectableCheckboxCell({
            ...arg,
            rowKey,
            rowData,
            checked : this.isRowSelected(rowKey,rowIndex),
            onPress : ({checked})=>{
                return this.handleRowToggle({rowIndex,rowKey,selected:!checked});
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

CommonDatagridComponent.getDefaultPreloader = (r)=>{
    const {isDashboard,...props} = defaultObj(r);
    return isDashboard? <ActivityIndicator size={"large"} {...props} style={[theme.styles.pb10,props.style]}/> : <Preloader {...props}/>
}

const chartDisplayType = PropTypes.oneOf(Object.keys(displayTypes).filter(type=>{
    const x = displayTypes[type];
    return typeof x =='object' && x && typeof x.disabled !== true && x.isChart === true && true || false;
}));
CommonDatagridComponent.propTypes = {
    isRowSelectable : PropTypes.func,//spécifie si la ligne rowData est selectionable : function({row,rowData,context})=><boolean>
    title : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.string,
        PropTypes.node,
        PropTypes.element,
    ]),
    includeFieldsInFetchOptions : PropTypes.bool,//si les champs de colonnes seront inclus dans les fetchOptions du datagrid
    canMakePhoneCall : PropTypes.bool,//si l'on peut faire un appel sur la données sélectionnées
    makePhoneCallProps : PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.func,
    ]),
    filterable : PropTypes.bool, //si le composant peut être filtrable
    /*** si les filtres de données seront convertis au format SQL avant d'effectuer la requête distante */
    parseMangoQueries : PropTypes.bool,
    isLoading : PropTypes.bool,///si les données sont en train d'être chargées
    session : PropTypes.bool, /// si les données de sessions seront persistées
    exportTableProps : PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.object,
    ]),
    chartActions : PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array, //les actions supplémentaires à passer au graphe chart
    ]),
    /*** si l'opérateur or de filtre est accepté */
    filterOrOperator : PropTypes.bool,
    /*** si l'opérateur and de filtre est accepté */
    filterAndOperator : PropTypes.bool,
    /**** les actions qui s'appliquent lorsqu'une où plusieurs lignes sont sélectionnées */
    selectedRowsActions : PropTypes.oneOfType([PropTypes.object,PropTypes.array,PropTypes.func]),
    /** Les actions de la barre d'outil du datagrid : il peut s'agit d'une fonction qui lorsqu'elle est appelée retourne l'ensemble des actions du datagrid
     *  La fonction prend en paramètre : 
     *  selectedRows :  : les lignes sélectionnées
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
    /*** alias à show actions */
    renderActions : PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.func,
    ]),
    showActions : PropTypes.bool,//si on affichera les actions du datagrid
    /*** affiche ou masque les filtres */
    showFilters : PropTypes.bool,
    /*** si le pied de page sera affiché */
    showFooters : PropTypes.bool,
    /*** les donnnées peuvent être soient retournées par une fonction, soit par un tableau soit une promesse */
    data : PropTypes.oneOfType([PropTypes.array, PropTypes.func,PropTypes.object]),//.isRequired,
    /****
        la prop column def contient dans la propriété datagrid, la prop maxItemsToRender, le nombre d'items maximal à rendre pour le composant de type select table data multiple
        la prop column def de la colonne de type number, qui contient dans la prop datagrid, la fonction render doit retourner un nombre pour otenir les valeur léie à ladite colonne
    */
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
    renderProgressBar : PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.bool, //si false, alors le progress bar ne sera pas rendu
        PropTypes.element,
    ]),
    /*** fonction permettant de retourner l'unique clé des éléments du tableau */
    getRowKey : PropTypes.func,
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
    /*** cette props permet de récupérer les options supplémentaires à passer à la fonction createPDF de pdfmake */
    pdfConfig : PropTypes.oneOfType([
        PropTypes.func, //si fonction, function({context})=><Object>
        PropTypes.shape({
            logo : PropTypes.string, //les options d'impression au format pdf
        })
    ]),
    /*** si le rendu du datagrid est exportable */
    exportable : PropTypes.bool,
    baseId : PropTypes.string,
    mobile: PropTypes.bool,
    tablet: PropTypes.bool,
    /*** les props des actions du datagrid */
    actionsProps : PropTypes.shape({
        ///style : les styles
        style : StyleProps,
        testID : PropTypes.string,///le test id
    }),
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
        PropTypes.array,
        PropTypes.object,
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
    /***les props de configuration du chart, */
    config : PropTypes.shape({
        aggregatorFunction  : PropTypes.string, //la fonction d'aggrégation à utiliser
    }),
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
    exportToPDFIsAllowed : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
        PropTypes.bool,
    ]),
    /*** la permission autorisée pour l'export en excel*/
    exportToExcelIsAllowed : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
        PropTypes.bool,
    ]),
    renderSectionListIsAllowed : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
        PropTypes.bool,
    ]),
    /*** la permission que doit avoir l'utilisateur pour pouvoir visualiser les graphes à partir du diagrame */
    renderChartIsAllowed : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
        PropTypes.bool,
    ]),
    onRefresh : PropTypes.func,//lorsque la fonction refresh est appelée
    displayType : chartDisplayType,
    /*** les types d'afichates supportés par l'application */
    displayTypes : PropTypes.arrayOf(chartDisplayType),
    /***le code de la fonction d'aggregation à utilier par défaut, dans la liste des fonctions d'aggrégations du composant */
    aggregatorFunction : PropTypes.string,
    /*** permet de faire une mutation sur les options de la recherche, immédiatement avant le lancement de la recherche */
    fetchOptionsMutator : PropTypes.func,
    resetSessionData : PropTypes.bool, //pour forcer la réinitialisation des données de sessions liés à la table data 
    /*** si les données à récupérer à distance seront  */
    fetchOnlyVisibleColumns : PropTypes.bool,
    canFetchOnlyVisibleColumns : PropTypes.bool,//si l'on peut modifier le type d'affichage lié à la possibilité de récupérer uniquement les données reletives aux colonnes visibles
    useLinesProgressBar  : PropTypes.bool,//si le progress bar lignes horizontale seront utilisés
    abreviateValues : PropTypes.bool, //si les valeurs numériques seront abregées
    handleTitle : PropTypes.bool,//si le titre du datagrid, props title, sera pris en compte dans les actions du datagrid, pour le rendu du DataSourceSelector, fonction renderDataSourceSelector
    checkPerms : PropTypes.func,//la fonction utilisée pour vérifier les permissions de l'utilisateur
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