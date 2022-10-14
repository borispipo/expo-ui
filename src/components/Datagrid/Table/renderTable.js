require("./datagrid.css");
let Filter = require("$ecomponents/Filter");
let DatagridActions = require("$wcomponents/Datagrid/DatagridActions");
let Tooltip = require("$ecomponents/Tooltip")
import {FooterItem as Footer} from "./Footer";
let ExportTable = require("$export-table")
let RenderType = require("./RenderType");
let LocalFilter = require("./LocalFilter")
let DBSelector = require("$database/dataFileManager/dbSelector");
import {isMobileOrTabletMedia} from "$cplatform/dimensions";
const {
    Checkbox,
    DataTable,
    TableHeader,
    TableBody,
    TableRow,
    Card,
    TableColumn
  } = require("$ui");
  let DatagridTableRow= require("./renderTable/TableRow")
  let Button= require("$ecomponents/Button")
  let Icon = require("$ecomponents/Icon")
  let {DocumentMenu,CheckboxListItem} = require("$ecomponents/Menu")
/**** tous les évenèments du datagrid sont définies dans la props events qui represente un objet 
     contenant les différents évènements
     qu'ils s'agisse des évènements de ligne, de colonne, ....etc
 */
let DGrid = require("$ccomponents/Datagrid")
class DGridTableRendering extends DGrid {
    constructor(props) {
        super(props);
        APP.extend(this._events,{
            RESIZE_PAGE:this.refreshAfterMount.bind(this),
            scroll : this.positioneScrollbar.bind(this),
        })
        APP.on("RESIZE_PAGE",this._events.RESIZE_PAGE)
        this._pagination = this.initPagination(this.props.pagination);
        window.addEventListener("resize",this._events.scroll)
    }
    onDrawerVisibleChanged(){
        setTimeout(()=>{
            this.positioneScrollbar();
        },400);
    }
    isDatagrid(){
        return true;
    }
    onScrollDom(e){
        let pDom = document.getElementById(this.datagridDomId+"-scrollable-content-wrapper")
        let dom = document.getElementById(this.datagridDomId)
        if(isDOMElement(pDom) && isDOMElement(dom)){
            let parent = dom.closest(".datagrid.datagrid-tbl");
            if(isDOMElement(parent)){
                parent.scrollLeft = pDom.scrollLeft;
            } 
        }
    }
    componentDidMount(){
        super.componentDidMount();
    }
    positioneScrollbar(){
        let dom = document.getElementById(this.datagridDomId)
        let sDom = document.getElementById(this.datagridDomId+"-scrollable-content")
        let pDom = document.getElementById(this.datagridDomId+"-scrollable-content-wrapper")
        if(isDOMElement(dom) && isDOMElement(sDom) && isDOMElement(pDom)){
            pDom.style.height = sDom.style.height = "0px";
            sDom.style.width = "0px";
            let parent = dom.closest(".datagrid.datagrid-tbl");
            if(isDOMElement(parent)){
                let pW = parent.clientWidth;
                let sW = parent.scrollWidth;
                if(parent.hasScrollbar('horizontal') && isDecimal(sW) && isDecimal(pW)){
                    sDom.style.width= sW+"px";
                    pDom.style.width = pW+"px";
                    pDom.style.height = sDom.style.height = "9px";
                }
            }      
        }
    }
    componentDidUpdate(){
        super.componentDidUpdate();
        this.__canR = false;
        APP.resizePage();
        if(this.exportDataInstance && typeof this.exportDataInstance.createExportInstance == 'function'){
            this.exportDataInstance.createExportInstance(true);
        }
        this.__canR = true;
        this.positioneScrollbar();
    }      
    refreshAfterMount(){
        if(this._isMounted() && this.__canR) this.refresh(false);
        this.positioneScrollbar();
    }
    canExportAskDisplayMainContent(){
        return true;
    }
    componentWillUnmount(){
        super.componentWillUnmount();
        APP.off("RESIZE_PAGE",this._events.RESIZE_PAGE);
        window.removeEventListener("resize",this._events.scroll);
        this.clearEvents();
    }
    canPaginateData(){
        return true;
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
        let {columnDef} = arg;
        let {render,extra,key,className} = super.renderRowCell(arg);
        if(render===null) return null;
        return <TableColumn key={key} className = {classNames(extra.className,columnDef.visible?"":'hidden',"datagrid-cell datagrid-row-cell selectable-content")}>
                <div className={classNames("datagrid-rendered-cell",className)}>{render}</div>
            </TableColumn>
        
    }

