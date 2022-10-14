import DatagridAccordionRow from "./Row";
const INFINITE_SCROLL_PAGE_SIZE = 10;
import DatagridActions from "../Actions";
import View from "$ecomponents/View";
//let ExportTable = require("$export-table")
import {StyleSheet,ScrollView,Dimensions} from "react-native";
import Divider from "$ecomponents/Divider";
import Paragraph from "$ecomponents/Paragraph";
import Label,{EllipsizeMode} from "$ecomponents/Label";
import Menu from "$ecomponents/BottomSheet/Menu";
import BottomSheet from "$ecomponents/BottomSheet/Provider";
import {isMobileMedia} from "$cplatform/dimensions";
import {isNativeMobile} from "$cplatform";
import Icon,{MENU_ICON} from "$ecomponents/Icon";
import SimpleSelect from "$ecomponents/SimpleSelect";
import Dropdown from "$ecomponents/Dropdown";
import React from "$react";
import Footer from "../Footer/Footer";
import CommonDatagrid from "../Common";
import CommonTableDatagrid from "../Common/TableData";
import BackToTop from "$ecomponents/BackToTop";
import FiltersAccordionComponent from "./Filters";
import RenderType from "../RenderType";
import { flatMode,HEIGHT} from "$ecomponents/TextField";
import List,{FlatList,FlashList} from "$ecomponents/List";
import theme,{Colors} from "$theme";
import {getRowStyle,styles as rStyles} from "../utils";
import Avatar from "$ecomponents/Avatar";
import {defaultObj,isOb,isNonNullString} from "$utils";
import PropTypes from "prop-types";
import ActivityIndicator from "$ecomponents/ActivityIndicator";

