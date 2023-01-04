// Copyright 2023 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import React, { useCallback, useRef, useState, useLayoutEffect } from "$react";
import { Platform, StyleSheet, View} from "react-native";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import stableHash from "stable-hash";
import {defaultNumber,isNumber} from "$utils";

const styles = StyleSheet.create({container: { flex: 1 }});

const AutoResizerComponent = React.forwardRef((props,ref) =>{
    const {
      children,
      defaultHeight,
      defaultWidth,
      disableHeight,
      disableWidth,
      onResize: _onResize,
      ...viewProps
    } = props;
  
    const innerRef = useRef(null);
    const layoutRef = React.useRef({
       width : defaultNumber(disableWidth ? 0 : defaultWidth),
       height : defaultNumber(disableHeight ? 0 : defaultHeight),
       x : 0,
       y : 0,
    })
    const [result, setResult] = useState(Object.clone(layoutRef.current));
    const canRender = x=>!!(result.width || result.height) && isNumber(result.x) && isNumber(result.y);
    const onResize = useCallback(({ width, height,x,y}) => {
        layoutRef.current.width = disableWidth ? 0 : width || 0;
        layoutRef.current.height = disableHeight ? 0 : height || 0;
        layoutRef.current.x =  disableWidth? 0 : x;
        layoutRef.current.y = disableHeight ? 0 : y;
        if (Math.abs(result.width - layoutRef.current.width) <= 50  && Math.abs(result.height-layoutRef.current.height)<=50) return;
        setResult({...layoutRef.current});
      },[stableHash({disableWidth, disableHeight, _onResize, result})]);
  
    const onLayout = useCallback(e => {
        const layout = e.nativeEvent.layout;
        const x = defaultNumber(layout.x,layout.left);
        const y = defaultNumber(layout.y,layout.top);
        onResize({width:layout.width,height:layout.height,x,y});
      },[onResize]);
    // Avoid zero/flash on first render, at least on web
    // @see https://github.com/bvaughn/react-virtualized-auto-sizer/blob/ffcba2dd39b89111ed4b42d64431f35ce7c1c23a/src/index.js#L69-L94
    // @see https://github.com/bvaughn/react-virtualized-auto-sizer/issues/10
    useLayoutEffect(() => {
      if (Platform.OS !== "web") return;
      const autoSizer = findDOMNode(innerRef.current);
      if (
        autoSizer &&
        autoSizer.parentNode &&
        autoSizer.parentNode.ownerDocument &&
        autoSizer.parentNode.ownerDocument.defaultView &&
        autoSizer.parentNode instanceof
          autoSizer.parentNode.ownerDocument.defaultView.HTMLElement
      ) {
        const parentNode = autoSizer.parentNode;
        const height = parentNode.offsetHeight || 0;
        const width = parentNode.offsetWidth || 0;
        const x = parentNode.offsetLeft || 0;
        const y = parentNode.offsetTop || 0;
        if ((width || height) && (x || y)) onResize({ width, height,x,y});
      }
    }, []); // eslint-disable-line
    React.useEffect(()=>{
       if(_onResize){
          _onResize(result);
       }
    },[result])
    return (
      <View
        {...viewProps}
        ref={React.useMergeRefs(innerRef,ref)}
        onLayout={onLayout}
        pointerEvents="box-none"
        style={[styles.container, viewProps.style]}
      >
        {canRender() && children({...result,left:result.x,top:result.y}) || null}
      </View>
    );
  });

AutoResizerComponent.displayName = "AutoResizerComponent";

AutoResizerComponent.propTypes = {
      /*** func({width,height})=>PropTypes.node */
      children : PropTypes.func.isRequired,
      defaultHeight : PropTypes.number,
      defaultWidth : PropTypes.number,
      disableHeight : PropTypes.bool,
      disableWidth : PropTypes.bool,
      /***({ width, height }) => void */
      onResize : PropTypes.func,
}

export default AutoResizerComponent;