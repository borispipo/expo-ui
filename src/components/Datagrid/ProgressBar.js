// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import React from "$react";
import {defaultBool} from "$cutils";

const DatagridProgressBar = React.forwardRef(({datagridContext,children},ref)=>{
    const [isLoading,_setIsLoading] = React.useState(defaultBool(datagridContext?.props?.isLoading));
    const isMounted = React.useIsMounted();
    const setIsLoading = (nLoading)=>{
        if(!isMounted() || typeof nLoading == isLoading) return;
        _setIsLoading(nLoading);
    }
    React.useEffect(()=>{
        if(datagridContext?.on){
            const onToggleLoading = ({isLoading:newIsLoading})=>{
                setIsLoading(newIsLoading);
            }
            datagridContext.on("toggleIsLoading",onToggleLoading);
            return ()=>{
                datagridContext?.off("toggleIsLoading",onToggleLoading);
            }
        }
    },[datagridContext])
    return !isLoading || !React.isValidElement(children) ? null : children;
});

DatagridProgressBar.displayName ="DatagridProgressBar";

export default DatagridProgressBar;