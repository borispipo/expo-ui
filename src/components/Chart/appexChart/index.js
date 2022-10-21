import ApexChart from 'apexcharts/dist/apexcharts.common';
import React from "$react";
import View from "$components/View"

const AppexChartComponent = React.forwardRef(({chartContext,options,...props},ref)=>{
    const chartRef = React.useRef(null);
    React.useEffect(()=>{
      chartContext.current = new ApexChart(chartRef.current,options)
      chartContext.current.render();
      return ()=>{
        if (chartContext.current && typeof chartContext.current.destroy === 'function') {
          setTimeout(()=>{
            try {chartContext.current.destroy();} catch{}
          },500);
        }
      }
    },[]);
    return <View
      {...props}
      ref = {React.mergeRefs(chartRef,ref)}
    />
});

AppexChartComponent.displayName = "AppexChartComponent";

export default AppexChartComponent;