const DatagridFactory = (Factory)=>{
    Factory = Factory || CommonDatagrid;
    const clx = class DGridAccordionRenderingCls extends Factory {
        constructor(props) {
            super(props);
            this.autobind();
            this.frozenItems = 0;
            this.listRef = React.createRef(null);
            this.state.refreshing = false;
            this.state.isReady = !this.bindResizeEvents();
            this.updateLayout = this.updateLayout.bind(this);
            this.backToTopRef = React.createRef(null);
        }
        isDatagrid(){
            return true;
        }
        canHandleIndexColumn(){
            return false;
        }
        canPaginateData(){
            return false;
        }
        isAccordion(){
            return true;
        }
        renderRowCell (arg){
            const {columnDef,columnField} = arg;
            if(!columnDef.visible || columnDef.accordion === false || this.isSelectableColumn(columnDef,columnField)) return null;
            let {render,key,style} = super.renderRowCell(arg);
            if(render===null || !React.isValidElement(render)) return null;
            return <Label style={style} key={key}>
                    {render}
                </Label>
            
        }
        rangeChanged(state){
            if(this.startEndIndexCounterElt && this.startEndIndexCounterElt.update){
                this.startEndIndexCounterElt.update(state);
            }
        }
        
        isScrolling(){
            if(this.listRef.current && typeof this.listRef.current.isScrolling =='boolean'){
                return this.listRef.current.isScrolling;
            }
        }
        onAllRowsToggle(selected){
            if(!selected){
                this.scrollToIndex(this.getMaxSelectedRows());
                //this.scrollToIndex(0);
            } else {
                this.scrollToIndex(selected?Math.max(this.getMaxSelectedRows()-1,0):0)
            }
        }
        getItemCallArgs({item,index}){
            const rowIndexCount = index+1;
            return {...this.getActionsArgs(),row:item,items:this.state.data,item,rowData:item,index,rowIndex:index,rowCounterIndex:rowIndexCount,rowIndexCount};
        }
        getRenderingItemProps ({item,rowKey,numColumns,index}){
            const rKey = rowKey;
            this.renderingItemsProps = isObj(this.renderingItemsProps)? this.renderingItemsProps : {};
            const wrapperStyle = getRowStyle({row:item,index,numColumns,isAccordion:true,rowIndex:index});
            if(isObj(this.renderingItemsProps) && isObj(this.renderingItemsProps[rKey]) && this.renderingItemsProps[rKey].title){
                const it = this.renderingItemsProps[rKey];
                it.numColumns = numColumns;
                it.wrapperStyle = wrapperStyle;
                return it;
            }
            const callArgs = this.getItemCallArgs({item,index});
            const accordion = this.props.accordion;
            const accordionProps = defaultObj(this.props.accordionProps);
            const testID = "RN_DatagridAccordionRow_"+rKey;
            let renderedContent = isFunction(accordion) ? accordion(callArgs) : isFunction(accordionProps.accordion) ? accordionProps.accordion(callArgs) : isObj(accordion) && accordion ? accordion : isObj(accordionProps.accordion) ? accordionProps.accordion : undefined;;
            let title = null, avatarContent = null,right = null,rightProps={},description = null,rowProps = {},avatarProps = {};
            let descriptionProps = Object.assign({},this.accordionDescriptionProps)
            let color = undefined;
            let titleProps = Object.assign({},this.accordionTitleProps);  
            if(React.isValidElement(renderedContent) || isNonNullString(renderedContent)){
                title = renderedContent;
            } else if(isObj(renderedContent)){
                title = renderedContent.title
                if(isObj(renderedContent.titleProps)){
                    titleProps = {...titleProps,...renderedContent.titleProps,style:[titleProps.style,renderedContent.titleProps.style]};
                }
                right = renderedContent.right
                rightProps = Object.assign({},renderedContent.rightProps);
                description = defaultVal(renderedContent.description,renderedContent.content);
                avatarContent = renderedContent.avatar;
                avatarProps = Object.assign({},renderedContent.avatarProps);
                color = Colors.isValid(renderedContent.avatarColor)?renderedContent.avatarColor:Colors.isValid(renderedContent.color)? renderedContent.color:undefined;
                if(isObj(renderedContent.descriptionProps)){
                    descriptionProps = {...descriptionProps,...renderedContent.descriptionProps,style:[descriptionProps.style,renderedContent.descriptionProps.style]}
                } else if(isObj(renderedContent.contentProps)){
                    descriptionProps = {...descriptionProps,...renderedContent.contentProps,style:[descriptionProps.style,renderedContent.contentProps.style]}
                }
                rowProps = defaultObj(renderedContent.rowProps);
                avatarProps.color = color;
                if(isNonNullString(avatarContent)){
                    let src = undefined;
                    let avatarSuffix = index;
                    if(isValidUrl(avatarContent) || isDataURL(avatarContent)){
                        avatarSuffix = undefined;
                        src = avatarContent;
                        avatarContent = undefined;
                    }
                    avatarContent = <Avatar 
                        src = {src}
                        testID={testID+"_Avatar"}
                        color = {color}
                        image = {src?true :false}
                        suffix = {avatarSuffix}
                    >{avatarContent}</Avatar>
                } 
            }
            if(typeof description === 'function'){
                description = description(descriptionProps);
            }
            if(typeof description ==='string' || typeof description =='number'){
                description = <Paragraph ellipsizeMode="tail" numberOfLines={2} {...descriptionProps} >{description+""}</Paragraph>
            } else if(!React.isValidElement(description)){
                description =  null;
            }
            if(typeof title === 'function'){
                title = title(titleProps);
            }
            if(typeof title =='string' || typeof title =='number'){
                title = <Paragraph testID={testID+"_Title"} ellipsizeMode="tail" numberOfLines={1} {...titleProps}>{title+""}</Paragraph>
            } else if(!React.isValidElement(title)){
                title = null;
            }
            this.renderingItemsProps[rKey] = {
                testID,
                numColumns,
                wrapperStyle,title,right,rightProps,description,avatarContent,rowProps,avatarProps,
                bottomSheetTitlePrefix : defaultStr(renderedContent?.bottomSheetTitlePrefix,accordionProps.bottomSheetTitlePrefix,accordion?.bottomSheetTitlePrefix)
            }
            return this.renderingItemsProps[rKey];
        }
        renderItem(args){
            const {index,numColumns,item,isScrolling:_isScrolling,style,setSize} = args;
            if(!(item) || typeof item !== 'object') return null;
            const rowKey = this.getRowKey(item,index);
            return <DatagridAccordionRow 
                item = {item}
                index = {index}
                context = {this}
                rowKey = {rowKey}
                isScrolling = {defaultBool(this.isScrolling(),_isScrolling)}
                selectable = {this.props.selectable}
                isRowSelected = {this.isRowSelected.bind(this)}
                {...defaultObj(this.props.accordionProps)}
                {...this.getRenderingItemProps({item,numColumns,index,rowKey})}
                key = {rowKey}
                ref = {(el)=>{
                    if(isObj(this.renderingItemsProps) && isObj(this.renderingItemsProps[rowKey]) ){
                        this.renderingItemsProps[rowKey].ref = el;
                    }
                }}
                style = {style}
                callArgs = {this.getItemCallArgs({item,index})}
                onRowPress = {this.props.onRowPress}
                onRowLongPress = {this.props.onRowLongPress}
                onToggleExpand = {this.onToggleExpandItem.bind(this)}
            />
        }
        hasScrollViewParent(){
            return this.props.hasScrollViewParent ? true : false;
        }
        updateLayout(a){
            if(!this.bindResizeEvents()) return;
            return super.updateLayout(a);
        }
        bindResizeEvents(){
            return true;
        }
        onResizePage(){
            this.updateLayout();
        }
        getPageSize (){
            return INFINITE_SCROLL_PAGE_SIZE;
        }
        scrollToEnd(){
            if(!this._isMounted()) return;
            if(this.listRef.current && this.listRef.current.scrollToEnd){
                this.listRef.current.scrollToEnd();
            }
        }
        scrollToTop(opts){
            if(!this._isMounted()) return;
            if(this.listRef.current && this.listRef.current.scrollToTop){
                this.listRef.current.scrollToTop(defaultObj(opts));
            }
        }
        scrollToIndex(index){
            if(!this._isMounted()) return;
            index = typeof index =='number'? index : 0;
            if(this.listRef.current && this.listRef.current.scrollToIndex){
                this.listRef.current.scrollToIndex({index});
            }
        }
        getVirtualListContext(){
            if(isObj(this.listRef) && isObj(this.listRef.current)){
                return this.listRef.current;
            }
            return null;
        }
        getItem(index){
            if(typeof index !=='number') return null;
            return isObj(this.state.data[index])? this.state.data[index] : null;
        }
        getMaxSelectedRows(){
            return isMobileMedia()? 30 : 50;
        }
        renderFilter(props,headerFilters){
            return headerFilters.push(props);
        }
        showFilters(){
            if(!this._isMounted()) {
                 this.isUpdating = false;
                 return;
            }
            this.setSessionData({showFilter:true});
        }
        hideFilters (){
            if(!this._isMounted()) {
               return;
            }
            this.setSessionData({showFilter:false});
        } 
        toggleFilterColumnVisibility(field,visible){
            if(!isNonNullString(field)) return;
            let filteredColumns = {...this.state.filteredColumns};
            filteredColumns[field] = visible;
            this.setSessionData("filteredColumns"+this.getSessionNameKey(),filteredColumns);
        }
        /*** affiche les infos de l'item */
        onToggleExpandItem({item,index,rowIndex,rowKey,...rest}){
            if(!isObj(this.bottomSheetContext) || typeof this.bottomSheetContext.open !=='function') return;
            const callArgs = this.getItemCallArgs({item,index})
            return this.bottomSheetContext.open({
                ...rest,
                children : <View style={[styles.expandedItemContent]} testID={'RN_DatagridAccordionExpanded'}>
                    {Object.mapToArray(this.state.columns,(columnDef,columnField,index)=>{
                        callArgs.columnDef = columnDef;
                        callArgs.columnField = columnField;
                        let ret = this.renderRowCell(callArgs);
                        if(isNonNullString(ret)){
                            ret = ret.trim();
                        }
                        if(ret !== null && ret !== ""){
                            let text = defaultStr(columnDef.text,columnDef.label,columnField);
                            return <React.Fragment key={rowKey+defaultStr(columnField,index)}>
                                <View  style={styles.expandedItemRowCell}>
                                    <Label style={[styles.expandedItemRowCellLabel,styles.bold]}>{text.rtrim(":")+"  :  "}</Label>
                                    <Label style={[styles.expandedItemRowCellLabel]}>{ret}</Label>
                                </View>
                                <Divider/>
                            </React.Fragment>
                        }
                        return null;
                    })}        
                </View>
            })
        }
        render (){
            let {
                filters,
                filter,
                actions,
                sortable,
                exportable,
                filterOrOperator,
                filterAndOperator,
                accordionProps,
                responsive,
                isLoading:customIsLoading,
                cacheHeight,
                toggleFilters,
                dbSelector,
                dbSelectorProps,
                progressBarProps,
                accordion,
                preloaderProps,
                backToTopRef,
                backToTopProps,
                testID,
                renderEmpty,
            } = this.props
            testID = defaultStr(testID,"RN_DatagridAccordion");
            backToTopProps = defaultObj(backToTopProps);
            accordionProps = defaultObj(accordionProps);
            this.renderingItemsProps = {};
            this.cachedItemsHeights = {};
            if(isObj(accordion)){
                accordionProps = {...accordion,...accordionProps};
            }
            backToTopRef = defaultVal(backToTopRef,accordionProps.backToTopRef,true);
            
            let descOrContentProps = isObj(accordionProps.descriptionProps)? Object.assign({},accordionProps.descriptionProps) : isObj(accordionProps.contentProps)? Object.assign({},accordionProps.contentProps) : {};
            const descriptionStyle = Object.assign({},StyleSheet.flatten(descOrContentProps.style));
            const descriptionColor = Colors.isValid(descriptionStyle.color) ? descriptionStyle.color : Colors.isValid(descOrContentProps.color)? descOrContentProps.color : Colors.setAlpha(theme.colors.text,theme.ALPHA);
            this.accordionDescriptionProps = {
                ellipsizeMode: EllipsizeMode.tail,
                numberOfLines : 2,
                ...descOrContentProps,
                color : descriptionColor,
                style : [styles.description,rStyles.lineHeight,descriptionStyle],
            }

            const titleProps = isObj(accordionProps.titleProps)? Object.assign({},accordionProps.titleProps) : {};
            const titleStyle = Object.assign({},StyleSheet.flatten(titleProps.style));
            const titleColor = Colors.isValid(titleStyle.color)? titleStyle.color : Colors.isValid(titleProps.color)? titleProps.color : Colors.setAlpha(theme.colors.text,0.87);
            this.accordionTitleProps = {
                selectable: true,
                ellipsizeMode: EllipsizeMode.tail,
                numberOfLines : 1,
                ...titleProps,
                color: titleColor,
                style : [styles.title,rStyles.lineHeight,titleProps.style]
            }
            
            let showDBSelector = false;
            if(dbSelector === true){
                showDBSelector = true;
            } 
            dbSelectorProps = defaultObj(dbSelectorProps);
            let title = this.props.title;
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
            let exportTableProps = this.getExportableProps();
    
            filter = defaultFunc(filter,x=>true);
            filters = defaultVal(filters,true);
            if(toggleFilters === false){
                filters = false;
            }
            let {showFilters,showFooter} = this.state;
            let max = this.getMaxSelectableRows();
            let restItems = [];
            
            /*if(max && this.isSelectableMultiple()){
                max = max.formatNumber();
                restItems = [
                    {
                        text : "Sélectionner "+max,
                        icon : "select-all",
                        onPress : ()=>{
                            this.handleAllRowsToggle(true);
                        }
                    },
                    {
                        text : "Tout désélectionner",
                        onPress : ()=>{
                            this.handleAllRowsToggle(false);
                        },
                        icon :"select"
                    }
                ]
            }*/
            const {y} = this.state.layout;
            const {height:winheight,width:winWidth} = Dimensions.get("window");
            const containerHeight = winheight - y;
            this.renderedListHeight = Math.max(300,containerHeight - (this.hasScrollViewParent() ? 50:0));
            const isLoading = this.isLoading();
            const _progressBar = this.getProgressBar(!this.state.isReady);
            const pointerEvents = isLoading || _progressBar ? "none":"auto"; 
            
            const {
                sortedColumns:sortColumns,
                sortedColumnsLength,
                sortedColumn,
                visibleColumns,
                visibleColumnsNames,
                filteredColumns,
                filters :headerFilters,
            } = this.preparedColumns;
            const hasFooterFields = this.hasFooterFields();
            const datagridHeader = <View testID={testID+"_HeaderContainer"} pointerEvents={pointerEvents} style={[styles.datagridHeader]}>
                <ScrollView testID={testID+"_HeaderScrollView"} horizontal contentContainerStyle={StyleSheet.flatten([styles.contentContainerStyle,styles.minW100])}>
                    <View testID={testID+"_HeaderContentCntainer"} style={[styles.table,styles.pullRight]}>
                        {dbSelector}
                        <View testID={testID+"_HeaderQueryLimit"} style={[styles.paginationItem]}>
                            {this.renderQueryLimit(this.state.data.length.formatNumber())}
                        </View>
                        {sortedColumnsLength ? <View testID={testID+"_HeaderSortedColumns"} style={[styles.sortableItems,styles.paginationItem,{paddingRight:10}]}>
                            <Icon 
                                testID={testID+"_HeaderSortIcon"}
                                {...sortedColumn}
                                name={defaultVal(sortedColumn.icon,"sort")} 
                                primary = {!!sortedColumn.field}
                                onPress = {sortedColumn.field?(event) =>{React.stopEventPropagation(event);this.sort(sortedColumn.field);}:undefined}
                            />
                            <Dropdown
                                testID={testID+"_HeaderSortableColumns"}
                                withBottomSheet
                                dialogProps = {{title:'Trier par le champ'}}
                                mode = {flatMode}
                                inputProps = {{
                                    enableCopy : false,
                                    outlined : false,
                                    autoHeight : false,
                                    contentContainerProps : {style : {backgroundColor:'transparent'}},
                                    containerProps : {
                                        style : {width : 100,marginLeft:5,paddingVertical:0}
                                    },
                                    labelProps : {
                                        style : {top:0}
                                    }
                                }}
                                label = {"Trier par"}
                                items = {sortColumns}
                                defaultValue = {sortedColumn.field}
                                onChange = {({value})=>{
                                    setTimeout(()=>{
                                        if(isNonNullString(value)){
                                            this.sort(value,"asc");
                                        }
                                    },100)
                                }}
                            />
                        </View> : null}
                        {filters !== false ? <View>
                            <FiltersAccordionComponent
                                testID={testID+"_HeaderFilters"}
                                isLoading = {isLoading}
                                filters = {headerFilters}
                                visibleColumns = {visibleColumnsNames}
                                orOperator = {filterOrOperator}
                                andOperator = {filterAndOperator}
                                filteredColumns = {filteredColumns}
                                context = {this}
                            />
                        </View> : null}
                        <View testID={testID+"_HeaderPagination"} style = {styles.paginationItem}>
                            <Menu 
                                testID={testID+"_HeaderMenus"}
                                anchor={(props)=>(<Icon {...props} icon={MENU_ICON}/>)} 
                                items = {[
                                    {
                                        text : 'Rafraichir',
                                        icon : "refresh",
                                        onPress : this.refresh.bind(this)
                                    },
                                    visibleColumns.length ? {
                                        text : 'colonnes',
                                        icon : "view-column",
                                        items : visibleColumns,
                                        closeOnPress : false,
                                    } : null,
                                    hasFooterFields ? {
                                        onPress :  ()=>{showFooter?this.hideFooter():this.showFooter()}    
                                        ,icon :  showFooter?'view-column':'view-module'
                                        ,text : (showFooter?'Masquer/Ligne des totaux':'Afficher/Ligne des totaux')
                                    }:null,
                                    ...restItems,
                                    {
                                        text : 'Retour en haut',
                                        icon : "arrow-up-bold",
                                        onPress : this.scrollToTop.bind(this)
                                    },
                                    {
                                        text : 'Aller à la dernière ligne',
                                        icon : "arrow-down-bold",
                                        onPress : this.scrollToEnd.bind(this)
                                    },
                                ]}
                            />
                        </View>
                        <View>
                            <RenderType />
                        </View>
                    
                            {/*exportable && exportTableProps.pdf && (exportTableProps.pdf.footer) ? (
                                <td  width="40px">
                                    <ExportTable 
                                        {...exportTableProps}
                                        excel = {false}
                                        ref = {(el)=>{
                                            if(el){
                                                this.exportDataInstance = el;
                                            }
                                        }}
                                        selector = {this.exportableDomId}
                                        getAllData = {()=>{
                                            return this.INITIAL_STATE.data;
                                        }}
                                    />
                                </td>
                                ) : null
                            */}
                            {/*filters !== false && <td ><LocalFilter title = {this.props.title} fields ={this.state.columns} onChange={this.onLocalFiltersChange.bind(this)}/></td>*/}
                    </View>
            </ScrollView>
        </View>  
        const hasData = this.state.data.length ? true : false;
        renderEmpty = defaultFunc(accordionProps.renderEmpty,renderEmpty,x=>null)
        return <View testID={testID+"_Container"} pointerEvents={pointerEvents} style={[styles.container]} collapsable={false}>
                { <View testID={testID+"_ContentContainer"} style={[this.bindResizeEvents()?{height:this.renderedListHeight}:undefined]}> 
                    <View testID={testID+"_AccordionHeader"} style={[styles.accordionHeader]} ref={this.layoutRef} onLayout={this.updateLayout.bind(this)}>
                        <DatagridActions 
                            testID={testID+"_Actions"}
                            pointerEvents = {pointerEvents}
                            title = {title}
                            context = {this}
                            selectedRows = {Object.assign({},this.selectedRows)}
                            selectedRowsActions = {this.renderSelectedRowsActions.bind(this)}
                            actions = {actions}
                        />
                        {datagridHeader}
                        {_progressBar}
                        {showFooter ? (
                            <View  testID={testID+"_FooterContainer"} pointerEvents={pointerEvents} style={[{justifyContent:'center'}]}>
                                <View  testID={testID+"_FooterContentContainer"} style={[styles.footersContainer]}>
                                    <ScrollView testID={testID+"_FooterScrollView"} horizontal contentContainerStyle={[styles.contentContainerStyle]}>
                                        <View testID={testID+"_FooterContent"} style={[styles.table]}>
                                            {Object.mapToArray(this.getFooterValues(),(footer,field)=>{
                                                return <Footer
                                                    key = {field}
                                                    testID={testID+"_FooterItem_"+field}
                                                    {...footer}
                                                />
                                            })}
                                        </View>
                                    </ScrollView>
                                </View>
                            </View>
                        ) : null}
                    </View>
                    {hasData ? <FlashList
                        estimatedItemSize = {150}
                        prepareItems = {false}
                        {...accordionProps}
                        testID = {testID}
                        extraData = {this.state.refresh}
                        contentInset={{ right: 10, top: 10, left: 10, bottom: 10 }}
                        itemHeight = {undefined}
                        responsive = {defaultBool(responsive,accordionProps.responsive,true)}
                        filter = {filter}
                        renderItem = {this.renderItem.bind(this)}
                        items = {this.state.data}
                        isLoading = {isLoading}
                        ref = {this.listRef}
                        backToTopRef = {backToTopRef?(e)=>{
                            return this.backToTopRef.current;
                        }:false}
                        keyExtractor = {this.getRowKey.bind(this)}
                    /> : <View style={styles.hasNotData}>
                        {renderEmpty()}
                    </View>}
                </View>}
                {backToTopRef ? <BackToTop testID={testID+"_BackToTop"} {...backToTopProps} ref={this.backToTopRef} style={[styles.backToTop,backToTopProps.style]} onPress={this.scrollToTop.bind(this)}/>:null}
                <BottomSheet
                    testID = {testID+"_BottomSheet"}
                    renderMenuContent = {false}
                    ref = {(el)=>{
                        this.bottomSheetContext = el;
                    }}
                />
            </View>
        }
        
    }
    clx.propTypes = {
        ...Factory.propTypes,
        hasScrollViewParent : PropTypes.bool,//si la liste est rendu dans un ScrollView ie a un parent de type scrollView
    }
    return clx;
}

