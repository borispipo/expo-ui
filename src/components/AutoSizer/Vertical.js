import React from '$react';
import { Dimensions} from 'react-native';
import PropTypes from "prop-types";
import View from "$ecomponents/View";
import theme from "$theme";
import {defaultStr,defaultObj,defaultNumber} from "$cutils";
import ActivityIndicator from "$ecomponents/ActivityIndicator";

/***
 * ce composant a pour but de définir la taille d'un contenu en se basant sur sa positin top, de manière à ce que, le contentu du composant fit
 * le reste de la taille de la page, avec comme valeur de la props minHeight
 */
const AutoSizerVerticalComponent = React.forwardRef(({onLayout,isScrollView,screenIndent,getRenderingStyle,withActivityIndicator,testID,withPadding,paddingBottom,maxHeight,minHeight,style,children:cChildren,...rest},ref) => {
  testID = defaultStr(testID,'RN_AutoSizerVerticalComponent');
  const hasUpdateLayoutRef = React.useRef(false);
  const layoutRef = React.useRef(null);
  const [layout,setLayout] = React.useState(Dimensions.get("window"));
  const {height,width} = layout;
  const hasInitializedRef = React.useRef(false);
  const children = React.useStableMemo(()=>cChildren,[cChildren]);
  withActivityIndicator = typeof withActivityIndicator =='boolean'? withActivityIndicator : !isScrollView;
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
  React.setRef(ref,{
      updateLayout,
      layoutRef,
      ref : layoutRef
  });
  React.useEffect(()=>{
    const onResizePage = ()=>{
      setTimeout(()=>{
         updateLayout();
      },500);
    }
    const dim = Dimensions.addEventListener("change",onResizePage);
    return ()=>{
      React.setRef(ref,null);
      dim?.remove();
    }
  },[]);
  const hasUpdateLayout = hasUpdateLayoutRef.current;
  const cStyle ={width:'100%',maxHeight:Math.max(height-100,250)};
  const contentLayout = defaultObj(layout.layout);
  screenIndent = typeof screenIndent =='number' && screenIndent > 50 ? screenIndent : 100;
  const y = Math.abs(defaultNumber(contentLayout.y));
  const heightY = y < height - screenIndent ? y : height - screenIndent;
  cStyle.minHeight = Math.min(Math.max(layout.height-heightY,minHeight && minHeight ||250));
  const cMaxHeight = layout.height-heightY;
  if(cMaxHeight>=200){
    cStyle.maxHeight = cMaxHeight;
  }
  if(typeof paddingBottom =='number'){
      cStyle.paddingBottom = paddingBottom; //: 50;
  }
  if(cStyle.minHeight && cStyle.maxHeight && cStyle.minHeight > cStyle.maxHeight){
     cStyle.minHeight = cStyle.maxHeight;
  }
  const restStyle = {};
  const canUpdate = hasUpdateLayout || hasUpdateLayout || withActivityIndicator === false;
  const fStyle = !canUpdate && {flex:1,flexDirection:'column',maxHeight:cStyle.maxHeight,maxWidth : Math.max(layout.width-defaultNumber(contentLayout.x)),justifyContent:'center',alignItems:'center'} || {};
  if(maxHeight){
    restStyle.maxHeight = maxHeight;
  }
  if(minHeight){
     restStyle.minHeight = minHeight;
  }
  if(canUpdate && typeof getRenderingStyle ==='function'){
      getRenderingStyle({...cStyle,...restStyle});
  }
  return children;
  return  <View ref={layoutRef} 
        onLayout={(a,b,c)=>{
            if(onLayout && onLayout(a,b,c) === false) return;
            if(!hasInitializedRef.current){
              updateLayout();
            }
        }} 
    {...rest} 
    style={[theme.styles.w100,cStyle,style,fStyle,restStyle]} testID={testID+"_ScrollViewContainer"}>
    { canUpdate?children : <ActivityIndicator size={'large'}/>}
  </View>
});

AutoSizerVerticalComponent.displayName = "AutoSizerVerticalComponent";
export default AutoSizerVerticalComponent;

AutoSizerVerticalComponent.propTypes = {
   ...defaultObj(View.propTypes),
   withActivityIndicator : PropTypes.bool,//si l'on utilisera l'activity indicator pour le chargement du contentu
   maxHeight : PropTypes.number,
   minHeight : PropTypes.number,
   paddingBottom : PropTypes.number,
}
