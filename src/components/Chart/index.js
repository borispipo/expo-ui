import React from '$react'
import PropTypes from 'prop-types'
import {defaultStr,defaultVal,defaultObj,uniqid} from "$cutils";
import Chart from "./appexChart";
import theme from "$theme";
import { destroyChart } from './appexChart/utils';

export * from "./utils";

/**** pour le rendu webview chart, voir : https://github.com/flexmonster/react-native-flexmonster/blob/master/src/index.js */
/**** le composant Chart s'appuie sur le composant appexChart : https://apexcharts.com/ 
 * pour le formattage des date, voir : https://apexcharts.com/docs/datetime/
 * @see : https://apexcharts.com/docs/methods/
 * les props requis duduit composant sont : 
 *  type {string}, le type de chart
 *  series {array} - //les series appexchart 
 *  width {number} - la largeur du chart
 *  height {number} - la longueur du chart
 *  options {number} - les options supplémentaires au chart
 * 
*/
const ChartComponent = React.forwardRef(({options,onRender,style,height,width,chartId:customChartID,testID,webViewProps, ...props },ref)=>{
  const chartContext = React.useRef(null);
  options.chart = defaultObj(options.chart);
  const chartIdRef = React.useRef(options.chart.id,customChartID,uniqid("chart-id"));
  const chartId = chartIdRef.current;
  options.chart.width = defaultVal(options.chart.width,width);
  options.chart.height = defaultVal(options.chart.height,height,350)
  options.chart.id = chartId;
  testID = defaultStr(testID,"RN_ChartComponent");
  React.useEffect(()=>{
    if(chartContext.current){
      if(chartContext.current.updateOptions){
        chartContext.current.updateOptions(options);
      }
    }
  },[(options)]);
  React.useOnRender(onRender,Math.max(options.series.length/20,500));
  React.useEffect(()=>{
      return ()=>{
        destroyChart(chartContext.current);
      }
  },[])
  if(theme.isDark()){
     options.tooltip = defaultObj(options.tooltip);
     options.tooltip.theme = 'dark';
  }
  return <Chart {...props} ref={ref} chartId={chartId} style={[options.chart.height && {minHeight:options.chart.height},options.chart.width && {minWidth:options.chart.width},theme.styles.p1,style]} options={options} chartContext={chartContext} testID={testID}/>
});


ChartComponent.propTypes = {
  width: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  height: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  options: PropTypes.shape({
    chart : PropTypes.shape({
      type: PropTypes.string,
    }),
    xaxis : PropTypes.object,
    yaxis : PropTypes.object,
    series: PropTypes.array.isRequired,
  }).isRequired,
  ///lorsque le chart est rendu en environnement native, les props du webView
  webViewProps : PropTypes.object,
}

ChartComponent.defaultProps = {
  type: 'line',
  width: '100%',
  height: 'auto'
}

ChartComponent.displayName = "ChartComponent";

export default ChartComponent;