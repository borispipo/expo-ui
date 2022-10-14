import React from "$react";
import PropTypes from "prop-types";
import Label from "$ecomponents/Label";
import {defaultNumber,defaultStr} from "$utils";

export const getDefaultStep = (count)=>{
    count = Math.abs(parseInt(count)||0);
    return count <= 20 ? 1 : count <=  50 ? 3 : count <= 100 ? 10 : Math.floor(count/20);
}

const CountUpComponent = ({from,to,format,type,duration,step,formatter,interval,...props})=>{
    from = defaultNumber(from); 
    to = defaultNumber(to);
    duration = defaultNumber(duration,15);
    const isCurrency = defaultStr(format,type).toLowerCase() =="money"? true : false;
    formatter = typeof formatter ==="function"? formatter : current => current;
    const end = to - from;
    const isNegative = end < 0 ? true : false;
    const intervalRef = React.useRef(null);
    const increment = (isNegative ? (-1):(1))* Math.abs(defaultNumber(step,getDefaultStep(to)));
    const [current, setCurrent] = React.useState(from);
    const isMounted = React.useIsMounted();
    const formatValue = typeof formatter =="function"? formatter : (number)=>{
        return isCurrency ? number.formatMoney() : number.formatNumber();
    }
    React.useEffect(() => {
        clearInterval(intervalRef.current);
        if(!isMounted()) return;
        const finish = Math.abs(end);
        if(finish === 0){
            return;
        }
        intervalRef.current = setInterval(() => {
            if((isNegative && current <= to) || (current >= to)) {
                clearInterval(intervalRef.current);
                setCurrent(to);
                return;
            }
            setCurrent(current + increment);
        }, interval);
        return () => {
            clearInterval(intervalRef.current);
        };
    },[current]);
    return <Label 
        textBold 
        {...props}
    >{
        formatValue(current)    
    }</Label>
}

CountUpComponent.defaultProps = {
  from: 0,
  interval: 100,
  onComplete: () => {},
};

CountUpComponent.propTypes = {
    from : PropTypes.number,
    to : PropTypes.number.isRequired,
    /***(:number)=> (:string || : number)*/
    formatter : PropTypes.func,
    interval : PropTypes.number, //l'interval de mise à jour de la valeur courante
}

export default CountUpComponent;