const styles = StyleSheet.create({
    datagridHeader : {
        width : '100%',
        justifyContent :'flex-start'
    },
    filter : {
        minWidth : 250,
    },
    backToTop : {
        marginBottom : 0,
        marginLeft:isNativeMobile() ? 10 : 0,
        bottom : 15,
    },
    minW100 : {
        minWidth : '100%'
    },
    contentContainerStyle : {
        alignItems : 'flex-start',
        justifyContent : 'flex-start'
    },
    sortableItems : {
        flexDirection : 'row',
        alignItems : 'center',
        maxHeight : 60
    },
    container : {
        position : 'relative',
        flexDirection :'column',
        justifyContent : 'flex-start',
        width : '100%',
        paddingHorizontal : isNativeMobile()? 5:1,
    },
    accordionHeader : {
        paddingTop : 0,
        justifyContent : 'flex-start',
        width : '100%',
    },
    footersContainer : {
        paddingVertical : 0,
    },
    table : {
        flexDirection:'row',
        alignItems : 'center',
        flex:1,
        paddingHorizontal : 10,
        paddingVertical : 0,
    },
    pullRight : {
        flexDirection : 'row',
        justifyContent : 'flex-end',
        alignItems : 'center',
        flex : 1,
        width : '100%',
    },
    paginationItem : {
        marginHorizontal:0,
    },
    headerMenu : {
        width : 30,
    },
    headerFilters : {
        marginBottom : 5,
    },
    title : {
        margin:0,
        marginRight : 5,
        fontSize:16,
        alignSelf: 'flex-start'
    },
    description: {
        fontSize: 14,
    },
    expandedItemContent : {
        margin : 0,
        paddingBottom : 30,
    },
    expandedItemRowCell : {
        paddingVertical : 7,
        flexDirection : 'row',
        flexWrap : 'wrap',
        justifyContent : 'flex-start',
        alignItems : 'center',
        paddingLeft : 10
    },
    expandedItemRowCellLabel : {
        fontSize : 13,
    },
    bold : {
        fontWeight : 'bold',
    },
    contentContainer : {paddingBottom: 10, paddingTop: 8},
    hasNotData : {
        flexDirection : 'column',
        width : '100%',
        justifyContent : 'center',
        alignItems : 'center'
    }
})


const DatagridAccordionComponent = DatagridFactory();

export default DatagridAccordionComponent;

DatagridAccordionComponent.displayName ="DatagridAccordionComponent";

export const TableData = DatagridFactory(CommonTableDatagrid);

TableData.displayName = "DatagridTableDataAccordion";