    /*** chaque colonnne de la datagrid est un objet de type : 
        {
            field : le nom du champ,
            text || title : le texte à afficher sur la colonne
            ...props : la liste des props à passer au composant TableColumn de react-md
        }
        //la variable header du datagrid prend tous les props à passer au composant TableHeader de react-md
     */
    render (){
        let {
            printOptions,
            rowKey,
            printButton,
            printText,
            printIcon,
            printable,
            print,
            archive,
            archivable,
            progressbar,
            header,
            getRowKey,
            body,
            accordionProps,
            footer,
            row,
            cell,
            table,
            filters,
            filter,
            data,
            tableName,
            dbName,
            selectable,
            selectableMultiple, //si plusieurs lignes peuvent être sélectionnées
            columns,
            fetchData,
            fetchDataOpts, //les options supplémentaires à passer à la fonction fetchData, ces options doivent correspondre à ceux supportées par les requêtes mongo query du plugin pouchdb-find
            /*** Les actions de boutons de la barre d'outil */
            actions,
            selectedRowsActions,
            showPagination,
            pagin,
            showPaginationOnTop,
            sortable,
            exportable,
            filterOrOperator,
            filterAndOperator,
            onRowSelected, //lorsqu'une ligne est sélectionnée
            onRowsSelected, // lorsque toutes les lignes sont sélectionnées
            onRowDeselected, //lorsqu'une ligne est désélectionnée
            onRowsDeselected, //lorsque toutes les lignes sont désélectionnées
            progressBar,
            onRowDoubleClick,
            onRowClick,
            toggleFilters,
            sessionName,
            onMount,
            onUnmount,
            onFetchData,
            dbSelector,
            dbSelectorProps,
            queryLimit,
            accordion, //pour le rendu du header en accordion
            ...datagridProps
        } = defaultObj(this.getComponentProps({...this.props}))
        let showDBSelector = false;
        if(dbSelector === true){
            showDBSelector = true;
        } 
        dbSelectorProps = defaultObj(dbSelectorProps);
        exportable = defaultBool(exportable,true);
        sortable = defaultVal(sortable,true);
        let isMobile = isMobileOrTabletMedia();
        const rowsPerPageLabel = ''
        datagridProps = defaultObj(datagridProps);
        let exportTableProps = this.getExportableProps();
        delete datagridProps.exportTableProps;
        delete datagridProps.showFilters;
        delete datagridProps.showFooter;
        header = defaultObj(header);
        body = defaultObj(body); 
        row = defaultObj(row);
        let _headerProps = {...header, className :classNames(header.className,"datagrid-header")};
        let _bodyProps = {...body,className : classNames(body.className,"datagrid-body")};
        _bodyProps.id = isNonNullString(_bodyProps.id)? _bodyProps.id : uniqid("body-id");
        this._bodyDomId = _bodyProps.id;
        datagridProps.className = classNames("datagrid datagrid-render-table datagrid-tbl",datagridProps.className);
        selectable = defaultVal(selectable,true);
        selectableMultiple = defaultBool(selectableMultiple,true);
        datagridProps.selectableRows = false;
        datagridProps.fixedHeader = false//defaultBool(datagridProps.fixedHeader,false);
        datagridProps.fixedFooter = defaultBool(datagridProps.fixedFooter,true);
        
        pagin = defaultVal(pagin,true)
        showPagination = defaultVal(showPagination,true);
        showPaginationOnTop = defaultVal(showPaginationOnTop,true);
        
        let colSpan = (Object.size(this.state.columns)+((selectable?1:0)))
        this.visibleColsMenu = [];//la liste des colonnes visible pour le menu
        let pPos = showPaginationOnTop?'top':'bottom';
        let pagination = this._pagination;
        pagination.rowsPerPageItems = defaultArray(pagination.rowsPerPageItems,this.getDefaultPaginationRowsPerPageItems())
        pagination.className = classNames(pagination.className,"pagination"," pagination-pos-"+pPos,pPos)
        let countPages = this.countPages.call(this);
        let paginationLabel = defaultFunc(pagination.label,({start, last, total}) => `${start}-${last} / ${total}`);
        let pagLast = Math.min(pagination.rows, pagination.start + pagination.limit);

        paginationLabel = paginationLabel({
            start:pagination.start + 1, 
            last:pagLast, 
            total:pagination.rows,pages:countPages
        })
        let headerFilters = [];
        filters = defaultVal(filters,true);
        if(toggleFilters === false){
            filters = false;
        }
        let {showFilters,showFooter} = this.state;
        let isAllRowsSelected = this.isAllRowsSelected();
        let _progressBar = this.state.progressBar;
        datagridProps.id = defaultStr(datagridProps.id, this.datagridDomId,uniqid("datagrid-id"));
        this.datagridDomId = datagridProps.id;
        let rowCounterIndex = 0;
        let datagridBody = undefined;
        if(isArray(this.state.data) && this.state.data.length){
            datagridBody = []
            pagination.limit = defaultDecimal(pagination.limit);
            let pLength = this.state.data.length;
            for(let rowIndex = 0; rowIndex < pLength; rowIndex ++){
                let row = this.state.data[rowIndex];
                if(!isObj(row)) continue;
                rowCounterIndex++;
                datagridBody.push(<DatagridTableRow 
                    key={this.getRowKey(row,rowIndex)} 
                    row = {row}
                    cell = {cell}
                    rowCounterIndex = {rowCounterIndex}
                    context = {this}
                    selectable = {this.props.selectable}
                    rowIndex = {rowIndex}
                    filterArgs = {this.getActionsArgs()}
                />)
            }
        }
        let datagridHeaderContent = [null]
        Object.mapToArray(this.state.columns,(header,headerIndex) => {
                let {
                    field,
                    render,
                    readOnly,
                    disabled,
                    visible,
                    defaultValue,
                    className,
                    id,
                    colIndex,
                    key,
                    ...restCol
                } = header;
                restCol = defaultObj(restCol);
                let colFilter = defaultVal(restCol.filter,true);
                delete restCol.filter;
                let colProps = {id,key}
                colProps.key = isNonNullString(key)?key : (header.field||("datagrid-column-header-"+headerIndex))
                colProps.className = classNames(visible?'':'hidden',className,"datagrid-cell datagrid-column datagrid-column-cell");
                this.visibleColsMenu.push(
                    <CheckboxListItem
                        name = {uniqid("checkbox-name-l")}
                        id = {uniqid("checked-l-boxed")}
                        key={header.field}
                        onClick = {()=>{this.toggleColumnVisibility(header.field)}}
                        primaryText = {header.text||header.title||header.field}
                        checked = {visible}
                        uncheckedIcon = {null}
                    />
                );
                let headerFilter = null;
                restCol.field = header.field;
                restCol.label = defaultStr(header.text,header.label) ;
                restCol.orOperator = defaultBool(restCol.orOperator,filterOrOperator,true);
                restCol.andOperator = defaultBool(restCol.andOperator,filterAndOperator,true)
                delete restCol.sortable;
                let hasFilterClassName = "has-not-filter";
                if(colFilter && filters !== false){
                    hasFilterClassName = "has-filter";
                    this.filters[header.field] = {...defaultObj(this.filters[header.field])}
                    headerFilter = <Filter
                        {...restCol}
                        searchIconTooltip = 'Filtre'
                        searchIcon = 'filter_list'
                        name = {header.field}
                        defaultValue = {defaultVal(this.filters[header.field].originalValue,this.filters[header.field].originValue)}
                        key = {header.field}
                        onClearFilter = {this.onClearFilter.bind(this)}
                        onChange = {this.onFilterChange.bind(this)}
                        operator = {this.filters[header.field].operator}
                        action = {defaultStr(this.filters[header.field].originAction,this.filters[header.field].action)}
                    />
                    
                } 
                
                headerFilters.push(
                    <TableColumn
                        key = {header.field}
                        className={classNames("tableexport-ignore",hasFilterClassName,'datagrid-column',visible?'':'hidden',"datagrid-filter datagrid-filter-column filter-column-"+header.field,'column-'+header.field)}
                    >
                        {headerFilter}
                    </TableColumn>
                )
                colProps.sorted = undefined; 
                colProps.sortIcon = <Icon name={"arrow_upward"} className="tableexport-ignore"></Icon>
                let canSort = sortable && header.sortable !== false
                if(canSort){
                    colProps.role = "button";
                    if(this.state.sort.column ==field){
                        colProps.sorted = this.state.sort.dir == 'asc'? true : false;
                    }                                    
                    colProps.onClick = (event) =>{React.stopEventPropagation(event);this.sort(header.field,null,header);}
                }
                datagridHeaderContent.push(
                    <TableColumn 
                        {  ...colProps} 
                        className = {classNames(colProps.className,canSort?"datagrid-column-header-sortable cursor-pointer":"datagrid-column-header-not-sortable cursor-not-allowed")}
                    >
                        <span className={("no-padding no-margin")} onMouseOver={()=>{}} onMouseLeave={()=>{}}>
                            {header.text||header.title||header.field}
                        </span>
                    </TableColumn>
                )
        })
    
        let datagridHeader = <React.Fragment>
            <TableRow  className="datagrid-table-header-row">
                {datagridHeaderContent}
            </TableRow>
            {
                showFilters && filters !== false && (
                    <TableRow className="filters-row datagrid-filters-row tableexport-ignore">
                        {selectable?
                            <TableColumn className="header-filter-wrap select-rows tableexport-ignore"/>
                        :null}
                        {headerFilters}
                    </TableRow>
                )
            }
        </React.Fragment>
        let selectAllRowsToggleTitle = isAllRowsSelected?"Tout Déselec":"Tout Select"
        let restItems = [];
        let max = this.getMaxSelectableRows();
        if(selectableMultiple && max && defaultBool(this.props.selectableMultiple,true)){
            max = max.formatNumber();
            restItems = [
                {
                    primaryText : "Sélect "+max,
                    leftIcon : <Icon name="select-all"></Icon>,
                    onClick : (x,event)=>{
                        this.__isAllRowsSelected = false;
                        this.handleAllRowsToggle();
                    }
                },
                {
                    primaryText : "Tout désélec",
                    onClick : (x,event)=>{
                        this.__isAllRowsSelected = true;
                        this.handleAllRowsToggle();
                    },
                    leftIcon : <Icon name="select"></Icon>
                }
            ]
        }   
        if(selectable){
            datagridHeaderContent[0] = <TableColumn  key="toggle-rows-selection" className="tableexport-ignore toggle-rows-selection datagrid-column">
                <Tooltip Component = {Checkbox}
                    aria-label = {selectAllRowsToggleTitle}
                    name = {uniqid("checkbox-name")}
                    id = {uniqid("checked-boxed")}
                    title = {selectAllRowsToggleTitle}
                    checkedIcon = {<Icon name="check_box"></Icon>}
                    checked = {isAllRowsSelected}
                    uncheckedIcon = {<Icon name="check_box_outline_blank"></Icon>}
                    onChange = {(x,event)=>{
                        this.handleAllRowsToggle();
                    }}
                />
            </TableColumn>
        }
        let Pagination = null;
        this.searchPassIconId = this._datagridId+"-options-icon"
        if(showPagination) Pagination = <div className="pagination-table-wrapper"><table className={classNames("pagination-wrapper no-padding no-marging datagrid-toolbar",pPos)}>
                <tbody className="toolbar pagination-toolbar">
                    <tr>
                        {!isMobile && (
                            <React.Fragment>
                                <td className="refresh-td">
                                    <Button 
                                        raised
                                        iconEl = {<Icon name="refresh"/>} 
                                        onClick = {this.refresh.bind(this)}
                                    >
                                        Rafraichir
                                    </Button>
                                </td>
                                {filters !== false && (<td className="">
                                    <Button
                                        raised
                                        className={"toggle-filters-visibility"}
                                        onClick =  {()=>{showFilters?this.hideFilters():this.showFilters()} }   
                                        iconEl = {
                                            <Icon name ={showFilters?'visibility_off':'visibility'}></Icon>}
                                    >   
                                            {showFilters?'Masquer/Filtres':'Afficher/Filtres'}
                                    </Button>
                                </td>)}
                                <td className="">
                                    <Button
                                        raised
                                        className={"toggle-footer-visibility"}
                                        onClick =  {()=>{showFooter?this.hideFooter():this.showFooter()} }   
                                        iconEl = {
                                            <Icon name ={showFooter?'view_column':'view_module'}></Icon>}
                                    >   
                                            {showFooter?'Masquer/Pied de page':'Afficher/Pied de page'}
                                    </Button>
                                </td>
                                {selectableMultiple && (
                                    <td>
                                        {restItems.map((item,index)=>{
                                            return <Button 
                                                raised 
                                                key = {index}
                                                iconEl = {item.leftIcon}
                                                onClick = {item.onClick}                                    
                                            >
                                                {item.primaryText}
                                            </Button>
                                        })}
                                    </td>
                                )}
                            </React.Fragment>
                        )}
                        {exportable && (
                                <td  className={classNames('datagrid-export-buttons')}>
                                    <ExportTable 
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
                                </td>
                            )
                        }
                        <td className={"toggle-column-visibility"}>
                            <DocumentMenu id={uniqid("doc-menu-datagrid")} text={<Icon title={isMobile?"Actions":"Colonnes"} name={isMobile?"menu":'view_column'}></Icon>} menuItems={
                                isMobile ? [
                                    isMobile?
                                    {
                                        primaryText : 'Rafraichir',
                                        leftIcon : <Icon name="refresh"></Icon>,
                                        onClick : this.refresh.bind(this)
                                    } : null,
                                    {
                                        primaryText : 'colonnes',
                                        leftIcon : <Icon name="view_column"></Icon>,
                                        nestedItems : this.visibleColsMenu
                                    },
                                    isMobile && filters !== false?{
                                        className:"toggle-filters-visibility",
                                        onClick :  ()=>{showFilters?this.hideFilters():this.showFilters()}    
                                        ,leftIcon :  <Icon name={showFilters?'visibility_off':'visibility'}></Icon>
                                        ,primaryText : (showFilters?'Masquer/Filtres':'Afficher/Filtres')
                                    } : null,
                                    isMobile?{
                                        className:"toggle-footer-visibility",
                                        onClick :  ()=>{showFooter?this.hideFooter():this.showFooter()}    
                                        ,leftIcon :  <Icon name={showFooter?'view_column':'view_module'}></Icon>
                                        ,primaryText : (showFooter?'Masquer/Pied de page':'Afficher/Pied de page')
                                    } : null,
                                    ...(isMobile && selectableMultiple ? restItems : [])
                                ] : this.visibleColsMenu
                            } />
                        </td>
                        {pagin && (
                            <React.Fragment>
                                <td className={classNames('pagination-item-td')}>
                                    <span className="pagination-label">
                                        {rowsPerPageLabel}
                                    </span>
                                </td>
                                <td className="pagination-item-td">
                                    <select
                                        id={uniqid("pagination-select-field")}
                                        className={'pagination-select-field md-select-field--pagination pagination-select-field'}
                                        onChange={this._setRowsPerPage.bind(this)}
                                        defaultValue = {pagination.limit}
                                    >
                                        {
                                            Object.map(pagination.rowsPerPageItems,(val,i)=>{
                                                return <option defaultValue={val == pagination.limit ? 'selected' : undefined} key={i}>{val}</option>
                                            })
                                        }
                                    </select>
                                </td>
                                    <td className="pagination-item-td">
                                    <Button
                                        flat
                                        id={uniqid("go-to-first-page-id")}
                                        onClick={this._goToFirstPage.bind(this)}
                                        disabled={countPages <=0 || pagination.page == 1}
                                        iconEl={<Icon name="first_page"></Icon>}
                                    />
                                    </td>
                                    <td className="pagination-item-td">
                                    <Button
                                        id={uniqid("decrement-id")}
                                        onClick={this._decrement.bind(this)}
                                        disabled={pagination.start === 0}
                                        iconEl={<Icon name="keyboard_arrow_left"></Icon>}
                                    />
                                    </td>
                                    <td className="pagination-item-td">
                                        {this.renderQueryLimit(<span className="pagination-label">{paginationLabel}</span>)}
                                    </td>
                                    <td className="pagination-td">
                                    <Button
                                        flat
                                        id={uniqid('increment-id')}
                                        onClick={this._increment.bind(this)}
                                        disabled={(pagination.start + pagination.limit) >= pagination.rows}
                                        iconEl={<Icon name="keyboard_arrow_right"></Icon>}
                                    />
                                </td>
                                <td className="pagination-item-td">
                                    <Button
                                        flat
                                        id={uniqid("go-to-last-page-id")}
                                        onClick={this._goToLastPage.bind(this)}
                                        disabled={countPages <=1 || pagination.page == countPages}
                                        iconEl={<Icon name="last_page"></Icon>}
                                    />
                                </td>
                            </React.Fragment>
                        )}
                        {filters !== false && <td  className="datagrid-local-filter-wrapper" ><LocalFilter title = {this.props.title} fields ={this.state.columns} onChange={this.onLocalFiltersChange.bind(this)}/></td>}
                        <td className="datagrid-render-type"><RenderType key={uniqid("render-type")}/></td>
                    </tr>
                </tbody>
            </table>
        </div>
        datagridProps.baseId = defaultStr(datagridProps.baseId,uniqid("datagrid-pros-base-id"))
        let title = this.props.title;
        let clx = title ? "has-title ml1":"has-not-title"
        let _dbSelector = showDBSelector ? <div className={"datagrid-db-selector-wrapper "+clx}>
            <DBSelector 
                {...dbSelectorProps}
                onChange = {this.onChangeDatabases.bind(this)}
            />
        </div> : null;
        if(!title){
            title = _dbSelector;
            _dbSelector = null;
        }
        let footers = this.getFooterValues();
        return <Card tableCard className={classNames("datagrid-wrapper datagrid-table-wrapper",this.state.startLoadingData && !this.state.stopLoadingData?'loading user-select-none':'',isAllRowsSelected ? "all-rows-selected":'all-rows-not-selelected')}>
                    <DatagridActions 
                        title = {title}
                        context = {this}
                        selectedRows = {this.selectedRows}
                        contextualTitleId = {this._datagridId+"contextual-id"}
                        childrenActions = {actions}
                    />
                    {_dbSelector}
                    {showPaginationOnTop ?Pagination:null}
                    {_progressBar}
                    {
                        !_progressBar && (
                                <React.Fragment>
                                     <div id={this.datagridDomId+"-scrollable-content-wrapper"} className={classNames("scrollable-top-content-wrapper",showPagination?'pagination-visible':'pagination-hidden')} onScroll={this.onScrollDom.bind(this)}>
                                        <div id={this.datagridDomId+"-scrollable-content"} className="scrollable-top-content"></div>
                                    </div>
                                    <DataTable  {...datagridProps}>
                                        <TableHeader {..._headerProps}>
                                            {datagridHeader}
                                        </TableHeader>
                                        <TableBody {..._bodyProps}>
                                            {datagridBody}
                                        </TableBody>
                                        <tfoot className="md-table-footer">
                                            {!showPaginationOnTop? <tr className="pagination-on-bottom-tr w100">
                                                <td className={classNames("pagination-on-bottom-td")} colSpan={colSpan}>
                                                    {Pagination}
                                                </td>
                                            </tr>:null}
                                            {showFooter &&  (
                                                <tr className="datagrid-footer-wrapper">
                                                    <td className="footer-toggle-row-selection tableexport-ignore"></td>
                                                    {
                                                        Object.mapToArray(this.state.columns,(column,field,_index)=>{
                                                            if(!isObj(column) || !column.visible) return null;
                                                            if(!isObj(footers[field])) return <td key={field}></td>
                                                            let footer = footers[field];
                                                            return <td key={field} className={classNames("datagrid-footer-col md-table-column",footer.visible === false ? 'hidden':'')}>
                                                                <Footer
                                                                    {...footer}
                                                                    displayLabel = {false}
                                                                    className = "footer-toggle-row-selection tableexport-ignore"
                                                                />
                                                            </td>
                                                        })
                                                    }
                                                </tr>
                                            )}
                                        </tfoot>
                                    </DataTable>
                                </React.Fragment>
                        )
                    }
             </Card>
    }
    
}

///cette fonction permet de retourner le nom de la base de données à utiliser pour la récupération des données
DGridTableRendering.getDBName = DGrid.getDBName;

DGridTableRendering.propTypes = {
    ...DGrid.propTypes,
}

export default DGridTableRendering;