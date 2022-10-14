import FileSystem from "$file-system";
import appexChartCode from "./appexchart.3.5.js.text";
import React from "$react";
import WebView from "$ecomponents/WebView";
import HTMLView from '$ecomponents/Html/View';
import {defaultStr,uniqid} from "$utils";
import View from "$ecomponents/View";

let appexchartJSString = null;



export const ChartComponent = React.forwardRef(({options,containerId,...props},ref)=>{
    const containerIdRef = React.useRef(defaultStr(containerId,uniqid("chart-container-id")))
    const appexChartJS = appexchartJSString? (appexchartJSString+"\n"):"";
    const optsJSON = JSON.stringify(options);
    const elementId = containerIdRef.current;
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <script type='text/javascript'>
            ${appexChartJS}
        </script>
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1"
        />
            <body>
                <div id="${elementId}"/>
                <script type='text/javascript'>
                    const options = ${optsJSON};
                    var element = document.getElementById("#${elementId}");
                    if(!element){
                        element = document.createElement("div");
                        document.body.appendChild(element);    
                    }
                    element.id = "${elementId}";
                    const chart = new ApexCharts(element, options);
                    chart.render();
                </script>
            </body>
        </html>
    `;
    return <View style={{flex:1}}>
        <WebView.Html
            html = {htmlContent}
        >
        </WebView.Html>
    </View>
});

ChartComponent.displayName = "ChartComponent";


FileSystem.readFile(appexChartCode).then(code=>{
    appexchartJSString = code;
});

export default ChartComponent;