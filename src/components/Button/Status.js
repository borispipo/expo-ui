import React from "$react";
import theme from "$theme";
import Label from "$ecomponents/Label";
import {defaultObj} from "$cutils";
import Icon from "$ecomponents/Icon";
import {Pressable,StyleSheet} from "react-native";
import PropTypes from "prop-types";
import View from "$ecomponents/View";

const ButtonStatusComponent = React.forwardRef(({withIcon,color,backgroundColor,label,text,icon,editIconProps,editIcon,iconProps,onPress,editable,testID,left,right,labelProps,containerProps,...rest},ref)=>{
    labelProps = defaultObj(labelProps);
    iconProps = defaultObj(iconProps);
    containerProps = defaultObj(containerProps);
    testID = defaultStr(testID,"RN_ButtonStatusComponent_");
    const style = defaultObj(StyleSheet.flatten(rest.style));
    color = theme.Colors.isValid(color) ? color : theme.Colors.isValid(style.color)? style.color : undefined;
    backgroundColor = theme.Colors.isValid(backgroundColor) ? backgroundColor : theme.Colors.isValid(style.backgroundColor)?style.backgroundColor : undefined;
    const rP = {style:[color && {color}, backgroundColor && {backgroundColor}]};
    if(!backgroundColor && !color){
        backgroundColor = theme.colors.surface;
        color = theme.colors.onSurface;
    }
    if(color){
        rP.color = color;
    }
    if(backgroundColor){
        rP.backgroundColor = backgroundColor;
    }
    label = React.isValidElement(label,true) && label || React.isValid(text,true) && text || null;
    left = typeof left =='function'? left(rP) : left;
    right = typeof right =='function'? right(rP) : right;
    icon = typeof icon =="function"? icon(rP) : icon;
    const icProps = {color,size:15,...iconProps,style:[theme.styles.noMargin,theme.styles.noPadding,iconProps.style],onPress}
    return <View {...containerProps} testID={testID+"_Container"} style={[styles.container,containerProps.style]}>
        <Pressable ref={ref} onPres={onPress} testID={`${testID}`} {...rest} style={[styles.button,theme.styles.row,theme.styles.flexWrap,backgroundColor && {backgroundColor},style]}>
            {React.isValidElement(left)? left : null}
            {withIcon !== false && React.isValidElement(icon,true) ? <Icon testID={testID+"_Icon"} {...icProps} icon={icon} />:null}
            {label ? <Label testID={`${testID}_Label`} {...labelProps} style={[color && {color},{fontSize:13},labelProps.style]}>{label}</Label> : null}
            {withIcon !== false && editable && React.isValidElement(editIcon,true) ? <Icon {...icProps} icon={editIcon} {...defaultObj(editIconProps)}/>:null}
            {React.isValidElement(right)? right : null}
        </Pressable>
    </View>
});

ButtonStatusComponent.displayName = "ButtonStatusComponent";

export default ButtonStatusComponent;

ButtonStatusComponent.defaultProps = {
    withIcon : true,
    editable : false,
}

const styles = StyleSheet.create({
    button : {
        borderRadius:15,
        paddingVertical:4,
        paddingHorizontal:10,
        alignSelf: 'flex-start',
    },
    container : {
        alignSelf : "flex-start",
    }
});

ButtonStatusComponent.propTypes = {
    label : PropTypes.oneOfType([ //le libelé à faire figurer sur le status
        PropTypes.node,
        PropTypes.element,
        PropTypes.string,
    ]),
    text : PropTypes.oneOfType([ //alias à label
        PropTypes.node,
        PropTypes.element,
        PropTypes.string,
    ]),
    labelProps : PropTypes.object, //les props à passer au composant Label, pour l'affichage du libelé du status
    withIcon : PropTypes.bool, //si les icones seront affichés 
    color : PropTypes.string, //la couleur du status
    backgroundColor : PropTypes.string, //la couleur d'arrière plan
    onPres : PropTypes.func, //la fonction appelée lorsqu'on clique sur le status
    editable : PropTypes.bool, //si le status est modifiable, dans ce cas une icone est affiché à droite lorsque le status est editable
    /**** l'icone du composant Status par défaut */
    icon : PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.element,
        PropTypes.string,
        PropTypes.func,
    ]),
    iconProps : PropTypes.object, //les props à passer aux différents icones du composant
    left : PropTypes.oneOfType([ //l'élément react à rendre à gauche du texte (label)
        PropTypes.func,
        PropTypes.node,
        PropTypes.string,
        PropTypes.element,
    ]),
    right : PropTypes.oneOfType([ //l'élément react à rendre à droite du texte (label)
        PropTypes.func,
        PropTypes.node,
        PropTypes.string,
        PropTypes.element,
    ]),
    editIconProps : PropTypes.object,//les props de l'iconne edit
    containerProps : PropTypes.shape(Object.assign({},View.propTypes)), //les props du composant container, idem à ceux du composant $ecomponents/View
}