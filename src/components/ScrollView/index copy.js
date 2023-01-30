import React from '$react';
import { ScrollView,Dimensions,StyleSheet} from 'react-native';
import PropTypes from "prop-types";
import View from "$ecomponents/View";
import theme from "$theme";
import {defaultStr,defaultObj} from "$utils";
import APP from "$capp/instance";
import ActivityIndicator from "$ecomponents/ActivityIndicator";
const ScrollViewComponent = React.forwardRef(({virtualized,autoSize,vertical,horizontal,contentProps,containerProps,mediaQueryUpdateNativeProps,testID:customTestID,children:cChildren,screenIndent:sIndent,...rest},ref) => {
  const testID = defaultStr(customTestID,'RN_ScrollViewComponent');
  containerProps = defaultObj(containerProps)
  if(horizontal === true || vertical === false || autoSize !== true){
     return <ScrollView horizontal = {horizontal} vertical = {vertical} testID={testID} ref={ref} {...rest} children={cChildren}/>
  }
  const hasUpdateLayoutRef = React.useRef(false);
  const isKeyboardOpenRef = React.useRef(false);
  const layoutRef = React.useRef(null);
  const [layout,setLayout] = React.useState(Dimensions.get("window"));
  const {height} = layout;
  const hasInitializedRef = React.useRef(false);
  const children = React.useStableMemo(()=>cChildren,[cChildren]);
  const updateLayout = ()=>{
      return new Promise((resolve)=>{
          hasUpdateLayoutRef.current = true;
          if(layoutRef.current && layoutRef.current.measureInWindow){
              layoutRef.current.measureInWindow((x, y, width, height) => {
                  const r = {...Dimensions.get("window"),layout:{ x, y, width, height }};
                  setLayout(r);
                  hasInitializedRef.current = true;
                  resolve(r);
              });
          } else {
            setLayout(Dimensions.get("window"))
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
  const hasUpdateLayout = hasUpdateLayoutRef.current;
  const cStyle ={width:'100%',maxHeight:Math.max(height-100,250)};
  if(isObj(layout.layout) && typeof layout.layout.y =='number' && layout.layout.y>=10){
      const {layout : {x,y}} = layout;
      const minHeight = height - y;
      if(minHeight> 0){
          cStyle.minHeight = minHeight;
      }
  }
  const contentContainerStyle = ([cStyle,rest.contentContainerStyle]);
  const fStyle = !hasUpdateLayout && {flex:1};
  return  <View ref={layoutRef} onLayout={()=>{
    if(!hasInitializedRef.current){
       updateLayout();
    }
  }} {...containerProps} style={[theme.styles.w100,containerProps.style,fStyle]} testID={testID+"_ScrollViewContainer"}>
    <ScrollView 
      ref={ref} {...rest} 
      vertical = {vertical}
      testID={testID}
      children={hasUpdateLayoutRef.current?children : <ActivityIndicator size={'large'} 
      style={[{flex:1},hasUpdateLayout && rest.style]}/>}
      contentContainerStyle = {[contentContainerStyle,fStyle]}
    />
  </View>
});

ScrollViewComponent.displayName = "ScrollViewComponent";
export default ScrollViewComponent;

ScrollViewComponent.propTypes = {
   ...defaultObj(ScrollView.propTypes),
   horizontal : PropTypes.bool,
   vertical : PropTypes.bool,
   autoSize : PropTypes.bool,//si la taille du scrollView sera autoSize
    virtualized : PropTypes.bool,
    contentProps : PropTypes.object,
}
