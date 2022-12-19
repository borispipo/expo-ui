import ApexChart from 'apexcharts/dist/apexcharts.common';
import React from "$react";
import View from "$components/View";
import { destroyChart } from './utils';
import theme from "$theme";

const AppexChartComponent = React.forwardRef(({chartContext,style,options,...props},ref)=>{
    const viewRef = React.useRef(null);
    React.useEffect(()=>{
      chartContext.current = new ApexChart(viewRef.current,options)
      chartContext.current.render();
      React.setRef(ref,chartContext.current)
      return ()=>{
        React.setRef(ref,chartContext.current)
        destroyChart(chartContext.current);
      }
    },[]);
    return <View
      {...props}
      style = {[theme.styles.pb1,style]}
      ref = {viewRef}
    />
});

AppexChartComponent.displayName = "AppexChartComponent";

export default AppexChartComponent;