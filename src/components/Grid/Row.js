'use strict';

import React from '$react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import View from "$ecomponents/View";
import {defaultStr} from "$cutils";
import PropTypes from "prop-types";

const GridRowComponent = React.forwardRef((p,ref)=>{
    const {style,size,onPress,activeOpacity,onLongPress,flex:customFlex,onPressIn,onPressOut,...props} = p;
    const flattenedStyle = StyleSheet.flatten(style);
    const testID = defaultStr(props.testID,"RN_Grid.RowComponent");
    const flex = customFlex !== undefined ? customFlex : (flattenedStyle && flattenedStyle.height) ? 0 : 1;
    const C = onPress || onLongPress || onPressIn || onPressOut ? TouchableOpacity : View;
    return <C {...props} activeOpacity={activeOpacity} onLongPress={onLongPress} onPressIn={onPressIn} onPressOut={onPressOut}
        onPress={onPress} testID={testID} style={[styles.container,flattenedStyle,{flex}]} ref={ref}
    />
});

GridRowComponent.displayName = "Grid.Row";
GridRowComponent.propTypes = {
    flex : PropTypes.number,
}
const styles = StyleSheet.create({
    container : {
        flexDirection:  'row'
    }
});

export default GridRowComponent;