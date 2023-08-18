// Copyright 2023 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {Virtuoso,VirtuosoGrid,TableVirtuoso} from "react-virtuoso/dist/index.mjs";
import React from "$react";
import PropTypes from "prop-types";
import {defaultObj,classNames,defaultNumber,isObj,isDOMElement,isNumber,uniqid,isNonNullString,defaultStr} from "$cutils";
import { View } from "react-native";
import {useList} from "../hooks";
import theme,{grid} from "$theme";
import Dimensions from "$cdimensions";
import { StyleSheet } from "react-native";
import {isMobileNative} from "$cplatform";
import {addClassName,removeClassName} from "$cutils/dom";
import { useGetNumColumns } from "../hooks";

const propTypes = {
    ...defaultObj(Virtuoso.propTypes),
    items : PropTypes.array.isRequired,
    alignToBottom : PropTypes.bool,
    /**Called with true / false when the list has reached the bottom / gets scrolled up. Can be used to load newer items, like tail -f. */
    atBottomStateChange : PropTypes.func,
    /***alias : onEndReachedThreshold */
    atBottomThreshold : PropTypes.number,
    atTopStateChange : PropTypes.func,
    atTopThreshold : PropTypes.number,
    defaultItemHeight : PropTypes.number,
    /***(index: number) => void; Gets called when the user scrolls to the end of the list. Receives the last item index as an argument. Can be used to implement endless scrolling. */
    endReached : PropTypes.func,
    firstItemIndex : PropTypes.number,
    /**(isScrolling: boolean) => void */
    isScrolling : PropTypes.func,
};
/***@see : https://virtuoso.dev/virtuoso-api-reference/ */
const VirtuosoListComponent = React.forwardRef(({onRender,id,fixedHeaderContent,numColumns:cNumCol,rowProps,renderTable,listClassName,components,itemProps,windowWidth,responsive,testID,renderItem,onEndReached,onLayout,onContentSizeChange,onScroll,isScrolling,estimatedItemSize,onEndReachedThreshold,containerProps,style,autoSizedStyle,...props},ref)=>{
    if(renderTable){
        responsive = false;
    }
    const {numColumns} = useGetNumColumns({responsive,numColumns:cNumCol,windowWidth})
    const Component = React.useMemo(()=>renderTable ? TableVirtuoso : responsive?VirtuosoGrid:Virtuoso,[responsive,renderTable]);
    const context = useList(props);
    itemProps = defaultObj(itemProps);
    const items = context.items;
    renderTable ? rowProps = defaultObj(rowProps) : null;
    const r2 = {};
    if(renderTable){
        r2.fixedHeaderContent = fixedHeaderContent;
    }
    Object.map(Component.propTypes,(_,i)=>{
        if(i in props){
            r2[i] = props[i];
        }
    });
    containerProps = defaultObj(containerProps);
    const idRef = React.useRef(defaultStr(id,uniqid("virtuoso-list-id")));
    id = idRef.current; 
    const containerId = `${id}-container`;
    const headId = `${id}-table-head`;
    testID = defaultStr(testID,containerProps.testID,"RN_VirtuosoListComponent");
    const listIdRef = React.useRef(uniqid("virtuoso-list-id"));
    const listId = listIdRef.current;
    const listRef = React.useRef(null);
    const sizeRef = React.useRef({width:0,height:0});
    const listSize = sizeRef.current;
    const isValid = ()=> listRef.current;
    const listStyle = {height:'100%',width:"100%",overflowX:renderTable?"auto":"hidden",maxWidth:"100%"};
    if(renderTable){
        listStyle.borderCollapse ="collapse";
    }
    r2["data-test-id"] = testID+"_ListContent";
    if(isObj(estimatedItemSize)){
        if(isNumber(estimatedItemSize.width)){
            listStyle.width = estimatedItemSize.width+"px";
        }
        if(isNumber(estimatedItemSize.height)){
            listStyle.height = estimatedItemSize.height+"px";
        }
    }
    React.setRef(ref,{
        scrollToEnd : ()=>{
            return isValid() && listRef.current.scrollToIndex && listRef.current.scrollToIndex({index:"LAST"});
        },
        scrollToTop : ()=>{
            return isValid() && listRef.current.scrollToIndex && listRef.current.scrollToIndex({index:0});
        },
        scrollToIndex : (opts)=>{
            opts = defaultObj(opts);
            opts.index = defaultNumber(opts.index);
            return isValid() && listRef.current.scrollToIndex && listRef.current.scrollToIndex(opts);
        },
        scrollToItem : ()=>null,
        scrollToOffset : (opts)=>{
            opts = defaultObj(opts);
            opts.top = defaultNumber(opts.top,opts.offset);
            return isValid() && listRef.current.scrollTo && listRef.current.scrollTo(opts);
        },
        scrollToLeft : ()=>{
            return isValid() && listRef.current.scrollTo && listRef.current.scrollTo({left:0});
        },
    });
    const checkSize = ()=>{
        const element = document.getElementById(listId);
        if(!element) return;
        const target = element.firstChild?.firstChild;
        if(isDOMElement(target) && onContentSizeChange){
            const {nativeEvent:{contentSize}} = normalizeEvent({target});
            setTimeout(()=>{
                target.style.paddingBottom = "50px";
                if(contentSize.width !== listSize.width || contentSize.height != listSize.height){
                    sizeRef.current = contentSize;
                    onContentSizeChange(contentSize.width,contentSize.height);
                }
            },100)
        }
    }
    const scrolledTopRef = React.useRef(0);
    const updateTableHeadCss = ()=>{
        const newScrollTop = scrolledTopRef.current;
        const head = document.querySelector(`#${headId}`);
        if(!head || typeof newScrollTop !='number') return;
        const scrolled = newScrollTop > 50
        head.style.background = !scrolled ? "transparent":theme.isDark()? theme.Colors.lighten(theme.surfaceBackgroundColor):theme.Colors.darken(theme.surfaceBackgroundColor);
        head.style.border = !scrolled ? "none" : `1px solid ${theme.colors.divider}`
    }
    React.useEffect(()=>{
        const handleScroll = (e)=>{
            if(!isDOMElement(e?.target)) return;
            const target = e?.target;
            const container = document.querySelector(`#${containerId}`);
            if(!container) return;
            if(container !== target && !container.contains(target)) return;
            if(!target.hasAttribute("data-virtuoso-scroller")) return;
            scrolledTopRef.current = typeof target?.scrollTop =="number"? target.scrollTop : undefined;
            updateTableHeadCss();
        }
        window.addEventListener('scroll', handleScroll,true);
        return ()=>{
            React.setRef(ref,null);
            window.removeEventListener('scroll', handleScroll,true);
        }
    },[]);
    React.useOnRender((a,b,c)=>{
        updateTableHeadCss();
        if(onRender && onRender(a,b,c));
    },Math.max(Array.isArray(items) && items.length/10 || 0,500));
    const listP = responsive ? {
        listClassName : classNames(listClassName,"rn-virtuoso-list",responsive && gridClassName)
    } : {
        atBottomThreshold : typeof onEndReachedThreshold =='number'? onEndReachedThreshold : undefined,
        totalListHeightChanged : (height)=>{
            checkSize();
        },
        defaultItemHeight : typeof estimatedItemSize=='number' && estimatedItemSize || undefined,
    };
    return <View {...containerProps} {...props} id={containerId} className={classNames("virtuoso-list-container",renderTable&& "virtuoso-list-container-render-table")} style={[{flex:1},containerProps.style,style,autoSizedStyle,{minWidth:'100%',height:'100%',maxWidth:'100%'}]} onLayout={onLayout} testID={testID}>
        <Component
            {...r2}
            {...listP}
            style = {listStyle}
            ref = {listRef}
            data = {items}
            id = {listId}
            useWindowScroll = {false}
            totalCount = {items.length}
            itemContent = {(index)=>{
                return renderItem({index,numColumns,item:items[index],items})
            }}
            atBottomStateChange = {()=>{
                if(typeof onEndReached =='function'){
                    onEndReached();
                }
            }}
            onScroll={(e) => onScroll && onScroll(normalizeEvent(e))}
            isScrolling = {(isC,)=>{
                if(typeof isScrolling =='function'){
                    return isScrolling(isC);
                }
                if(!renderTable) return;
            }}
            components = {{
                Item : renderTable ? undefined : responsive ? function(props){return <ItemContainer {...props} style={[itemProps.style,props.style]} numColumns={numColumns}/>} : undefined,
                ...(renderTable ? {
                    TableRow: TableRowComponent,
                }:{}),
                ...defaultObj(components),
                ...(renderTable ? {
                    TableHead : React.forwardRef((props,ref)=>{
                        const restProps = {id:headId,className:classNames(props.className,"virtuoso-list-render-table-thead")};
                        return <thead ref={ref} {...props} {...restProps}/>
                    })
                } : {})
            }}
        />
    </View>
});

