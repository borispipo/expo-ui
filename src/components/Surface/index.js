import Elevations from './Elevations'
import React from "$react";
import theme from "$theme";
import View from "$components/View";
import PropTypes from "prop-types";

const SurfaceComponent = React.forwardRef((props,ref)=>{
    const {style,elevation,...rest} = props;
    return <View testID={'RN_SurfaceComponent'} {...rest} ref={ref} style={[{backgroundColor:theme.colors.surface},style,elevation && typeof elevation =='number' && Elevations[elevation] ? Elevations[elevation]: null]}/>
}); 

SurfaceComponent.displayName = "SurfaceComponent";

export default theme.withStyles(SurfaceComponent,{
    mode : 'contained',
})

SurfaceComponent.propTypes = {
    elevation : PropTypes.number, //number beetween 0 to 24.
}

export {Elevations,Elevations as elevations};