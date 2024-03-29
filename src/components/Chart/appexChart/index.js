import ApexChart from 'apexcharts/dist/apexcharts.min';
import React from "$react";
import View from "$ecomponents/View";
import { destroyChart } from './utils';
import theme from "$theme";

const AppexChartComponent = React.forwardRef(({chartContext,style,options,...props},ref)=>{
    const viewRef = React.useRef(null);
    React.useEffect(()=>{
      chartContext.current = new ApexChart(viewRef.current,options)
      try {
        chartContext.current.render();
      } catch(e){
        console.log(e," rendering chartt with options ",options);
      }
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