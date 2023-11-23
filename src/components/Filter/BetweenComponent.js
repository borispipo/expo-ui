// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import React from "$react";
import TextField from "$ecomponents/Form/Fields/TextField";
import {defaultObj} from "$cutils";

const FilterBetweenComponent = React.forwardRef(({inputProps,contentContainerProps,...props},ref)=>{
    contentContainerProps = defaultObj(contentContainerProps);
    contentContainerProps.style = [{pointerEvents: "auto"},contentContainerProps.style];
    return <TextField
        ref = {ref}
        {...props}
        contentContainerProps={contentContainerProps}
        inputProps = {{...defaultObj(inputProps),style : [inputProps?.style,{pointerEvents:"none"}],readOnly:true}}
        type ="text"
        format = {undefined}
        onChange = {(e)=>false}
        onValidate = {(e)=>false}
    />
});

FilterBetweenComponent.displayName = "FilterBetweenComponent";
export default FilterBetweenComponent;