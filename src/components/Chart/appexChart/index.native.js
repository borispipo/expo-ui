const htmlTemplate = require("./index.html");
import React from "$react";
import WebView from "$ecomponents/WebView";
import {defaultStr,defaultObj,uniqid} from "$utils";
import View from "$ecomponents/View";

export const ChartComponent = React.forwardRef(({chartContext,testID,webViewProps,options,...props},ref)=>{
    webViewProps = defaultObj(webViewProps);
    const webViewRef = React.useRef(null);
    const chartId = React.useRef(uniqid("chart-webview-id"));
    const jsonOptions = JSON.stringify(options);
    const exec = (method,a)=>{
        if(!webViewRef.current) return;
        webViewRef.current.injectJavaScript(`
            const method = "${method}";
            const chartId = "${chartId}";
            const a = ${typeof a =='string'? '"'+a.replaceAll('"','\"')+'"':typeof a =='boolean'? a : a && typeof a =='object'? JSON.stringify(a):undefined};
            let element = document.getElementById(chartId);
            if(!element){
                element = document.createElement("div");
                document.body.appendChild(element);
            }
            element.id = chartId;
            if(!window.chartInstance || typeof window.chartInstance!='object') {
                window.chartInstance = new ApexChart(element,${jsonOptions});
            }
            if(!window.chartInstance || typeof chartInstance[method] !='function') return;
            try {
                chartInstance[method](a);
            } catch{}
        `);
    };
    testID = defaultStr(testID,"RN_AppexChartComponentNative");
    chartContext.current = React.useRef({});
    chartContext.current.exec = exec;
    ["updateOptions","updateSeries","destroy"].map((cb)=>{
        chartContext.current[cb]=(a,b,c)=>{
           return exec(cb,a,b,c);
        }
    });

    return <View ref={ref} {...props} testID={testID} style={[{flex:1},props.style]}>
        <WebView.Local
            originWhitelist={["*"]}
            testID = {testID+"_WebView"}
            {...webViewProps}
            file = {htmlTemplate}
            ref = {webViewRef}
            onLoadEnd={(event) => {
                exec();
                if(typeof webViewProps.onLoadEnd =='function'){
                    webViewProps.onLoadEnd({event,webViewRef,chartContext});
                }
            }}
        >
        </WebView.Local>
    </View>
});

ChartComponent.displayName = "ChartComponent.Native";

export default ChartComponent;