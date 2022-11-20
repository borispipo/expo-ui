// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Date from "./DatePickerInput";
import Time from "./Time";
import React from "$react";
import PropTypes from "prop-types";
import {defaultObj,isNumber,defaultNumber,defaultStr,defaultBool,isNonNullString} from "$utils";
import theme,{flattenStyle} from "$theme";
import DateLib from "$date";
import { toDateObj } from "./utils";

export default function DateTimePickerComponent({left,withSeconds,right,format,dateFormat,timeFormat,defaultValue,onChange,testID,dateProps,disabled,readOnly,timeProps,...rest}){
    dateProps = defaultObj(dateProps);
    timeProps = defaultObj(timeProps);
    testID = defaultStr(testID,"RN_DateTimeComponent")
    const anchorTimeProps = defaultObj(timeProps.anchorProps);
    const timePropsContainerProps = defaultObj(timeProps.containerProps);
    const defaultValueRef = React.useRef(toDateObj(defaultValue,format));
    const dateObj = defaultValueRef.current;
    if(isNonNullString(format)){
        format = format.trim().split(" ");
        if(!isNonNullString(dateFormat)){
            dateFormat = format[0].trim();
        }
        if(!isNonNullString(timeFormat) && format[1]){
            timeFormat = format[1].trim();
        }
    }
    const changeDateArgsRef = React.useRef({});
    const changedTimeArgsRef = React.useRef({});
    withSeconds = defaultBool(timeProps.withSeconds,withSeconds,true);
    const maxWidth = 120;//withSeconds ? 120 : 120;
    const callOnChange = ()=>{
        if(onChange){
            const dObj = changeDateArgsRef.current;
            const tObj = changedTimeArgsRef.current;
            if(!DateLib.isValid(dObj.date) || !isNumber(tObj.hours) || !isNumber(tObj.minutes)) return;
            const date = dObj.date;
            date.setHours(tObj.hours);
            date.setMinutes(tObj.minutes);
            date.setSeconds(defaultNumber(tObj.seconds))
            const sqlTime = date.toSQLTimeFormat();
            const time = sqlTime.substring(0,withSeconds ?sqlTime.length :5);
            const value = date.toFormat(defaultStr(dateFormat,DateLib.SQLDateFormat))+" "+time;
            const args = {...dObj,...tObj,dateObject:date,date,sqlDateTime:date.toSQLDateTimeFormat(),value,sqlTime,time};
            onChange(args);
        }
    }
    return <Date
        defaultValue = {dateObj}
        disabled = {disabled}
        readOnly = {readOnly}
        testID = {testID}
        {...rest}
        format = {dateFormat}
        {...dateProps}
        style = {[rest.style,dateProps.style]}
        calendarIconBefore = {true}
        onChange = {(args)=>{
            changeDateArgsRef.current = args;
            callOnChange();
        }}
        left = {left}
        right = {(p)=>{
            const r = typeof right =='function'? right(p): React.isValidElement(right)? right : null;
            return <>
                <Time 
                    defaultValue = {dateObj}
                    disabled = {disabled}
                    readOnly = {readOnly}       
                    testID={testID+"_Time"}    
                    format = {timeFormat}
                    {...timeProps}
                    onChange = {(args)=>{
                        changedTimeArgsRef.current = args;
                        callOnChange();
                    }}
                    withLabel = {false}
                    mode = {"flat"}
                    containerProps = {{...timePropsContainerProps,style:[{maxWidth},timePropsContainerProps.style]}}
                    divider = {false}
                    anchorProps = {{
                        ...anchorTimeProps,
                        testID:testID+"_TimeAnchor",
                        style : [theme.styles.noPadding,{borderRadius:0},theme.styles.noMargin,anchorTimeProps.style]
                    }}
                    inputProps = {{
                        ...defaultObj(timeProps.inputProps),
                        mode : "flat",
                    }}
                />
                {r}
            </>
        }}
    />
}

DateTimePickerComponent.propTypes = {
    ...Date.propTypes,
    dateProps : PropTypes.object,
    timeProps : PropTypes.object,
    dateFormat : PropTypes.string, //Le format de date
    timeFormat : PropTypes.string, //le format de time
    defaultValue : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ])
}