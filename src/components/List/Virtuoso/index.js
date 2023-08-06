// Copyright 2023 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {Virtuoso,VirtuosoGrid} from "react-virtuoso/dist/index.mjs";
import React from "$react";
import PropTypes from "prop-types";
import {defaultObj,classNames,defaultNumber,isObj,isDOMElement,isNumber,uniqid,isNonNullString,defaultStr} from "$cutils";
import { View } from "react-native";
import {useList} from "../hooks";
import theme,{grid} from "$theme";
import Dimensions from "$cdimensions";

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
const VirtuosoListComponent = React.forwardRef(({onRender,listClassName,components,itemProps,windowWidth,numColumns,responsive,testID,renderItem,onEndReached,onLayout,onContentSizeChange,onScroll,isScrolling,estimatedItemSize,onEndReachedThreshold,containerProps,style,autoSizedStyle,...props},ref)=>{
    const Component = React.useMemo(()=>responsive?VirtuosoGrid:Virtuoso,[responsive])
    const context = useList(props);
    itemProps = defaultObj(itemProps);
    const items = context.items;
    const r2 = {};
    Object.map(Component.propTypes,(_,i)=>{
        if(i in props){
            r2[i] = props[i];
        }
    });
    containerProps = defaultObj(containerProps);
    testID = defaultStr(testID,containerProps.testID,"RN_VirtuosoListComponent");
    const listIdRef = React.useRef(uniqid("virtuoso-list-id"));
    const listId = listIdRef.current;
    const listRef = React.useRef(null);
    const sizeRef = React.useRef({width:0,height:0});
    const listSize = sizeRef.current;
    const isValid = ()=> listRef.current;
    const listStyle = {height:'100%',width:"100%",overflowX:'hidden'};
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
    React.useEffect(()=>{
        return ()=>{
            React.setRef(ref,null);
        }
    },[]);
    React.useOnRender((a,b,c)=>{
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
    return <View {...containerProps} {...props} style={[{flex:1},containerProps.style,style,autoSizedStyle,{minWidth:'100%',height:'100%',maxWidth:'100%'}]} onLayout={onLayout} testID={testID}>
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
                return renderItem({index,item:items[index],items})
            }}
            atBottomStateChange = {()=>{
                if(typeof onEndReached =='function'){
                    onEndReached();
                }
            }}
            onScroll={(e) => onScroll && onScroll(normalizeEvent(e))}
            isScrolling = {(isC,a)=>{
                if(typeof isScrolling =='function'){
                    return isScrolling(isC);
                }
            }}
            components = {{
                Item : responsive ? function(props){return <ItemContainer {...props} style={[itemProps.style,props.style]} numColumns={numColumns}/>} : undefined,
                //List : responsive ? ResponsiveVirtuosoListItemContainer: undefined,
                ...defaultObj(components),
            }}
        />
    </View>
});

VirtuosoListComponent.propTypes = {
    ...propTypes,
    numColumns : PropTypes.number,
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
    const dataItemIndex = props["data-item-index"];
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