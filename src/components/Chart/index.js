import React from '$react'
import PropTypes from 'prop-types'
import {defaultStr,defaultObj,uniqid,defaultNumber} from "$utils";
import {extend} from "./utils"
import stableHash from 'stable-hash';
import Chart from "./appexChart";

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
const ChartComponent = React.forwardRef(({type, height,chartId, width, series, options,testID,webViewProps, ...props },ref)=>{
  const chartContext = React.useRef(null);
  options = defaultObj(options);
  const chartIdRef = React.useRef(defaultStr(chartId,options.chart?.id,uniqid("chart-id")));
  const config = extend(options,{
    chart: {
      type,
      height,
      width,
      id : chartIdRef.current
    },
    series,
  });
  config.chart.id = chartIdRef.current;
  testID = defaultStr(testID,"RN_ChartComponent");
  const prevWidth = React.usePrevious(width), prevHeight = React.usePrevious(height);
  const prevOptions = React.usePrevious(options,JSON.stringify);
  const prevSeries = React.usePrevious(series,JSON.stringify);
  /***change size chart, @see : https://apexcharts.com/docs/chart-types/line-chart/ */
  options.xaxis = defaultObj(options.xaxis);
  options.xaxis.stroke = defaultObj(options.xaxis.stroke);
  options.xaxis.stroke.width = defaultNumber(options.xaxis.stroke.width,2);
  options.xaxis.stroke.height = defaultNumber(options.xaxis.height,1);

  React.useEffect(()=>{
    if(chartContext.current && chartContext.current.updateOptions){
        if((prevSeries == series) || width != prevWidth || height != prevHeight){
            chartContext.current.updateOptions(config);
        } else if(prevOptions != options){
            chartContext.current.updateSeries(series);
        } 
    }
  },[stableHash({type,options,series,width,height})])
  return <Chart {...props} options={config} chartId={chartIdRef.current} chartContext={chartContext} testID={testID} ref={ref}/>
});


ChartComponent.propTypes = {
  type: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  height: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  series: PropTypes.array.isRequired,
  options: PropTypes.shape({
    xaxis : PropTypes.object,
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