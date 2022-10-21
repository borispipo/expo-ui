import React from '$react'
import PropTypes from 'prop-types'
import {defaultStr} from "$utils";
import {extend} from "./utils"
import stableHash from 'stable-hash';
import Chart from "./appexChart";

/**** le composant Chart s'appuie sur le composant appexChart : https://apexcharts.com/ 
 * les props requis duduit composant sont : 
 *  type {string}, le type de chart
 *  series {array} - //les series appexchart 
 *  width {number} - la largeur du chart
 *  height {number} - la longueur du chart
 *  options {number} - les options supplémentaires au chart
 * 
*/
const ChartComponent = React.forwardRef(({type, height, width, series, options,testID,webViewProps, ...props },ref)=>{
  const chartContext = React.useRef(null);
  const config = extend(options,{
    chart: {
      type,
      height,
      width
    },
    series,
  });
  testID = defaultStr(testID,"RN_ChartComponent");
  const prevWidth = React.usePrevious(width), prevHeight = React.usePrevious(height);
  const prevOptions = React.usePrevious(options,stableHash);
  const prevSeries = React.usePrevious(series,JSON.stringify);
  React.useEffect(()=>{
    if(chartContext.current && chartContext.current.updateOptions){
        if((JSON.stringify(prevSeries) == JSON.stringify(series)) || width != prevWidth || height != prevHeight){
            chartContext.current.updateOptions(config);
        } else if(JSON.stringify(prevOptions) != JSON.stringify(options)){
            chartContext.current.updateSeries(series);
        } 
    }
  },[stableHash({type,options,series,width,height})])
  return <Chart {...props} options={config} chartContext={chartContext} testID={testID} ref={ref}/>
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