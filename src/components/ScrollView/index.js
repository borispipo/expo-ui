import React from '$react';
import { ScrollView} from 'react-native';
import PropTypes from "prop-types";
import {defaultStr,defaultObj,defaultNumber} from "$utils";
import {Vertical as AutoSizeVertical} from "$ecomponents/AutoSizer";

const ScrollViewComponent = React.forwardRef(({autoSize,autoSizeProps,testID,...rest},ref) => {
  testID = defaultStr(testID,'RN_ScrollViewComponent');
  const autoSizeRef = React.useRef(autoSize);
    if(!autoSizeRef.current || rest.horizontal === true || rest.vertical === false){
      return <ScrollView testID={testID} ref={ref} {...rest}/>
  }
  autoSizeProps = defaultObj(autoSizeProps);
  return  <AutoSizeVertical {...autoSizeProps} testID={testID+"_ScrollViewContainer"}>
    <ScrollView 
      ref={ref} {...rest} 
      testID={testID}
    />
  </AutoSizeVertical>
});

ScrollViewComponent.displayName = "ScrollViewComponent";
export default ScrollViewComponent;

ScrollViewComponent.propTypes = {
   ...defaultObj(ScrollView.propTypes),
   autoSize : PropTypes.bool,//si la taille du scrollView sera autoSize
   maxHeight : PropTypes.number,
   minHeight : PropTypes.number,
}
