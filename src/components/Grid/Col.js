'use strict';

import React from '$react';
import {Pressable, StyleSheet} from 'react-native';
import {defaultStr} from "$cutils";
import PropTypes from "prop-types";
import View from "$ecomponents/View";

const GridColComponent = React.forwardRef((p,ref)=>{
    const {style,size,onPress,activeOpacity,onLongPress,flex:customFlex,onPressIn,onPressOut,...props} = p;
    const flattenedStyle = StyleSheet.flatten(style);
    const testID = defaultStr(props.testID,"RN_Grid.ColComponent");
    const flex = customFlex !== undefined ? customFlex : (flattenedStyle && flattenedStyle.width) ? 0 : 1;
    const C = onPress || onLongPress || onPressIn || onPressOut ? Pressable : View;
    return <C {...props} activeOpacity={activeOpacity} onLongPress={onLongPress} onPressIn={onPressIn} onPressOut={onPressOut}
        testID={testID} style={[styles.container,flattenedStyle,{flex}]} ref={ref} onPress={onPress}
    />
});

GridColComponent.displayName = "Grid.Col";
GridColComponent.propTypes = {
    flex : PropTypes.number,
}
const styles = StyleSheet.create({
    container : {
        flexDirection:  'column'
    }
});

export default GridColComponent;