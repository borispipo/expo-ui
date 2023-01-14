import React from '$react';
import { ScrollView,Dimensions } from 'react-native';
import PropTypes from "prop-types";
import View from "$ecomponents/View";
import theme from "$theme";
import {defaultStr,defaultObj} from "$utils";
import APP from "$capp/instance";
const ScrollViewComponent = React.forwardRef(({virtualized,contentProps,containerProps,mediaQueryUpdateNativeProps,testID:customTestID,children,screenIndent:sIndent,...rest},ref) => {
  const isKeyboardOpenRef = React.useRef(false);
  const testID = defaultStr(customTestID,'RN_ScrollViewComponent');
  containerProps = defaultObj(containerProps)
  const [layout,setLayout] = React.useState(Dimensions.get("window"));
  const {height} = layout;
  React.useEffect(()=>{
    const onKeyboardToggle = ({visible})=>{
      isKeyboardOpenRef.current = visible;
     };
    const onResizePage = ()=>{
      setTimeout(()=>{
         //if(isKeyboardOpenRef.current) return;
         setLayout(Dimensions.get("window"))
      },300);
    }
    APP.on(APP.EVENTS.RESIZE_PAGE,onResizePage);
    APP.on(APP.EVENTS.KEYBOARD_DID_TOGGLE,onKeyboardToggle)
    return ()=>{
      APP.off(APP.EVENTS.RESIZE_PAGE,onResizePage);
      APP.off(APP.EVENTS.KEYBOARD_DID_TOGGLE,onKeyboardToggle);
    }
  },[]);
  const contentContainerStyle = [{maxHeight:Math.max(height-100,250),width:'100%'},rest.contentContainerStyle];
  return  <View {...containerProps} style={[theme.styles.w100,containerProps.style]} testID={testID+"_ScrollViewContainer"}>
    <ScrollView 
      ref={ref} {...rest} 
      testID={testID}
      children={children}
      contentContainerStyle = {contentContainerStyle}
    />
  </View>
});

ScrollViewComponent.displayName = "ScrollViewComponent";
export default ScrollViewComponent;

ScrollViewComponent.propTypes = {
    virtualized : PropTypes.bool,
    contentProps : PropTypes.object,
}
