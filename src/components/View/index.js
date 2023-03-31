import {View} from "react-native";
import PropTypes from "prop-types";
import React from "$react";
import {isMobileNative} from "$cplatform";
import {debounce,isNumber} from "$cutils";


const ViewComponent = React.forwardRef(({mediaQueryUpdateNativeProps,onRender,onLayoutTimeout,onLayout,autoHeight,autoWidth,elevation,...props},ref)=>{
    const style = React.useMediaQueryUpdateStyle(props);
    const autoSize = autoHeight||autoWidth ? true : false;
    const [state,setState] = autoSize ? React.useState({}) : [{}];
    const {width,height} = state;
    const onL = (e)=>{
        if(!e || !e.nativeEvent || !e.nativeEvent.layout) return;
        const h = e.nativeEvent.layout.height,w = e.nativeEvent.layout.width;
        if(onLayout && onLayout(e) === false) return;
        if(autoSize && typeof h =='number' && typeof w ==='number'){
            if(isObj(state)){
                if(autoWidth && typeof state.width == 'number' && Math.abs(state.width-w) < 50) return;
                if(autoHeight && typeof state.height =='number' && Math.abs(state.height-h) < 50) return;
            }
            setState({height:h,width:w});
        }
    };
    React.useOnRender(onRender);
    return <View
         {...props} 
         style = {[style,
            autoSize && [
                autoHeight && isNumber(height) && height > 10 && {height},
                autoWidth && isNumber(width) && width > 10 && {width}
            ]
         ]}
         onLayout = {isMobileNative()? onL : debounce(onL,typeof onLayoutTimeout =='number'? onLayoutTimeout : 100)}
         ref={typeof mediaQueryUpdateNativeProps =='function' ? React.useMediaQueryUpdateNativeProps(mediaQueryUpdateNativeProps,ref) : ref}
    />
});

export default ViewComponent;

ViewComponent.displayName = "ViewComponent";

ViewComponent.propTypes = {
    mediaQueryUpdateNativeProps : PropTypes.func,
    mediaQueryUpdateStyle : PropTypes.func,
    autoWidth : PropTypes.bool,//si la taille de la vue est calculée automatiquement
    autoHeight : PropTypes.bool,//si la taille de 
    onLayout : PropTypes.func,
    ///si useCurrentMedia est à true, alors la mise à jour sera opérée uniquement lorsque le current media change
}