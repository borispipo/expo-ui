import {FlashList} from "$ecomponents/List";
import View from "$ecomponents/View";
import {defaultObj,defaultStr,debounce,defaultNumber,defaultVal} from "$utils";
import PropTypes from "prop-types";
export const DEFAULT_COLUMN_WIDTH = 60;
import React from "$react";
import Label from "$ecomponents/Label";
import { StyleSheet,View as RNView,ScrollView,Dimensions} from "react-native";
import { getRowStyle } from "$ecomponents/Datagrid/utils";
import {isMobileNative} from "$cplatform";
import theme from "$theme";
import AbsoluteScrollView from "./AbsoluteScrollView";
import DragResize,{CONNECTOR_MIDDLE_RIGHT} from "$ecomponents/DragResize";

const isSCrollingRef = React.createRef();
const scrollLists = (opts,refs)=>{
    refs.map((ref)=>{
        if(ref && ref.current && ref.current.scrollTo){
            return ref.current.scrollTo({...defaultObj(opts),animated:true});
        }
    });
    isSCrollingRef.current = false;
}
const getOnScrollCb = (refs,pos,cb2)=>{
    const cb = (args)=>{
        if(isSCrollingRef.current) return;
        if(!isObj(args) || !args.nativeEvent) {
            isSCrollingRef.current = false;
        }
        isSCrollingRef.current = true;
        if(typeof pos =='function'){
            pos(args);
            isSCrollingRef.current = false;
            return;
        }
        pos = pos && (pos =='x' || pos=='y')? pos : "x";
        const a = {[pos]:args.nativeEvent.contentOffset?.[pos]};
        scrollLists(a,refs);
        if(typeof cb2 == 'function'){
            cb2(args);
        }
    };
    return isMobileNative()? cb : debounce(cb,200);
}

