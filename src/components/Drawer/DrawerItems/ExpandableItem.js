import {Pressable} from "react-native";
import View from "$ecomponents/View";
import Icon from "$ecomponents/Icon";
import {defaultObj,isBool,defaultBool,defaultStr} from "$utils";
import PropTypes from "prop-types"
import React from "$react";
import DrawerItem from "./DrawerItem";
import theme from "$theme";

export default function ExpandableItem(props){
    let {children,expanded,expandedIcon,testID,minimized,onPress,expandIconProps,unexpandedIcon,onToggleExpand,wrapperProps,...rest} = props;
    testID = defaultStr(testID,"RN_ExpandableDrawerItemComponent")
    wrapperProps = defaultObj(wrapperProps);
    const [expandedControled,setExpended] = React.useState(defaultBool(expanded,false))
    let _expanded = expanded;
    if(!isBool(expanded)){
        _expanded = expandedControled;
    }
    const _onToggleExpand = (e)=>{
        _expanded = !_expanded;
        setExpended(_expanded)
        if(onPress){
            onPress(e,_expanded);
        }
    }
    expandIconProps = defaultObj(expandIconProps);
    const icon = _expanded ? defaultVal(expandedIcon,"chevron-up") : defaultVal(unexpandedIcon,"chevron-down")
    rest.right = (props)=> <Icon testID={testID+"_Right"} {...props} style={{margin:0}} size={minimized?15:24} icon={icon} onPress={_onToggleExpand}/>
    return <View {...wrapperProps} testID={testID+"_Wrapper"}>
        <DrawerItem testID={testID} color={_expanded?theme.colors.primary:undefined} {...rest} minimized={minimized} isExpandable onPress={_onToggleExpand}/>
        {_expanded && <Pressable testID={testID+"_ExpandedContent"} style={{marginLeft:10}}>
            <React.Fragment>{children}</React.Fragment>
        </Pressable>}
    </View>
}

ExpandableItem.propTypes = {
    ///lorsqu'on clique sur le press menu
    onPress : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.bool,
    ]),
    wrapperProps : PropTypes.object, //les props de la vue qui wrapp le contenu expand
    onToggleExpand : PropTypes.func, //lorsqu'on modifie la valeur expanded
}