VirtuosoListComponent.propTypes = {
    ...propTypes,
    fixedHeaderContent : PropTypes.func,//la fonction rendant le contenu fixe du tableau
    renderTable : PropTypes.bool,//si le composant Table sera rendu
    numColumns : PropTypes.number,
    rowProps : PropTypes.object,//les props du TableRow, lorsque le rendu est de type table
    items : PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
        PropTypes.func,
    ])
};

VirtuosoListComponent.displayName = "VirtuosoListComponent";

export default VirtuosoListComponent;

const normalizeEvent = (e)=>{
    return {
      nativeEvent: {
        contentOffset: {
          get x() {
            return e.target.scrollLeft;
          },
          get y() {
            return e.target.scrollTop;
          }
        },
        contentSize: {
          get height() {
            return e.target.scrollHeight;
          },
          get width() {
            return e.target.scrollWidth;
          }
        },
        layoutMeasurement: {
          get height() {
            return e.target.offsetHeight;
          },
          get width() {
            return e.target.offsetWidth;
          }
        }
      },
      timeStamp: Date.now()
    };
  }
  
  function ItemContainer({numColumns,responsive,windowWidth,...props}){
    const width = React.useMemo(()=>{
        if(!numColumns || numColumns <= 1) return undefined;
        if(typeof windowWidth =='number' && windowWidth <=600) return "100%";
        if(Dimensions.isMobileMedia()){
            return "100%";
        }
        return (100/numColumns)+"%";
    },[windowWidth,numColumns]);
    const style = width && {width} || grid.col(windowWidth);
    const dataIntex  = "index" in props ? props.index : "data-index" in props ? props["data-index"] : ""
    const dataItemIndex = "data-item-index" in props ? props["data-item-index"] : "";
    if(isObj(style)){
        style.paddingRight = style.paddingLeft = style.paddingHorizontal = undefined;
    }
    return <View
        testID={`RN_VirtosoGridItem_${dataIntex}-${dataItemIndex}`}
        {...props}
        style = {[style,props.style]}
    />
  }
  const ResponsiveVirtuosoListItemContainer = React.forwardRef((props,ref)=>{
    return <View ref={ref} testID={"RN_ResponsiveVirtuosoListItemContainer"} {...props} style={[responsiveListStyle,props.style,]}/>
  });
  
  export const gridClassName = "rn-virtuoso-responsive-list";
  
  const responsiveListStyle = [theme.styles.row,theme.styles.row,theme.styles.flexWrap,theme.styles.justifyContentStart,theme.styles.alignItemsStart]
  ResponsiveVirtuosoListItemContainer.displayName = "ResponsiveVirtuosoListItemContainer";
  
  if(typeof document !=='undefined' && document && document?.createElement){
    const gridDomId = "dynamic-virtuoso-grid-styles";
    let style = document.getElementById(gridDomId);
    if(!style){
        style = document.createElement("style");
    }
    style.id = gridDomId;
    style.textContent = `
        .${gridClassName}{display:flex;flex-direction:row;align-items:flex-start;flex-wrap:wrap;justify-content:flex-start;};
    `;
    document.body.appendChild(style);
}

export const TableRowComponent = ({testID,style,...props}) => {
    const index = props['data-index'];
    const isOdd = typeof index =='number' ? index%2 > 0 : false;
    testID = defaultStr(testID,"_VirtuosoTableRow_"+index);
    return <tr data-test-id={testID} {...props} style={StyleSheet.flatten(style)} className={classNames(props.className,"virtuoso-table-row",`table-row-${isOdd?"odd":"even"}`)}/>
};