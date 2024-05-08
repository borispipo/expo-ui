// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import React from "$react";
import {defaultStr} from "$cutils";
import SimpleSelect from "$ecomponents/SimpleSelect";
import {currencies} from "$ccurrency";
import appConfig from "$capp/config";
import Format from "./Format";

const CurrencySelector = React.forwardRef((props,ref)=>{
    return <SimpleSelect ref={ref} {...selectCurrencyFieldProps(props)}/>
});

export {Format};
CurrencySelector.displayName = "CurrencySelector";
CurrencySelector.Format = Format;

export default CurrencySelector;

export const selectCurrencyFieldProps = ({disabled,readOnly,isFilter,...props})=>{
    const isEditable = disabled !== true && readOnly !== true;
    const currency = appConfig.currency;
    return {
        items : currencies,
        getItemValue : ({item})=>item.code,
        renderItem : ({item}) => "["+item.code+"] " +item.name,
        showAdd : false,
        defaultValue : defaultStr(currency.code),
        enableCopy : false,
        ...props,
        isFilter,
        disabled : !isEditable,
        readOnly : readOnly || !isEditable,
        type : 'select',
    }
}

CurrencySelector.propTypes = {
    ...SimpleSelect.propTypes,
}