const TableComponent = React.forwardRef(({containerProps,renderEmpty,isRowSelected,headerScrollViewProps,footerScrollViewProps,scrollViewProps,showFooters,renderFooterCell,footerCellContainerProps,filterCellContainerProps,headerContainerProps,headerCellContainerProps,headerProps,rowProps:customRowProps,renderCell,cellContainerProps,hasFooters,renderHeaderCell,renderFilterCell,columnProps,getRowKey,columnsWidths,colsWidths,footerContainerProps,showFilters,columns,data,testID,...props},tableRef)=>{
    containerProps = defaultObj(containerProps);
    testID = defaultStr(testID,"RN_TableComponent");
    cellContainerProps = defaultObj(cellContainerProps);
    scrollViewProps = defaultObj(scrollViewProps);
    headerScrollViewProps = defaultObj(headerScrollViewProps);
    footerScrollViewProps = defaultObj(footerScrollViewProps);
    renderCell = typeof renderCell ==="function"? renderCell : undefined;
    const getRowProps = typeof rowProps ==='function'? rowProps : undefined;
    let rowProps = isObj(customRowProps)? customRowProps:{};
    const prepareState = React.useCallback(()=>{
        const cols = {},headers = {},footers = {},filters = {},visibleColumns = [];
        let hasFooters = false;
        columnProps = defaultObj(columnProps);
        let columnIndex = 0;
        const widths = defaultObj(columnsWidths,colsWidths);
        headerCellContainerProps = defaultObj(headerCellContainerProps);
        footerCellContainerProps = defaultObj(footerCellContainerProps);
        filterCellContainerProps = defaultObj(filterCellContainerProps);
        Object.map(columns,(columnDef,field)=>{
          if(!isObj(columnDef) /*|| columnDef.visible === false*/) return;
          const columnField = defaultStr(columnDef.field,field);
          let {visible,width,type,...colProps} = columnDef;
          visible = typeof visible =='boolean'? visible : true;
          type = defaultStr(type,"text").toLowerCase().trim();
          colProps = defaultObj(colProps);
          width = defaultDecimal(widths[columnField],width,DEFAULT_COLUMN_WIDTH);
          const style = StyleSheet.flatten([colProps.style,{width}]);
          const colArgs = {width,type,style,columnDef,containerProps:{},columnField,index:columnIndex,columnIndex};
          let content = typeof renderHeaderCell =='function'? renderHeaderCell(colArgs) : defaultVal(columnDef.text,columnDef.label,columnField);
          let hContainerProps = {};
          if(!React.isValidElement(content,true) && isObj(content)){
             hContainerProps = isObj(content.containerProps)? content.containerProps : {};
             content = React.isValidElement(content.children,true)? content.children : React.isValidElement(content.content,true)? content.content : undefined;
          } else if(isObj(colArgs.containerProps)){
             hContainerProps = colArgs.containerProps;
          }
          if(!React.isValidElement(content,true)){
            console.error(content," is not valid element of header ",columnDef," it could not be render on table");
            return null;
          }
        
        headers[columnField] = <View testID={testID+"_HeaderCell_"+columnField} {...headerCellContainerProps} {...hContainerProps} key={columnField} style={[styles.headerItem,styles.headerItemOrCell,headerCellContainerProps.style,hContainerProps.style,style]}>
            <Label splitText numberOfLines={2} style={[theme.styles.w100,theme.styles.h100,{maxHeight:70}]} textBold primary>{content}</Label>
        </View>;
        if(typeof renderFilterCell =='function'){
            const filterCell = renderFilterCell(colArgs);
            filters[columnField] = <View testID={testID+"_Filter_Cell_"+columnField} {...filterCellContainerProps} key={columnField} style={[styles.headerItem,styles.headerItemOrCell,styles.filterCell,filterCellContainerProps.style,style]}>
                {React.isValidElement(filterCell)? filterCell : null}
            </View>
        }
        if(typeof renderFooterCell ==='function') {
            const footerProps = {...colArgs,containerProps:{}};
            let cellFooter = renderFooterCell(footerProps);
            let fContainerProps = {};
            if(!React.isValidElement(cellFooter,true) && isObj(cellFooter)){
                fContainerProps = isObj(cellFooter.containerProps)? cellFooter.containerProps : {};
                cellFooter = React.isValidElement(cellFooter.children)? cellFooter.children : React.isValidElement(cellFooter.content)? cellFooter.content : null;
            } else if(isObj(footerProps.containerProps)){
                fContainerProps = footerProps.containerProps;
            }
            cellFooter = React.isValidElement(cellFooter,true)? cellFooter : null;
            if(!hasFooters && cellFooter){
                hasFooters = true;
            }
            footers[columnField] = <View testID={testID+"_Footer_Cell_"+columnField}  key={columnField} style={[styles.headerItem,styles.headerItemOrCell,footerCellContainerProps.style,style]}>
                <Label primary children={cellFooter}/>
            </View>
         }
          cols[columnField] = {
            width,
            index : columnIndex,
            field : columnField,
            visible,
            columnField,
            columnDef,
          };
          if(visible){
            visibleColumns.push(columnField);
          }
          columnIndex++;
        });
        return {columns:cols,visibleColumns,headers,hasFooters,footers,filters};
      },[columns,data]);
    const [state,setState] = React.useState({
        headers : {},
        footers : {},
        hasFooters : false,
        tableRows : [],
        visibleColumns : [],
    });
    const listRef = React.useRef(null),scrollViewRef = React.useRef(null),headerScrollViewRef = React.useRef(null);
    React.useEffect(()=>{
        setState({...state,...prepareState()});
    },[data,columns]);
    const emptyData = typeof renderEmpty =='function' && !Object.size(data,true)? renderEmpty() : null;
    const hasEmptyData = emptyData && React.isValidElement(emptyData);
    const {visibleColumns,columns:cols,headers,footers,filters} = state;
    headerContainerProps = defaultObj(headerContainerProps);
    footerContainerProps = defaultObj(footerContainerProps);
    let hProps = typeof headerProps =='function'? hProps({columns:col,visibleColumns}) : {};
    const h = [],f = [],fFilters = [];
    let totalWidths = 0;
    visibleColumns.map((i)=>{
        if(!isObj(cols[i])) return;
        h.push(headers[i]);
        totalWidths+=cols[i].width;
        if(showFooters && state.hasFooters){
            f.push(footers[i]);
        }
        if(showFilters && filters[i]){
            fFilters.push(filters[i]);
        }
    });
    const scrollContentContainerStyle = {flex:1,width:listWidth,minWidth:totalWidths,height:'100%'};
    const scrollEventThrottle = isMobileNative()?200:50;
    const scrollViewFlexGrow = {flexGrow:0};
    const maxScrollheight = f.length && fFilters.length ? 170  : f.length ?120 :  fFilters.length ? 140 : 80;
    const allScrollViewProps = {
        scrollEventThrottle,
        horizontal : true,
        ...scrollViewProps,
        style : [{maxHeight:maxScrollheight},scrollViewProps.style],
        contentContainerStyle : [styles.scrollView,scrollViewProps.contentContainerStyle,scrollViewFlexGrow,scrollContentContainerStyle]
    }
    const listWidth = '100%';
    const footerScrollViewRef = React.useRef(null);
    const context = {
        listRef,
        scrollToIndex : (index)=>{
            index = typeof index =='number'? index : 0;
            if(listRef.current && listRef.current.scrollToIndex){
                listRef.current.scrollToIndex({index});
            }
        },
        scrollToTop : (args)=>{
            if(listRef.current && listRef.current.scrollToTop){
                return listRef.current.scrollToTop(args);
            }
        },
        scrollToEnd : (args)=>{
            if(listRef.current && listRef.current.scrollToEnd){
                return listRef.current.scrollToEnd(args);
            }
        },
        scrollToLeft : (args)=>{
            if(scrollViewRef.current && scrollViewRef.current.scrollTo){
                return scrollViewRef.current.scrollTo(args);
            }
        },
        get listContext (){
            return listRef.current;
        },
        get scrollViewContext(){ return scrollViewRef.current},
        get headerScrollViewContext(){return headerScrollViewRef.current},
    }
    const hContent = h.length ? <View testID={testID+"_Header"}{...hProps} {...headerContainerProps} style={[styles.header,headerContainerProps.style,hProps.style,f.length]}>
        {h}
    </View> : null,
    fContent = f.length ? <View testID={testID+"_Footer"} {...footerContainerProps} style={[styles.header,styles.footers,footerContainerProps.style,theme.styles.pt0,theme.styles.pb0,theme.styles.ml0,theme.styles.mr0]}>
        {f}
    </View> : null,
    filtersContent = fFilters.length ? <View testID={testID+"_Filters"} style={[styles.header,styles.footers,theme.styles.pt0,theme.styles.pb0,theme.styles.ml0,theme.styles.mr0]}>
        {fFilters}
    </View> : null
    
    const absoluteScrollViewRefCanScroll = React.useRef(true);
    React.setRef(tableRef,context);
    const cStyle = {width:listWidth}
    const absoluteScrollViewRef = React.useRef(null);
    return <View testID= {testID+"_Container"} {...containerProps} style={[styles.container,{alignItems:'stretch'},containerProps.style,theme.styles.pl0,theme.styles.pr0]}>
            <RNView style={[cStyle]} testID={testID+"_Headers_ScrollViewContainer"}>
                <ScrollView
                    testID={testID+"_HeaderScrollView"}
                    {...headerScrollViewProps} 
                    contentContainerStyle = {[allScrollViewProps.contentContainerStyle,headerScrollViewProps.contentContainerStyle,{height:'100%',flexWrap: 'wrap'}]}
                    style = {[allScrollViewProps.style,headerScrollViewProps.style,{height:'100%',flex:1,flexWrap:'wrap'}]}
                    ref={headerScrollViewRef} horizontal {...allScrollViewProps}
                    onScroll = {getOnScrollCb([scrollViewRef,footerScrollViewRef])}
                    showsHorizontalScrollIndicator
            >
                    <View testID={testID+"Header2FootersWrapper"} style={[theme.styles.w100]}>
                        {hContent}
                        {filtersContent}
                        {fContent}
                    </View>
                </ScrollView>
            </RNView>
            {hasEmptyData ? <View testID={testID+"_Empty"} style={styles.hasNotData}>
                    {emptyData}
            </View> : <ScrollView {...scrollViewProps} scrollEventThrottle = {scrollEventThrottle} horizontal contentContainerStyle={[scrollContentContainerStyle,scrollViewProps.contentContainerStyle]} showsVerticalScrollIndicator={false}  
            onScroll = {getOnScrollCb([headerScrollViewRef,footerScrollViewRef],null,(args)=>{
                const nativeEvent = args.nativeEvent;
                if(absoluteScrollViewRef.current && absoluteScrollViewRef.current.checkVisibility){
                    absoluteScrollViewRef.current.checkVisibility(nativeEvent);
                }
            })} ref={scrollViewRef}  testID={testID+"_ScrollView"}>  
                <FlashList
                    containerProps = {{style:[cStyle]}}
                    //prepareItems = {Array.isArray(items)? false : undefined}
                    estimatedItemSize = {200}
                    {...props}
                    onContentSizeChange = {(width,height)=>{
                        if(props.onContentSizeChange){
                            props.onContentSizeChange(width,height);
                        }
                        if(!absoluteScrollViewRef.current) return;
                        absoluteScrollViewRef.current.setStyles({
                            content : {height,width}
                        });
                    }}
                    onLayout = {(args)=>{
                        if(props.onLayout){
                            props.onLayout(args);
                        }
                        if(!absoluteScrollViewRef.current) return;
                        const {nativeEvent:{layout}}=args;
                        const top = defaultNumber(layout.top,layout.y);
                        const height = layout.height;
                        absoluteScrollViewRef.current.setStyles({
                            container : {top,height},
                            contentContainer : {height},
                        });
                    }}
                    ref = {listRef}
                    numberOfLines = {1}
                    responsive = {false}
                    testID = {testID}
                    items = {data}
                    contentContainerStyle = {[styles.contentContainer,{with:listWidth,minWidth:totalWidths,position:'absolute',right:'0'}]}
                    style = {[styles.datagrid,{width:listWidth,minWidth:totalWidths}]}
                    keyExtractor = {typeof getRowKey =='function'? getRowKey : React.getKey}
                    //stickyHeaderIndices={[0]}
                    onScroll = {getOnScrollCb([absoluteScrollViewRef],(args)=>{
                        if(!absoluteScrollViewRef.current) return;
                        const offset = args?.nativeEvent?.contentOffset.y;
                        const scrollViewRef = absoluteScrollViewRef.current?.scrollViewRef;
                        if(typeof offset =='number' && scrollViewRef.current && scrollViewRef.current.scrollTo){
                            absoluteScrollViewRefCanScroll.current = false;
                            scrollViewRef.current.scrollTo({animated:false,y:offset});
                            setTimeout(()=>{
                                absoluteScrollViewRefCanScroll.current = true;
                            },500);
                        }
                    })}
                    renderItem = {(arg)=>{
                        const item = arg.item, data = arg.item,allData=Array.isArray(item.items)? item.items : data;
                        const cells = visibleColumns.map((i,index)=>{
                            const cellValue = data[i];
                            const col = defaultObj(cols[i]);
                            const cellArgs = {...col,...arg,containerProps:{},columnIndex:col.index,style:{width:col.width},cellValue,data,rowData:data,row:data,rowIndex:arg.index};
                            const cell = renderCell ? renderCell(cellArgs) : cellValue;
                            let cContainerProps = {},content = React.isValidElement(cell,true)? <Label children={cell}/> : null;
                            if(!content && isObj(cell)){
                                content = React.isValidElement(cell.content)? cell.content : React.isValidElement(cell.content)? cell.content : null;
                                cContainerProps = isObj(cell.containerProps)? cell.containerProps : {};
                            } else if(isObj(cellArgs.containerProps)){
                                cContainerProps = cellArgs.containerProps;
                            }
                            const key = "_Cell_"+i+"_"+arg.index;
                            return (<View {...cellContainerProps} {...cContainerProps} key={key} style={[styles.headerItemOrCell,cellContainerProps.style,cContainerProps.style,{width:col.width}]} testID={testID+key}>
                                {content}
                            </View>);
                        });
                        const selected = typeof isRowSelected=='function'? isRowSelected(item,arg.index):undefined;
                        const rowArgs = {...arg,selected,isTable:true,allData,row:data,cells,rowData:data,rowIndex:arg.index};
                        const rProps = getRowProps ? getRowProps(rowArgs) : {};
                        const rowStyle = getRowStyle(rowArgs);
                        return <View testID={testID+"_Row_"+arg.index} {...rowProps} {...rProps} style={[styles.row,rowProps.style,rowStyle,styles.rowNoPadding,rProps.style]}>
                            {cells}
                        </View>;
                    }}
                />
                    <AbsoluteScrollView
                        ref={absoluteScrollViewRef}
                        listRef = {listRef}
                        scrollEventThrottle = {scrollEventThrottle} 
                        onScroll = {(args)=>{
                            if(!absoluteScrollViewRefCanScroll.current) return;
                            const offset = args?.nativeEvent?.contentOffset.y;
                            if(typeof offset =='number' && listRef.current && listRef.current.scrollToOffset){
                                listRef.current.scrollToOffset({animated:true,offset});
                            }
                        }}
                    />
            </ScrollView>}
            
    </View>
});

