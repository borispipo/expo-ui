import {defaultObj,defaultStr} from "$utils";
import PropTypes from "prop-types";
import theme,{Colors} from "$theme";
import {isIos} from "$cplatfrom";
import React from "$react";
import Icon from "./Icon";

/****** icon de type checkbox variant en fonction de l'environnement ou la plateforme */
const Checkbox = React.forwardRef((props,ref)=>{
    const {checked:customChecked,color:customColor,primary,secondary,primaryOnCheck,secondaryOnCheck,onChange,checkedIcon:customCheckedIcon,uncheckedIcon:customUncheckedIcon,onPress,...rest} = props; 
    const checkedIcon = defaultStr(checkedIcon,isIos()? 'check' : "checkbox-marked");
    const uncheckedIcon = defaultStr(uncheckedIcon,"checkbox-blank-outline");
    const [checked,setIsChecked] = React.useStateIfMounted(!!checked);
    const isMounted = React.useIsMounted();
    const prevChecked = React.usePrevious(checked);
    const callOnChangeRef = React.useRef(true);
    const callOnChange = callOnChangeRef.current;
    callOnChangeRef.current = true;
    React.useEffect(()=>{
        if(customChecked === checked || !isMounted()) return;
        setIsChecked(customChecked);
    },[customChecked])
    React.useEffect(()=>{
        if(prevChecked === checked || !callOnChange) return;
        if(onChange){
            onChange({value:checked?1:0,checked});
        }
    },[checked])
    const [context] = React.useStateIfMounted({
        check : (callOnChange)=>{
            if(!isMounted()) return;
            if(typeof callOnChange =='boolean'){
                callOnChangeRef.current = callOnChange;
            }
            setIsChecked(true);
        }, uncheck : (callOnChange)=>{
            if(!isMounted()) return;
                        if(typeof callOnChange =='boolean'){
                callOnChangeRef.current = callOnChange;
            }
            setIsChecked(false);
        },checked,
    });
    context.checked = checked;
    React.useEffect(()=>{
        React.setRef(ref,context);
        return ()=>{
            React.setRef(null);
        }
    },[])
    let color = Colors.isValid(customColor)? customColor : undefined;
    if(checked){
        color = secondaryOnCheck ? theme.colors.secondary : primaryOnCheck ? theme.colors.primary : undefined;
    }
    if(!color){
        if(primary){
            color = theme.colors.primary;
        } else if(secondary){
            color = theme.colors.secondary;
        }
    }
    return <Icon 
        {...defaultObj(rest)}
        color = {color}
        icon={checked?checkedIcon:uncheckedIcon}
        onPress = {(e)=>{
            if(onPress && onPress({event:e,checked}) === false) return;
            setIsChecked(!checked)
        }}
    />
});

Checkbox.propTypes = {
    ...Icon.propTypes,
    primaryOnCheck : PropTypes.bool,
    secondaryOnCheck : PropTypes.bool,
    checked : PropTypes.bool, //si l'icon est checked,
    onChange : PropTypes.func,
}

Checkbox.displayName = "Icon.CheckboxComponent";

export default Checkbox;