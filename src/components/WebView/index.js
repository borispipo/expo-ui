// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import WebView from "./Component";
import {defaultStr} from "$cutils";
import React from "$react";
import PropTypes from "prop-types";
import {isValidUrl} from "$cutils/uri";
import FileSystem from "$file-system";

const  WebViewComponent = React.forwardRef(({children,source,style,testID,...props},ref)=>{
    testID = defaultStr(testID,"RN_WebviewComponent");
    return <WebView  
        ref={ref}
         {...props} 
        testID = {testID} 
        style={[{backgroundColor:'transparent'},style]}
        source = {defaultObj(source)}
    >
        {children}
    </WebView>
});
WebViewComponent.displayName ="WebViewComponent";

WebViewComponent.propTypes = {
    ///localhtml doit être chargé en utilisant require où import : exemple : require("../assets/musicsheetview/index.html")
    ///si la webview devra charger un fichier html local, alors la valeur localHtm comporte une valeur
    source : PropTypes.object,
}

WebViewComponent.LocalHtml = React.forwardRef(({file,source,...props},ref)=>{
    const prevLocalHtml = React.usePrevious(file);
    const isInitializedRef = React.useRef(false);
    const [html, setHtml] = React.useState("");
    React.useEffect(()=>{
        if(isInitializedRef.current && prevLocalHtml == file) return;
        isInitializedRef.current = true;
        FileSystem.readFile(file).then((data)=>{
            setHtml(data);
        });
    },file)
    return <WebViewComponent
        ref = {ref}
        source={{...defaultObj(source),html}}
    />
});

WebViewComponent.LocalHtml.displayName = "WebViewComponent.LocalHtml";
WebViewComponent.LocalHtml.propTypes = {
    ...WebViewComponent.propTypes,
    file : PropTypes.any.isRequired,
}
WebViewComponent.Local = WebViewComponent.LocalHtml;

WebViewComponent.Url = React.forwardRef(({url,source,...props},ref)=>{
    const isU = isValidUrl(url);
    return <WebViewComponent
        ref = {ref}
        {...props}
        source = {{...defaultObj(source),url:isU?url:undefined}}
    />
});
WebViewComponent.Url.displayName = "WebViewComponent.Url";
WebViewComponent.Url.propTypes = {
    ...WebViewComponent.propTypes,
    url : PropTypes.string.isRequired,
}

WebViewComponent.Html = React.forwardRef(({html,source,...props},ref)=>{
    return <WebViewComponent
        ref = {ref}
        {...props}
        source = {{...defaultObj(source),html}}
    />
});
WebViewComponent.Html.displayName = "WebViewComponent.Html";
WebViewComponent.Html.propTypes = {
    ...WebViewComponent.propTypes,
    html : PropTypes.string.isRequired,
}

export default WebViewComponent;

export * from "react-native-webview";