// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { Resizable } from 'react-resizable';
import React from "$react";
import {defaultObj} from "$utils";
import PropTypes from "prop-types";

const ResizableComponent = React.forwardRef(({width,onResize,height,...props},ref)=>{
    const [state,setState] = React.useState({
        width,
        height,
    });
    return <Resizable {...props} height={state.height} width={state.width} onResize={(event, {element, size, handle}) => {
        setState({width: size.width, height: size.height});
        if(onResize){
            onResize({...size,element,handle,event});
        }
      }}>

    </Resizable>
});

ResizableComponent.displayName ="ResizableComponent";

export default ResizableComponent;

ResizableComponent.propTypes = {
    ...defaultObj(Resizable.propTypes),
    width : PropTypes.oneOfType([PropTypes.number,PropTypes.string]),
    height : PropTypes.oneOfType([PropTypes.number,PropTypes.string])
}