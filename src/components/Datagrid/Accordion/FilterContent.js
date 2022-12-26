// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import React from "$react";
import Filter from "$ecomponents/Filter";

export default function FilterAccordionComponent({onChange,...props}){
    const valuesRefs = React.useRef({});
    console.log("rendering ",valuesRefs);
    return  <Filter
        {...props}
        {...valuesRefs.current}
        onChange = {(args)=>{
            ["action","operator","defaultValue","ignoreCase","manualRun"].map((k)=>{
                valuesRefs.current[k] = args[k];
            })
            console.log(valuesRefs," is changeddd");
            if(onChange){
                onChange(args);
            }
        }}
    />
}