// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { ScrollView,StyleSheet,View,useWindowDimensions,Dimensions} from "react-native";
import React from "$react";
import {defaultStr,defaultObj,isObj,isNumber} from "$cutils";
import {Portal} from "react-native-paper";
import {isMobileNative,isTouchDevice} from "$platform";

const isNative = isMobileNative() || isTouchDevice();
const AbsoluteScrollView = React.forwardRef(({testID,contentProps,listRef,containerProps,...props},ref)=>{
    if(isNative) return null;
    containerProps = defaultObj(containerProps);
    contentProps = defaultObj(contentProps);
    const win = useWindowDimensions();
    const scrollViewRef = React.useRef(null);
    testID = defaultStr(testID,"RN_TableAbsoluteScrollViewComponent");
    const [state,setState] = React.useState({
        styles : {},
        visible : true,
    })
    const [layoutVisible,_setLayoutVisible] = React.useState(true);
    const {styles,visible} = state,setStyles = (s)=>{
        if(isObj(s)){
            setState({...state,styles:{...styles,...s}});
        }
    },toggleVisible = ()=>{
        if(isObj(styles.content) && isObj(styles.container)){
            const visible = isNumber(styles.content.height) && isNumber(styles.container.height) && (styles.content.height-20)> styles.container.height? true : false;
            if(visible != state.visible){
                setState({...state,visible});
            }
        }
    },setVisible = (visible)=>{
        if(typeof visible =='boolean' && visible !== state.visible){
            setState({...state,visible});
        }
    },setLayoutVisible = (layoutVisible)=>{
        if(typeof layoutVisible =='boolean' && layoutVisible !== state.layoutVisible){
            _setLayoutVisible(layoutVisible);
        }
    }   
    React.setRef(ref,{
        setStyles,
        setVisible,
        setLayoutVisible,
        checkVisibility : (args)=>{
            args = defaultObj(args);
            if(isObj(args.contentOffset) && isObj(args.contentSize)){
                const {x} = args.contentOffset;
                const {width:contentWidth} = args.contentSize;
                const {width} = Dimensions.get("window");
                const visible = x >= width-10 && (contentWidth-x)<10 ? false : true;
                if(state.visible != visible){
                    return setState({...state,visible});
                }
            }
            return toggleVisible();
        },
        scrollViewRef
    });
    React.useEffect(()=>{
        return ()=>{
            React.setRef(ref,null);
        }
    },[]);
    React.useEffect(()=>{
        toggleVisible();
    },[styles])
    let canBeVisible = true;
    if(isObj(styles.content) && isObj(styles.contentContainer)){
        if(typeof styles.content.height =='number' && typeof styles.contentContainer.height =='number'){
            if(styles.content.height -10 <= styles.contentContainer.height){
                canBeVisible = false;
            }
        }
    }
    const hidden = (!canBeVisible || !visible || !layoutVisible) ;
    return <Portal>
        {<View testID={testID+"_Containter"} {...containerProps} style={[mainStyles.container,containerProps.style,styles.container,{left:win.width-10},hidden &&{display:'none',width:0,opacity:0}]}>
            <ScrollView
                {...props}
                ref = {scrollViewRef}
                testID={testID}
                contentContainerStyle = {[props.contentContainerStyle,mainStyles.contentContainer,styles.contentContainer]}
                vertical
            >
                <View
                    testID={testID+"Content"}
                    {...contentProps}
                    style={[mainStyles.content,contentProps.style,styles.content]}
                />
            </ScrollView>
        </View>}
    </Portal>
});

export default AbsoluteScrollView;

const mainStyles = StyleSheet.create({
    container : {
        ...StyleSheet.absoluteFill,
        width : 10,
    },
    content : {
        width:10,
    },
    contentContainer : {
        
    }
})
AbsoluteScrollView.displayName = "TableVerticalScrollView";