const ColumnType = PropTypes.shape({
    field : PropTypes.string,
    label : PropTypes.text,
    text : PropTypes.string,
});
const RowType = PropTypes.shape({

});
const styles = StyleSheet.create({
    datagrid : {
        flex:1,
    },
    contentContainer : {
        flex:1,
    },
    container : {
        width : '100%',
        minHeight : 300,
        paddingBottom : 50,
        paddingHorizontal : 5,
        flex : 1,
        position : 'relative',
    },
    header2footerContainer:{
        flexDirection : 'column',
        width : '100%',
        height : '100%',
        minHeight : 50,
    },
    headerContainer : {
        width : '100%',
        flexDirection : 'row',
    },
    header: {
        flexDirection: 'row',
        paddingVertical : 7,
        alignItems : 'center',
        width : '100%',
    },
    footerContainer : {
        width : '100%',
        flexDirection : 'row',
        flexWrap : 'wrap',
    },
    footers : {
        minHeight : 40,
    },
    headerItemOrCell : {
        alignItems: 'flex-start',
        alignSelf : 'center',
        height : '100%',
        justifyContent: 'center',
        textAlign : 'left',
        flexWrap : 'wrap',
        paddingHorizontal:5,
        paddingVertical : 0,
    },
    filterCell : {
        alignSelf : "flex-start",
        textAlign : "left",
        paddingHorizontal : 2,
        paddingVertical : 0,
        marginVertical : 0,
        marginHorizontal : 0,
        justifyContent : 'flex-start',
    },
    headerItem: {
        minHeight: 30,
    },
    column : {
        flexDirection : 'row',
        justifyContent : 'center',
        alignItems : 'flex-start',
    },
    row : {
        flexDirection : "row",
        justifyContent : "flex-start",
        alignItems : 'flex-start',
        width : '100%',
    },
    rowNoPadding : {
        paddingHorizontal:0,
        marginHorizontal : 0,
        marginVertical : 0,
    },
    hasNotData : {
        flexDirection : 'column',
        width : '100%',
        justifyContent : 'center',
        alignItems : 'center'
    }
})
TableComponent.popTypes = {
    containerProps : PropTypes.object,
     renderHeaderCell : PropTypes.func,
     renderFilterCell : PropTypes.func,
     renderRow : PropTypes.func,
     renderCell : PropTypes.func,
     renderFooterCell : PropTypes.func,///la fonction appelée pour le rendu des entêtes du footer
     footerCellContainerProps : PropTypes.object,
     filterCellContainerProps : PropTypes.object,
     footerContainerProps : PropTypes.object,
     showFilters : PropTypes.bool,
     showFooters : PropTypes.bool,
     cellContainerProps : PropTypes.object,
     headerCellContainerProps : PropTypes.object,//les props du container des entêtes du tableau
     rowContainerProps : PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
     ]),///les props du container des lignes
    columns  : PropTypes.oneOfType([
        PropTypes.objectOf(ColumnType),
        PropTypes.arrayOf(ColumnType)
    ]).isRequired,
    data : PropTypes.oneOfType([
        PropTypes.objectOf(RowType),
        PropTypes.arrayOf(RowType),
    ]),
    columnsWidths : PropTypes.object,
    colsWidths : PropTypes.object,//alias à columnsWidths
    columnWidth: PropTypes.number,
    height: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    headerContainerProps : PropTypes.object,
    footerContainerProps : PropTypes.object,
    rowContainerProps : PropTypes.oneOfType([
      PropTypes.func,  
      PropTypes.object
    ]),
    cellContainerProps : PropTypes.oneOfType([
      PropTypes.func,  
      PropTypes.object
    ]),
    headerScrollViewProps : PropTypes.object,
    footerScrollViewProps : PropTypes.object,
}


TableComponent.displayName = "TableComponent";

export default TableComponent;