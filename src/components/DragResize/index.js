// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
/***Fork of https://github.com/CaptainOmega/react-native-drag-resize components */
import {defaultNumber} from "$utils";
import React from "$react";
  export default function DragResizeComponent ({x,y,width,height,onResize,...props}){
     x = defaultNumber(x); y = defaultNumber(y);
     const [resize, setResize] = React.useState([x, y]);
     return <DragResizeBlock
        w = {width}
        h = {height}
        {...props}
        x={resize[0]}
        y={resize[1]}
        onResize={(value) => setResize(value)}
     />
  }

  
export {
  DragResizeBlock,
  AXIS_X,
  AXIS_Y,
  AXIS_ALL,
} from './DragResizeBlock';
import {DragResizeBlock} from "./DragResizeBlock"
export {
  DragResizeContainer,
} from './DragResizeContainer';

export {
  CONNECTOR_TOP_LEFT,
  CONNECTOR_TOP_MIDDLE,
  CONNECTOR_TOP_RIGHT,
  CONNECTOR_MIDDLE_RIGHT,
  CONNECTOR_BOTTOM_RIGHT,
  CONNECTOR_BOTTOM_MIDDLE,
  CONNECTOR_BOTTOM_LEFT,
  CONNECTOR_MIDDLE_LEFT,
  CONNECTOR_CENTER,
} from './Connector';
