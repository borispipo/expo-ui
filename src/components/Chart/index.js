import React from '$react'
import PropTypes from 'prop-types'
import {defaultStr,defaultVal,extendObj,defaultObj,uniqid,defaultNumber} from "$utils";
import stableHash from 'stable-hash';
import Chart from "./appexChart";

export * from "./utils";

/**** pour le rendu webview chart, voir : https://github.com/flexmonster/react-native-flexmonster/blob/master/src/index.js */
/**** le composant Chart s'appuie sur le composant appexChart : https://apexcharts.com/ 
 * pour le formattage des date, voir : https://apexcharts.com/docs/datetime/
 * les props requis duduit composant sont : 
 *  type {string}, le type de chart
 *  series {array} - //les series appexchart 
 *  width {number} - la largeur du chart
 *  height {number} - la longueur du chart
 *  options {number} - les options supplémentaires au chart
 * 
*/
const ChartComponent = React.forwardRef(({options:customOptions,height,width,chartId,testID,webViewProps, ...props },ref)=>{
  const chartContext = React.useRef(null);
  const {series,xaxis:customXaxis,...options} = customOptions;
  const xaxis = defaultObj(customXaxis);
  options.chart = defaultObj(options.chart);
  const chartIdRef = React.useRef(defaultStr(chartId,options.chart.id,uniqid("chart-id")));
  width = options.chart.width = defaultVal(options.chart.width,width);
  height = options.chart.height = defaultVal(options.chart.height,height)
  options.chart.id = chartIdRef.current;
  testID = defaultStr(testID,"RN_ChartComponent");
  options.xaxis = xaxis;
  options.series = series;
  React.useEffect(()=>{
    if(chartContext.current && chartContext.current.updateOptions){
        chartContext.current.updateOptions(options);
    }
  },[stableHash(options)])
  return <Chart {...props} options={options} chartId={chartIdRef.current} chartContext={chartContext} testID={testID} ref={ref}/>
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