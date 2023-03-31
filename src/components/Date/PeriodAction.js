// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import React from "$react";
import TextField from "$components/TextField";
import {isNonNullString} from "$cutils";
import DateLib from "$date";

const PeriodActionComponent = React.forwardRef(({defaultValue,label,isDateTime,...props},ref)=>{
    if(isNonNullString(label)){
        label+=" [Période]";
    }
    const datePeriod= DateLib.formatPeriod(defaultValue,isDateTime);
    if(datePeriod){
        defaultValue = datePeriod;
    }
    return <TextField
        {...props}
        label = {label}
        onChange = {undefined}
        ref = {ref}
        defaultValue = {defaultValue}
    />
});

PeriodActionComponent.displayName = "PeriodActionComponent";
PeriodActionComponent.propTypes = {
    ...TextField.propTypes
}

export default PeriodActionComponent;