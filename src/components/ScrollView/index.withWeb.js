import React from '$react';
import { ScrollView,Dimensions } from 'react-native';
import PropTypes from "prop-types";
import View from "$ecomponents/View";
import theme from "$theme";
import {defaultStr,defaultObj} from "$utils";
import APP from "$capp/instance";
import {isWeb as isw} from "$cplatform";
const ScrollViewComponent = React.forwardRef(({containerProps,withAutoSizer,testID,...rest},ref) => {
  testID = defaultStr(testID,'RN_ScrollViewComponent');
  const autoSize = React.useRef(withAutoSizer).current;
    if(!autoSize || rest.horizontal === true || rest.vertical === false){
      return <ScrollView testID={testID} ref={ref} {...rest}/>
  }
  containerProps = defaultObj(containerProps)
  const isWeb = isw();
  const isKeyboardOpenRef = React.useRef(false);
  const layoutRef = React.useRef(null);
  const [layout,setLayout] = React.useState(Dimensions.get("window"));
  const {height} = layout;
  const hasInitializedRef = React.useRef(false);
  const children = React.useStableMemo(()=>rest.children,[rest.children]);
  const updateLayout = ()=>{
      return new Promise((resolve)=>{
          if(layoutRef.current && layoutRef.current.measureInWindow){
              layoutRef.current.measureInWindow((x, y, width, height) => {
                  const r = {...Dimensions.get("window"),layout:{ x, y, width, height }};
                  setLayout(r);
                  hasInitializedRef.current = true;
                  resolve(r);
              });
          }
      })
  }
  React.useEffect(()=>{
    const onKeyboardToggle = ({visible})=>{
      isKeyboardOpenRef.current = visible;
     };
    const onResizePage = ()=>{
      setTimeout(()=>{
         if(isKeyboardOpenRef.current) return;
         updateLayout();
      },300);
    }
    APP.on(APP.EVENTS.RESIZE_PAGE,onResizePage);
    APP.on(APP.EVENTS.KEYBOARD_DID_TOGGLE,onKeyboardToggle)
    return ()=>{
      APP.off(APP.EVENTS.RESIZE_PAGE,onResizePage);
      APP.off(APP.EVENTS.KEYBOARD_DID_TOGGLE,onKeyboardToggle);
    }
  },[]);

  const cStyle = {maxHeight:Math.max(height-100,250),width:'100%'};
  if(isObj(layout.layout) && typeof layout.layout.y =='number' && layout.layout.y>=10){
      const {layout : {x,y}} = layout;
      const minHeight = height - y;
      if(minHeight> 0){
          cStyle.minHeight = minHeight;
      }
  }
  const contentContainerStyle = [cStyle,rest.contentContainerStyle];
  return  <View ref={layoutRef} onLayout={()=>{
    if(!hasInitializedRef.current){
       updateLayout();
    }
  }} {...containerProps} style={[theme.styles.w100,containerProps.style]} testID={testID+"_ScrollViewContainer"}>
    <ScrollView 
      ref={ref}
      {...rest} 
      testID={testID}
      children={children}
      contentContainerStyle = {contentContainerStyle}
    />
  </View>
});

ScrollViewComponent.displayName = "ScrollViewComponent";
export default ScrollViewComponent;

ScrollViewComponent.propTypes = {
   ...defaultObj(ScrollView.propTypes),
   withAutoSizer : PropTypes.bool,
}
