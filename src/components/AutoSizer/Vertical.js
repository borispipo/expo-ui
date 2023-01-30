import React from '$react';
import { Dimensions} from 'react-native';
import PropTypes from "prop-types";
import View from "$ecomponents/View";
import theme from "$theme";
import {defaultStr,defaultObj,defaultNumber} from "$utils";
import APP from "$capp/instance";
import ActivityIndicator from "$ecomponents/ActivityIndicator";

/***
 * ce composant a pour but de définir la taille d'un contenu en se basant sur sa positin top, de manière à ce que, le contentu du composant fit
 * le reste de la taille de la page, avec comme valeur de la props minHeight
 */
const AutoSizerVerticalComponent = React.forwardRef(({onLayout,testID,maxHeight,minHeight,style,children:cChildren,...rest},ref) => {
  testID = defaultStr(testID,'RN_AutoSizerVerticalComponent');
  const hasUpdateLayoutRef = React.useRef(false);
  const layoutRef = React.useRef(null);
  const [layout,setLayout] = React.useState(Dimensions.get("window"));
  const {height,width} = layout;
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
    const onResizePage = ()=>{
      setTimeout(()=>{
         updateLayout();
      },300);
    }
    APP.on(APP.EVENTS.RESIZE_PAGE,onResizePage);
    return ()=>{
      APP.off(APP.EVENTS.RESIZE_PAGE,onResizePage);
    }
  },[]);
  const hasUpdateLayout = hasUpdateLayoutRef.current;
  const cStyle ={width:'100%',maxHeight:Math.max(height-100,250)};
  const contentLayout = defaultObj(layout.layout);
  if(typeof contentLayout.y =='number' && contentLayout.y>=10){
      const {x,y}= contentLayout;
      const mHeight = height - y;
      if(mHeight> 0){
          cStyle.minHeight = mHeight;
      }
  }
  const fStyle = {flex:1,flexDirection:'column',maxHeight:(layout.height-defaultNumber(contentLayout.y)),maxWidth : Math.max(layout.width-defaultNumber(contentLayout.x)),justifyContent:'center',alignItems:'center'};
  return  <View ref={React.useMergeRefs(layoutRef,ref)} 
        onLayout={(a,b,c)=>{
            if(onLayout && onLayout(a,b,c) === false) return;
            if(!hasInitializedRef.current){
            updateLayout();
            }
        }} 
    {...rest} 
    style={[theme.styles.w100,cStyle,style,fStyle,maxHeight && {maxHeight}, minHeight && {minHeight}]} testID={testID+"_ScrollViewContainer"}>
    {hasUpdateLayoutRef.current ?children : <ActivityIndicator size={'large'}/>}
  </View>
});

AutoSizerVerticalComponent.displayName = "AutoSizerVerticalComponent";
export default AutoSizerVerticalComponent;

AutoSizerVerticalComponent.propTypes = {
   ...defaultObj(View.propTypes),
   maxHeight : PropTypes.number,
   minHeight : PropTypes.number,
}
