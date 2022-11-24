// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { ScrollView,StyleSheet,View,useWindowDimensions} from "react-native";
import React from "$react";
import {defaultStr,defaultObj,isObj,isNumber} from "$utils";
import Portal from "$ecomponents/Portal";
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
    }
    React.setRef(ref,{
        setStyles,
        checkVisibility : (args)=>{
            args = defaultObj(args);
            if(isObj(args.contentOffset) && isObj(args.contentSize)){
                const {x} = args.contentOffset;
                const visible = x-10 >win.width ? false : true;
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
    return <Portal>
        {<View testID={testID+"_Containter"} {...containerProps} style={[mainStyles.container,containerProps.style,styles.container,{left:win.width-10},!visible &&{display:'none',width:0,opacity:0}]}>
            <ScrollView
                {...props}
                ref = {scrollViewRef}
                testID={testID}
                contentContainerStyle = {[props.contentContainerStyle,mainStyles.contentContainer,styles.containerContainer]}
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