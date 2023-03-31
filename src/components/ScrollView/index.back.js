import React from '$react';
import { ScrollView,Dimensions} from 'react-native';
import PropTypes from "prop-types";
import View from "$ecomponents/View";
import theme from "$theme";
import {defaultStr,defaultObj,defaultNumber} from "$cutils";
import APP from "$capp/instance";
import ActivityIndicator from "$ecomponents/ActivityIndicator";
const ScrollViewComponent = React.forwardRef(({withAutoSizer,containerProps,maxHeight,minHeight,testID:customTestID,children:cChildren,...rest},ref) => {
  const testID = defaultStr(customTestID,'RN_ScrollViewComponent');
  const autoSizeRef = React.useRef(withAutoSizer);
    if(!autoSizeRef.current || rest.horizontal === true || rest.vertical === false){
      return <ScrollView testID={testID} ref={ref} {...rest} children={cChildren}/>
  }
  containerProps = defaultObj(containerProps)
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
  const contentLayout = defaultObj(layout.layout);
  cStyle.minHeight = Math.min(Math.max(layout.height-defaultNumber(contentLayout.y),250));
  const contentContainerStyle = ([cStyle,rest.contentContainerStyle]);
  const fStyle = !hasUpdateLayout && {flex:1,maxWidth:layout.width - defaultNumber(contentLayout.x)};
  return  <View ref={layoutRef} onLayout={()=>{
    if(!hasInitializedRef.current){
       updateLayout();
    }
  }} {...containerProps} style={[theme.styles.w100,containerProps.style,fStyle]} testID={testID+"_ScrollViewContainer"}>
    <ScrollView 
      ref={ref} {...rest} 
      testID={testID}
      children={hasUpdateLayout?children : <ActivityIndicator size={'large'} 
      style={[{flex:1}]}/>}
      contentContainerStyle = {[contentContainerStyle,fStyle]}
    />
  </View>
});

ScrollViewComponent.displayName = "ScrollViewComponent";
export default ScrollViewComponent;

ScrollViewComponent.propTypes = {
   ...defaultObj(ScrollView.propTypes),
   withAutoSizer : PropTypes.bool,//si la taille du scrollView sera withAutoSizer
   maxHeight : PropTypes.number,
   minHeight : PropTypes.number,
}
