// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { ScrollView,StyleSheet,View,useWindowDimensions} from "react-native";
import React from "$react";
import {defaultStr,defaultObj,isObj} from "$utils";
import Portal from "$ecomponents/Portal";

const AbsoluteScrollView = React.forwardRef(({testID,contentProps,containerProps,...props},ref)=>{
    containerProps = defaultObj(containerProps);
    contentProps = defaultObj(contentProps);
    const win = useWindowDimensions();
    const scrollViewRef = React.useRef(null);
    testID = defaultStr(testID,"RN_TableAbsoluteScrollViewComponent");
    const [styles,setStyles] = React.useState({});
    React.setRef(ref,{
        setStyles : (s)=>{
            if(isObj(s)){
                setStyles({...styles,...s});
            }
        },
        scrollViewRef
    })
    React.useEffect(()=>{
        return ()=>{
            React.setRef(ref,null);
        }
    },[])
    return <Portal>
        <View testID={testID+"_Containter"} {...containerProps} style={[mainStyles.container,containerProps.style,styles.container,{left:win.width-10}]}>
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
        </View>
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