import React from '$react';
import { ScrollView} from 'react-native';
import PropTypes from "prop-types";
import {defaultStr,defaultObj} from "$cutils";
import {Vertical as AutoSizeVertical} from "$ecomponents/AutoSizer";

const ScrollViewComponent = React.forwardRef(({withAutoSizer,autoSizerProps,testID,...rest},ref) => {
  testID = defaultStr(testID,'RN_ScrollViewComponent');
  const autoSize = React.useRef(withAutoSizer).current;
    if(!autoSize || rest.horizontal === true || rest.vertical === false){
      return <ScrollView testID={testID} ref={ref} {...rest}/>
  }
  autoSizerProps = defaultObj(autoSizerProps);
  const autoSizeRef = React.useRef(null);
  return  <AutoSizeVertical {...autoSizerProps} ref = {autoSizeRef} testID={testID+"_ScrollViewContainer"}>
    <ScrollView 
      ref={ref} 
      {...rest} 
      testID={testID}
      onContentSizeChange = {(a,b,c,d)=>{
        if(rest.onContentSizeChange && rest.onContentSizeChange(a,b,c,d)===false) return;
         if(autoSizeRef.current && autoSizeRef.current.updateLayout){
           return autoSizeRef.current.updateLayout();
         }
      }}
    />
  </AutoSizeVertical>
});

ScrollViewComponent.displayName = "ScrollViewComponent";
export default ScrollViewComponent;

ScrollViewComponent.propTypes = {
   ...defaultObj(ScrollView.propTypes),
   withAutoSizer : PropTypes.bool,//si le contenu du scrollView sera wrap par le composant AutoSizer
   maxHeight : PropTypes.number,
   minHeight : PropTypes.number,
}
