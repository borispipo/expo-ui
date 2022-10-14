import {FlashList,BigList} from "$ecomponents/List";
import View from "$ecomponents/View";
import {defaultObj,defaultStr,debounce,isNumber,defaultVal} from "$utils";
import PropTypes from "prop-types";
export const DEFAULT_COLUMN_WIDTH = 60;
import React from "$react";
import Label from "$ecomponents/Label";
import { StyleSheet,ScrollView,Dimensions} from "react-native";
import { getRowStyle } from "$ecomponents/Datagrid/utils";
import {isMobileNative} from "$cplatfrom";
import theme from "$theme";
const isSCrollingRef = React.createRef();
const scrollLists = (opts,refs)=>{
    refs.map((ref)=>{
        if(ref && ref.current && ref.current.scrollTo){
            return ref.current.scrollTo({...defaultObj(opts),animated:true});
        }
    });
    isSCrollingRef.current = false;
}
const getOnScrollCb = (refs)=>{
    const cb = (args)=>{
        if(isSCrollingRef.current) return;
        if(!isObj(args) || !args.nativeEvent) {
            isSCrollingRef.current = false;
        }
        isSCrollingRef.current = true;
        scrollLists({x:args.nativeEvent.contentOffset?.x},refs);
    };
    return isMobileNative()? cb : debounce(cb,200);
}

const TableComponent = React.forwardRef(({containerProps,isRowSelected,headerScrollViewProps,footerScrollViewProps,scrollViewProps,showFooters,renderFooterCell,footerCellContainerProps,headerContainerProps,headerCellContainerProps,headerProps,rowProps:customRowProps,renderCell,cellContainerProps,hasFooters,renderHeaderCell,columnProps,getRowKey,columnsWidths,colsWidths,footerContainerProps,showFilters,columns,data,testID,...props},tableRef)=>{
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
        const cols = {},headers = {},footers = {},visibleColumns = [];
        let hasFooters = false;
        columnProps = defaultObj(columnProps);
        let columnIndex = 0;
        const widths = defaultObj(columnsWidths,colsWidths);
        headerCellContainerProps = defaultObj(headerCellContainerProps);
        footerCellContainerProps = defaultObj(footerCellContainerProps);
        Object.map(columns,(columnDef,field)=>{
          if(!isObj(columnDef) /*|| columnDef.visible === false*/) return;
          const columnField = defaultStr(columnDef.field,field);
          let {visible,width,type,...colProps} = columnDef;
          visible = typeof visible =='boolean'? visible : true;
          type = defaultStr(type,"text").toLowerCase().trim();
          colProps = defaultObj(colProps);
          width = defaultDecimal(widths[columnField],width,DEFAULT_COLUMN_WIDTH);
          const style = [colProps.style,{width}];
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
            <Label textBold primary>{content}</Label>
        </View>;
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
            footers[columnField] = <View testID={testID+"_Footer_Cell_"+columnField} {...fContainerProps} key={columnField} style={[styles.headerItem,styles.headerItemOrCell,footerCellContainerProps.style,fContainerProps.style,style]}>
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
        return {columns:cols,visibleColumns,headers,hasFooters,footers};
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
    const {visibleColumns,columns:cols,headers,footers} = state;
    headerContainerProps = defaultObj(headerContainerProps);
    footerContainerProps = defaultObj(footerContainerProps);
    let hProps = typeof headerProps =='function'? hProps({columns:col,visibleColumns}) : {};
    const h = [],f = [];
    let totalWidths = 0;
    visibleColumns.map((i)=>{
        if(!isObj(cols[i])) return;
        h.push(headers[i]);
        totalWidths+=cols[i].width;
        if(showFooters && state.hasFooters){
            f.push(footers[i]);
        }
    });
    const scrollContentContainerStyle = {flex:1,width:listWidth,minWidth:totalWidths,height:'100%'};
    const scrollEventThrottle = isMobileNative()?200:50;
    const scrollViewFlexGrow = {flexGrow:0};
    const allScrollViewProps = {
        scrollEventThrottle,
        horizontal : true,
        ...scrollViewProps,
        style : [{maxHeight:120},scrollViewProps.style],
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
        fContent = f.length ? <View testID={testID+"_Footer"} {...footerContainerProps} style={[styles.header,styles.footers,footerContainerProps.style]}>
        {f}
    </View> : null;
    React.setRef(tableRef,context);
    const cStyle = {width:listWidth}
    return <View testID= {testID+"_Container"} {...containerProps} style={[styles.container,{alignItems:'stretch'},containerProps.style]}>
            <View autoHeight style={[cStyle]} testID={testID+"_Headers_ScrollViewContainer"}>
                <ScrollView
                    testID={testID+"_HeaderScrollView"}
                    {...headerScrollViewProps} 
                    contentContainerStyle = {[allScrollViewProps.contentContainerStyle,headerScrollViewProps.contentContainerStyle,{height:'100%',flexWrap: 'wrap'}]}
                    style = {[allScrollViewProps.style,headerScrollViewProps.style,{height:'100%',flex:1,flexWrap:'wrap'}]}
                    ref={headerScrollViewRef} horizontal {...allScrollViewProps}
                    onScroll = {getOnScrollCb([scrollViewRef,footerScrollViewRef])}
                    showsHorizontalScrollIndicator
            >
                    {hContent}
                </ScrollView>
            </View>
            <ScrollView {...scrollViewProps} scrollEventThrottle = {scrollEventThrottle} horizontal contentContainerStyle={[scrollContentContainerStyle,scrollViewProps.contentContainerStyle]} showsVerticalScrollIndicator={false}  onScroll = {getOnScrollCb([headerScrollViewRef,footerScrollViewRef])} ref={scrollViewRef}  testID={testID+"_ScrollView"}>    
                <FlashList
                    containerProps = {{style:[cStyle]}}
                    //prepareItems = {Array.isArray(items)? false : undefined}
                    estimatedItemSize = {200}
                    {...props}
                    ref = {listRef}
                    numberOfLines = {1}
                    responsive = {false}
                    testID = {testID}
                    items = {data}
                    contentContainerStyle = {[styles.contentContainer,{with:listWidth,minWidth:totalWidths,position:'absolute',right:'0'}]}
                    style = {[styles.datagrid,{width:listWidth,minWidth:totalWidths}]}
                    keyExtractor = {typeof getRowKey =='function'? getRowKey : React.getKey}
                    //stickyHeaderIndices={[0]}
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
        </ScrollView>
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
        minHeight : 50,
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
})
TableComponent.popTypes = {
    containerProps : PropTypes.object,
     renderHeaderCell : PropTypes.func,
     renderRow : PropTypes.func,
     renderCell : PropTypes.func,
     renderFooterCell : PropTypes.func,///la fonction appelée pour le rendu des entêtes du footer
     footerCellContainerProps : PropTypes.object,
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

const ScrollViewCustom = React.forwardRef((props,ref)=>{
    const {testID,onScroll,style,handle} = props;
    const context = {};
    React.setRef(ref,context);
    return <View 
        {...props}
        ref = {ref} 
        style = {[styles.scrollViewCustom,style,{backgroundColor:theme.colors.primary}]}
        onScroll={onScroll} 
        testID={(testID||'RN_TableComponentScrollViewCustom')}
    />
});
ScrollViewCustom.displayName = "TableComponentScrollViewCustom";

TableComponent.displayName = "TableComponent";

export default TableComponent;