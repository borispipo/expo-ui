// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Date from "./DatePickerInput";
import Time from "./Time";
import React from "$react";
import PropTypes from "prop-types";
import {defaultObj} from "$utils";

export default function DateTimePickerComponent({left,right,dateProps,timeProps,defaultValue,...porps}){
    dateProps = defaultObj(dateProps);
    timeProps = defaultObj(timeProps);
    return <Date
        defaultValue = {defaultValue}
        {...dateProps}
        calendarIconBefore = {true}
        left = {left}
        right = {(p)=>{
            const r = typeof right =='function'? right(p): React.isValidElement(right)? right : null;
            return <>
                <Time 
                    defaultValue = {defaultValue}
                    {...timeProps}
                />
                {r}
            </>
        }}
    />
}

DateTimePickerComponent.propTypes = {
    dateProps : PropTypes.object,
    timeProps : PropTypes.object,
}