// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import React from "$react";
import {defaultBool} from "$utils";

const DatagridProgressBar = React.forwardRef(({isLoading:customIsLoading,children},ref)=>{
    const [isLoading,_setIsLoading] = React.useState(defaultBool(customIsLoading));
    const isMounted = React.useIsMounted();
    const loadingCbRef = React.useRef(null);
    const cb = loadingCbRef.current;
    loadingCbRef.current = null;
    const setIsLoading = (loading)=>{
        if(!isMounted()) return;
        _setIsLoading(loading);
    }
    React.setRef(ref,{
        setIsLoading : (loading,cb)=>{
            if(!isMounted()){
                if(typeof cb =='function'){
                    return cb({});
                }
                return;
            }
            if(typeof loading =='boolean' && loading != isLoading){
                setIsLoading(loading);
            } else if(typeof cb =='function'){
                cb({isLoading});
            }
        }
    });
    React.useEffect(()=>{
        if(typeof customIsLoading =='boolean' && customIsLoading != isLoading){
            setIsLoading(customIsLoading);
        }
    },[customIsLoading])
    React.useEffect(()=>{
        if(typeof cb =='function'){
            cb({isLoading});
        }
        loadingCbRef.current = null;
    },[isLoading])
    return !isLoading || !React.isValidElement(children) ? null : children;
});

DatagridProgressBar.displayName ="DatagridProgressBar";

export default DatagridProgressBar;