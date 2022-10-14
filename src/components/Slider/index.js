import {View } from "react-native";
import React from "$react";
import {defaultObj,isArray,isDecimal} from "$utils";
import theme,{Colors,DISABLED_OPACITY} from "$theme";
import {StyleSheet} from "react-native";
import PropTypes from "prop-types";
import Label from "$components/Label";
import Slider from "./Slider";
import {isWeb} from "$platform";
import HelperText from "$components/HelperText";

const prepareValue = ({value,defaultValue}) => isArray(defaultValue) && defaultValue.length? defaultValue : isArray(value) && value.length? value : defaultDecimal(defaultValue,value)

const SliderComponent = React.forwardRef((props,ref)=>{
    let {
        value,
        label,
        text,
        error,
        style,
        onPress,
        onChange,
        helperText,
        labelProps,
        containerProps,
        labelStyle,
        testID,
        title,
        valueProps,
        contentProps,
        renderValue,
        step,
        percentage,
        editable,
        disabled,
        readOnly,
        ...p
    } = props;
    p = defaultObj(p);
    disabled = defaultBool(disabled,false);
    readOnly = defaultBool(readOnly,false);
    const isEditable = !disabled && !readOnly && editable !== false ? true : false;
    const pointerEvents = isEditable ? "auto" : "none";
    containerProps = defaultObj(containerProps);
    valueProps = defaultObj(valueProps);
    contentProps = defaultObj(contentProps);
    const defVal = prepareValue({value,defaultValue});
    const [sValue,setSValue] = React.useStateIfMounted(defVal)
    const prevValue = React.usePrevious(isArray(sValue) && isDecimal(sValue[0])? sValue[0]:sValue);
    React.useEffect(()=>{
        const value = isArray(sValue) && isDecimal(sValue[0]) ? sValue[0] : isDecimal(sValue)? sValue : undefined;
        const prevVal = isArray(prevValue) ? prevValue[0] : prevValue;
        if(value !== prevVal){
            if(typeof onChange =='function'){
               onChange({value,previousValue:prevValue});
            }
        }
   },[sValue])

   const setValue = (nVal)=>{
        if(nVal === sValue) return;
        let sV = Array.isArray(sValue)? sValue[0] : sValue;
        let nV = Array.isArray(nVal)? nVal[0] : nVal;
        if(sV === nV) return;
        setSValue(nVal);
   }
   React.useEffect(()=>{
       const nVal = prepareValue({value,defaultValue});
       setValue(nVal);
   },[value,defaultValue])

   const context = {setValue};
   React.useEffect(()=>{
       React.setRef(ref,context);
       return ()=>{
           React.setRef(ref,null);
       }
   },[])
   const fValue = isArray(sValue) && isDecimal(sValue[0])? sValue[0] : isDecimal(sValue)? sValue : undefined;
   const sRenderValue = isDecimal(fValue)?  defaultFunc(renderValue,(value)=>value.formatNumber()+(percentage !==false?"%":""))(fValue) : undefined
   labelProps = defaultObj(labelProps)
   const tinColor = Colors.isWhite(theme.colors.primary)? theme.colors.secondary : theme.colors.primary;
   const webStyle = isWeb()? {cursor:'pointer'} : null;
   const rDisabled = {};
   if(disabled){
       rDisabled.opacity = DISABLED_OPACITY;
   }
   return <React.Fragment>
        <View {...containerProps} pointerEvents={pointerEvents} style={[styles.wrap,containerProps.style,styles.container]}>
            <View {...contentProps} style={[contentProps.style,styles.content]}>
               <Label disabled={disabled} {...labelProps} style={[styles.label,defaultObj(labelStyle,labelProps.style),{textAlign:'left'},error?{color:theme.colors.error}:undefined,rDisabled]} >{label}</Label>
               {<Label {...valueProps} pointerEvents={'none'} disabled={disabled} style={[{color:theme.colors.primaryOnSurface,fontWeight:'bold',textAlign:'right'},valueProps.style]}>{sRenderValue}</Label>}
            </View>
            <View style={[{width:'100%'},webStyle]} pointerEvents={pointerEvents}>
                <Slider
                    {...p}
                    disabled = {disabled}
                    editable = {isEditable}
                    thumbTintColor = {Colors.isValid(p.thumbTintColor)? p.thumbTintColor:tinColor}
                    minimumTrackTintColor = {Colors.isValid(p.minimumTrackTintColor)
                        ?p.minimumTrackTintColor:tinColor}
                    maximumValue = {100}
                    minimumValue = {0}
                    step= {defaultDecimal(step,1)}
                    style = {[styles.slider,style,rDisabled]}
                    value = {sValue}
                    onValueChange = {setSValue}
                    color = {Colors.isValid(p.color)? p.color : theme.colors.primaryOnSurface}
                />
            </View>
            {<HelperText error={error} disabled={!isEditable}>{helperText}</HelperText>}
        </View>
    </React.Fragment>
}); 

SliderComponent.propTypes = {
    ...defaultObj(Slider.propTypes),
    containerProps : PropTypes.object,//les props de la vue container au tooltip
    labelProps : PropTypes.object,//les props du label
    percentage : PropTypes.bool,//si le rendu sera en pourcentage
}

const styles = StyleSheet.create({
    container : {
        flexDirection: 'column',
        paddingVertical : 0,
    },
    content : {
        flexDirection:'row',
        marginVertical:0,
        textAlign:'left',
        justifyContent:'space-between'
    },
    label: {
      fontSize: 16,
    },
    slider : {
        paddingHorizontal:0,
        marginHorizontal:10,
        height:40
    }
  });

  export default SliderComponent;