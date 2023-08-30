import View from "$ecomponents/View";
import {defaultObj,defaultStr,debounce,classNames,defaultNumber,uniqid,isObj,defaultVal} from "$cutils";
import PropTypes from "prop-types";
import React from "$react";
import { StyleSheet,View as RNView,ScrollView,Dimensions} from "react-native";
import {isMobileNative} from "$cplatform";
import theme from "$theme";
import AbsoluteScrollView from "./AbsoluteScrollView";
import Row from "./Row";
import List,{TableRowComponent} from "./List";
import Header from "./Header";
import { usePrepareColumns,TableContext,useTable} from "./hooks";
import styles from "./styles";
import {useIsRowSelected} from "$ecomponents/Datagrid/hooks";
import {getRowStyle} from "$ecomponents/Datagrid/utils";
import ScrollNative from "./ScrollNative";
import VirtuosoTableComponent from "./VirtuosoTable";
import EmptyPlaceholder from "./EmptyPlaceholder";
export {styles};

const isSCrollingRef = React.createRef();
const isNative = isMobileNative();

export * from "./utils";
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

const TableComponent = React.forwardRef(({containerProps,listContainerStyle,onRender,height,progressBar,renderListContent,children,renderEmpty,renderItem,headerScrollViewProps,footerScrollViewProps,scrollViewProps,renderFooterCell,footerCellContainerProps,filterCellContainerProps,headerCellContainerProps,headerProps,rowProps:customRowProps,cellContainerProps,hasFooters,renderHeaderCell,renderFilterCell,columnProps,getRowKey,columnsWidths,colsWidths,columns,...props},tableRef)=>{
    containerProps = defaultObj(containerProps);
    cellContainerProps = defaultObj(cellContainerProps);
    scrollViewProps = defaultObj(scrollViewProps);
    headerScrollViewProps = defaultObj(headerScrollViewProps);
    footerScrollViewProps = defaultObj(footerScrollViewProps);
    const listRef = React.useRef(null),scrollViewRef = React.useRef(null),headerScrollViewRef = React.useRef(null);
    const layoutRef = React.useRef({});
    const {testID,withDatagridContext,getRowByIndex,itemsChanged,hasFooters:stateHasFooters,bordered,totalWidths,keyExtractor,items,data} = useTable();
    const hasData = !!Object.size(data,true);
    const emptyData = !hasData && renderListContent === false ?null : typeof renderEmpty =='function' ? renderEmpty() : null;
    const hasEmptyData = emptyData && React.isValidElement(emptyData);
    const emptyContent = <View onRender={onComponentRender} testID={testID+"_EmptyData"} style={styles.hasNotData}>
        {emptyData}
    </View> 
    const scrollContentContainerStyle = {flex:1,width:listWidth,minWidth:totalWidths,height:'100%'};
    const scrollEventThrottle = isMobileNative()?200:50;
    const scrollViewFlexGrow = {flexGrow:0};
    const maxScrollheight = 170;
    const allScrollViewProps = {
        scrollEventThrottle,
        horizontal : true,
        ...scrollViewProps,
        style : [{maxHeight:maxScrollheight},
        scrollViewProps.style],
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
    const absoluteScrollViewRefCanScroll = React.useRef(true);
    React.setRef(tableRef,context);
    const cStyle = {width:listWidth}
    const absoluteScrollViewRef = React.useRef(null);
    const absoluteScrollingRef = React.useRef(false);
    const scrollViewLayoutRef = React.useRef({});
    const toggleAbsoluteScrollVisible = ()=>{
        const ref = scrollViewLayoutRef.current;
        if(isObj(ref.layout) && isObj(ref.content)){
            const layoutVisible  = Math.abs(ref.content.width - ref.layout.width)<=50 ? false : true;
            if(absoluteScrollViewRef.current && absoluteScrollViewRef.current.setLayoutVisible){
                absoluteScrollViewRef.current.setLayoutVisible(layoutVisible);
            }
        }
    }
    const onComponentRender = (...args)=>{
        if(onRender){
            onRender(...args);
        }
        //au paravant il était possible de faire scroller le composant Table lorsque les données sont raffraichies, ce qui n'avait pas un bon impact sur le rendu de la table de données
        if(false && itemsChanged){
            //permet de restaurer la position scrollé où scroll initial à chaque fois que le composant est re render
            //ce qui n'est pas très interessant
            if(headerScrollViewRef.current && headerScrollViewRef.current.scrollTo){
                headerScrollViewRef.current.scrollTo({
                    x : 0,
                    y : 0,
                    animated : true,
                })
            }
        }
    };
    const headerFootersFilters = React.useMemo(()=>{
        return <>
            <Header isHeader={true} testID={testID+"_TableHeader"}/>
            <Header isFilter={true} testID={testID+"_TableFilters"} style={[styles.header,styles.filters,theme.styles.pt0,theme.styles.pb0,theme.styles.ml0,theme.styles.mr0]}/>
            <Header isFooter testID={testID+"_TableFooter"}  style={[styles.header,styles.footers,theme.styles.pt0,theme.styles.pb0,theme.styles.ml0,theme.styles.mr0]}/>
        </>
    },[])
    return <View testID= {testID+"_Container"}  {...containerProps} onLayout={(e)=>{
        layoutRef.current = e.nativeEvent.layout;
        if(containerProps.onLayout){
            containerProps.onLayout(e);
        }
    }} style={[styles.container,{alignItems:'stretch'},containerProps.style]}>
            {isNative && <RNView style={[cStyle]} testID={testID+"_Headers_ScrollViewContainer"}>
            <ScrollView
                    testID={testID+"_HeaderScrollView"}
                    {...headerScrollViewProps} 
                    contentContainerStyle = {[allScrollViewProps.contentContainerStyle,headerScrollViewProps.contentContainerStyle,{flex:1,flexWrap: 'wrap'}]}
                    style = {[allScrollViewProps.style,headerScrollViewProps.style,{height:'100%',flex:1,flexWrap:'wrap'}]}
                    ref={headerScrollViewRef} 
                    horizontal {...allScrollViewProps}
                    onScroll = {getOnScrollCb([scrollViewRef,footerScrollViewRef])}
                    showsHorizontalScrollIndicator
            >
                    <View testID={testID+"Header2FootersWrapper"} style={[theme.styles.w100]}>
                        {headerFootersFilters}
                    </View>
                </ScrollView>
            </RNView>}
            {hasEmptyData && isNative ? emptyContent : <ScrollNative {...scrollViewProps} scrollEventThrottle = {scrollEventThrottle} horizontal contentContainerStyle={[scrollContentContainerStyle,scrollViewProps.contentContainerStyle,{height:'100%'}]} showsVerticalScrollIndicator={false}  
                    onScroll = {getOnScrollCb([headerScrollViewRef,footerScrollViewRef],null,(args)=>{
                        const nativeEvent = args.nativeEvent;
                        if(absoluteScrollViewRef.current && absoluteScrollViewRef.current.checkVisibility){
                            absoluteScrollViewRef.current.checkVisibility(nativeEvent);
                        }
                    })} 
                    onLayout={(args) => {
                        const {nativeEvent:{layout}} = args;
                        scrollViewLayoutRef.current.layout = layout;
                        toggleAbsoluteScrollVisible();
                        if(typeof props.onContainerLayout =='function'){
                            props.onContainerLayout(args);
                        }
                    }}
                    ref={scrollViewRef} 
                    testID={testID+"_ScrollView"}
                    onContentSizeChange = {(width,height)=>{
                        scrollViewLayoutRef.current.content = {width,height};
                        toggleAbsoluteScrollVisible();
                    }}
                >  
                    {progressBar}
                    <List
                        containerProps = {{style:[cStyle,listContainerStyle]}}
                        estimatedItemSize = {200}
                        renderTable
                        columns = {columns}
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
                        onRender = {onComponentRender}
                        onLayout = {(args)=>{
                            if(props.onLayout){
                                //props.onLayout(args);
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
                        prepareItems = {false}
                        items = {items}
                        contentContainerStyle = {[styles.contentContainer,{width:listWidth,minWidth:totalWidths}]}
                        style = {[styles.datagrid,{width:listWidth,minWidth:totalWidths},props.style]}
                        keyExtractor = {keyExtractor}
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
                        renderItem = {({item,index})=>{
                            return <Row rowData={item} index={index} testID={testID+"_Row_"+index}/>
                        }}
                        fixedHeaderContent={(index, user) => {
                            return headerFootersFilters;
                        }}
                        components = {{
                            TableRow: (props) => {
                                const index = props['data-index'];
                                const item = getRowByIndex(index) || props?.item || null;
                                if(!item) return null;
                                 const args = {rowData:item,rowIndex:index,index,bordered,isTable:true};
                                args.selected = withDatagridContext ? useIsRowSelected(item,index) : false;
                                return <TableRowComponent {...props} className={classNames(props.className,"table-row-tr")} style={[getRowStyle(args),styles.tr,props.style]}/>
                            },
                            Table: VirtuosoTableComponent,
                            EmptyPlaceholder : (props)=>{
                                return <EmptyPlaceholder testID={testID+"_VirtuosoEmptyPlaceholder"} {...props} content={emptyContent}/>
                            }
                        }}
                    />
                    {isNative ? <AbsoluteScrollView
                        ref={absoluteScrollViewRef}
                        listRef = {listRef}
                        scrollEventThrottle = {scrollEventThrottle} 
                        onScroll = {(args)=>{
                            if(!absoluteScrollViewRefCanScroll.current || absoluteScrollingRef.current) return;
                            const offset = args?.nativeEvent?.contentOffset.y;
                            if(typeof offset =='number' && listRef.current && listRef.current.scrollToOffset){
                                listRef.current.scrollToOffset({animated:true,offset});
                            }
                        }}
                    />:null}
            </ScrollNative>}
            
    </View>
});

const ColumnType = PropTypes.shape({
    field : PropTypes.string,
    label : PropTypes.text,
    text : PropTypes.string,
});


TableComponent.popTypes = {
    containerProps : PropTypes.object,
     renderHeaderCell : PropTypes.func,
     renderFilterCell : PropTypes.func,
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
    data : PropTypes.array,
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
    renderListContent : PropTypes.bool,//si l'on devra rendre le contenu de la FlashList
    renderItem : PropTypes.func,//la fonction permettant de gérer le rendu des item
    headerScrollViewProps : PropTypes.object,
    footerScrollViewProps : PropTypes.object,
}


TableComponent.displayName = "TableComponent";

const TableComponentProvider = React.forwardRef(({children,id,renderCell,testID,withDatagridContext,getRowKey,filter,data,...props},ref)=>{
    testID = props.testID = defaultStr(testID,"RN_TableComponent");
    const idRef = React.useRef(defaultStr(id,uniqid("virtuoso-table-list-id")));
    id = idRef.current;
    const prepatedColumns = usePrepareColumns({...props,id});
    const keyExtractor = typeof getRowKey =='function'? getRowKey : React.getKey;
    const items = React.useMemo(()=>{
        filter = typeof filter =='function'? filter : x=>true;
        return data.filter((i,...rest)=>isObj(i) && !!filter(i,...rest));
    },[data]);
    const getItem = (index)=>items[index]||null;
    return <TableContext.Provider value={{...props,...prepatedColumns,id,getItem,getRowByIndex:getItem,testID,data,withDatagridContext,keyExtractor,
        renderCell,
        items
    }}>
        <TableComponent {...props} id={id} ref={ref}/>
    </TableContext.Provider>
});
TableComponentProvider.displayName = "TableComponentProvider";
TableComponentProvider.propTypes = TableComponent.propTypes;

export default TableComponentProvider;