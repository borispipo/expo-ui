import React from '$react';
import { FlatList } from 'react-native';
import { ScrollView,Dimensions,useWindowDimensions } from 'react-native';
import PropTypes from "prop-types";
import View from "$ecomponents/View";
import {isMobileNative,isTouchDevice} from "$cplatform";
import {isDesktopMedia} from "$cdimensions";
import {defaultStr,defaultObj} from "$utils";
const isNative = isMobileNative();
import APP from "$capp/instance";
const ScrollViewComponent = React.forwardRef((props,ref) => {
  const {virtualized,contentProps,mediaQueryUpdateNativeProps,testID:customTestID,children,screenIndent:sIndent,...rest} = props;
  const testID = defaultStr(customTestID,'RN_ScrollViewComponent');
  const cProps = defaultObj(contentProps);
  const [layout,setLayout] = React.useState(Dimensions.get("window"));
  const {height} = layout;
  React.useEffect(()=>{
    const onResizePage = ()=>{
      if(isTouchDevice()) return;
      setTimeout(()=>{
         setLayout(Dimensions.get("window"))
      },200);
    }
    APP.on(APP.EVENTS.RESIZE_PAGE,onResizePage);
    return ()=>{
      APP.off(APP.EVENTS.RESIZE_PAGE,onResizePage);
    }
  },[])
  const showIndicator = true;//!isTouchDevice() || isDesktopMedia();
  return  virtualized ? <FlatList
    //showsHorizontalScrollIndicator = {showIndicator}  
    //showsVerticalScrollIndicator={showIndicator} 
    {...rest}
    ref = {ref}
    testID = {testID}
    data={[]}
    keyExtractor={(_e, i) => 'dom' + i.toString()}
    ListEmptyComponent={null}
    renderItem={null}
    contentContainerStyle = {[!isNative && {flex:1,flexGrow: 1,maxHeight:Math.max(height-100,250)},rest.contentContainerStyle]}
    ListHeaderComponent={() => <View testID={testID+'_FlatListContent'} {...cProps} mediaQueryUpdateNativeProps = {mediaQueryUpdateNativeProps}
    >{children}</View>}
    /> : <ScrollView 
      //showsHorizontalScrollIndicator = {showIndicator}  
      //showsVerticalScrollIndicator={showIndicator} 
      ref={ref} {...rest} testID={testID} children={children}/>
});

ScrollViewComponent.displayName = "ScrollViewComponent";
export default ScrollViewComponent;

ScrollViewComponent.propTypes = {
    virtualized : PropTypes.bool,
    contentProps : PropTypes.object,
}
