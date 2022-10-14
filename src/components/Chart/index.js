import FileSystem from "$file-system";
import ApexCharts from 'apexcharts'
import ReactApexChart from 'react-apexcharts';
import React from "$react";
import {defaultStr,uniqid,defaultObj} from "$utils";
import View from "$components/View";


export const ChartComponent = React.forwardRef(({options,data,containerProps,containerId,...props},ref)=>{
    const elementIdRef = React.useRef(defaultStr(containerId,uniqid("chart-container-id")))
    const elementId = elementIdRef.current;
    const containerRef = React.useRef(null);
    const cId = elementId+"-container";
    containerProps = defaultObj(containerProps);
    return <View autoHeight  ref={containerRef} testID="RNComponentCharContainerTestID" {...containerProps} style={[{flex:1,paddingBottom:10},containerProps.style]} >
        <ReactApexChart height={300} data={data} {...props} {...options} options={options}/>
    </View>
});

ChartComponent.displayName = "ChartComponent";

export default ChartComponent;