import React from "$react";
import { Paragraph } from "react-native-paper";
import {canTextBeSelectable} from "$cplatform";
import {defaultObj,defaultStr,defaultNumber} from "$cutils";
import PropTypes from "prop-types";
import theme from "$theme";

const defaultSelectable = canTextBeSelectable();

function ParagraphComponent({splitText,...props}){
    props = defaultObj(props);
    const restProps = {};
    if(splitText){
        restProps.numberOfLines = defaultNumber(props.numberOfLines,2);
        restProps.ellipsizeMode = defaultStr(props.ellipsizeMode,'tail');
    }
    return <Paragraph
        userSelect = {defaultSelectable}
        {...props}
        {...restProps}
    />
}

ParagraphComponent.propTypes = {
    ...defaultObj(Paragraph.propTypes),
    numberOfLines : PropTypes.number,
    splitText : PropTypes.bool,
}

export default theme.withStyles(ParagraphComponent,{
    mode : "normal"
});
