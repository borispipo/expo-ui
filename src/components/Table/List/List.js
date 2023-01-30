// Copyright 2023 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {Virtuoso} from "react-virtuoso/dist/index.mjs";
import React from "$react";
import PropTypes from "prop-types";
import {defaultObj,defaultNumber,isDOMElement,isNumber,uniqid,isNonNullString,defaultStr} from "$utils";
import { View } from "react-native";

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
const VirtuosoListComponent = React.forwardRef(({items,onRender,testID,renderItem,onEndReached,onLayout,onContentSizeChange,onScroll,isScrolling,estimatedItemSize,onEndReachedThreshold,containerProps,style,...props},ref)=>{
    const r2 = {};
    for(let i in propTypes){
        if(i in props){
            r2[i] = props[i];
        }
    }
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
                if(contentSize.width !== listSize.width || contentSize.height != listSize.height){
                    sizeRef.current = contentSize;
                    onContentSizeChange(contentSize.width,contentSize.height);
                }
            },100)
        }
    }
    React.useEffect(()=>{
        checkSize();
    },[props])
    React.useEffect(()=>{
        return ()=>{
            React.setRef(ref,null);
        }
    },[]);
    React.useOnRender(onRender,Math.max(Array.isArray(items) && items.length/10 || 0,500))
    return <View {...containerProps} {...props} style={[{flex:1},containerProps.style,style,{minWidth:'100%',maxWidth:'100%'}]} onLayout={onLayout} testID={testID}>
        <Virtuoso
            {...r2}
            style = {listStyle}
            ref = {listRef}
            data = {items}
            id = {listId}
            useWindowScroll = {false}
            totalCount = {items.length}
            itemContent = {(index)=>{
                return renderItem({index,item:items[index],items})
            }}
            atBottomThreshold = {typeof onEndReachedThreshold =='number'? onEndReachedThreshold : undefined}
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
            defaultItemHeight = {typeof estimatedItemSize=='number' && estimatedItemSize || undefined}
        />
    </View>
});

VirtuosoListComponent.propTypes = {
    ...propTypes
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