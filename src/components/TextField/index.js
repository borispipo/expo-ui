import {defaultStr,defaultObj,defaultBool,isNumber,isDecimal,isFunction,defaultVal,defaultNumber,isNonNullString} from "$cutils";
import { TextInput} from "react-native-paper";
import { TextInput as RNTextInput,KeyboardAvoidingView,StyleSheet} from "react-native";
import React from "$react";
import theme,{Colors,DISABLED_OPACITY,READONLY_OPACITY} from "$theme";
import PropTypes from "prop-types";
import HelperText from "$ecomponents/HelperText";
import Icon,{COPY_ICON} from "$ecomponents/Icon";
import Label from "$ecomponents/Label";
import {isAndroid as _isAndroid,isIos as _isIos,isWeb as _isWeb} from "$cplatform";
import {isMobileMedia,isDesktopMedia} from "$cplatform/dimensions";
import {keyboardTypes,FONT_SIZE,parseDecimal,HEIGHT,outlinedMode,modes,flatMode,normalMode,shadowMode} from "./utils";
import {copyTextToClipboard} from "$clipboard/utils";
import Surface from "$ecomponents/Surface";
import View from "$ecomponents/View";
const PADDING_HORIZONTAL_FLAT_MODE = 2;

export const LINE_HEIGHT = 10;

const EnterKey = "Enter".toLowerCase();
const BackSpaceKey = "Backspace".toLowerCase();

export * from "./utils";


//const isNative = isNativeMobile();
const isAndroid = _isAndroid() //|| isAndroidMobileBrowser();
const isWeb = _isWeb();

const TextFieldComponent = React.forwardRef((componentProps,inputRef)=>{
    let {defaultValue,toCase:toCustomCase,color,validType,validRule,placeholder,outlined,placeholderColor,
        label,labelProps,labelStyle,fontSize,containerProps,selection,roundness,
        autoCapitalize,disabled,readOnly,elevation,divider,render,
        leftContainerProps,left,right,rightContainerProps,rows,
        emptyValue,usePlaceholderWhenEmpty,
        numberOfLines,mode,selectionColor,activeOutlineColor,multiline
        ,underlineColor,alwaysUseLabel,activeUnderlineColor,autoHeight,multiple,inputMode,setRef,type,error,
        style,maxLength,length,affixStyle,affix,helperText, upperCase,
        upper,onChangeText,onChange,onMount,onUnmount,
        format , 
        enableCopy,
        fieldToCopy,
        selectFieldToCopy,
        isFilter,
        context : customContext,
        formatValue : customFormatValue,
        useReadOnlyOpacity,
        children : customChildren,
        testID,
        contentContainerProps,
        contentProps,
        lower,
        dynamicBackgroundColor,
        lowerCase,
        onContentSizeChange,
        handleOpacity,
        ...props} = componentProps;
    upper = defaultBool(upper,upperCase,false);
    lower = defaultBool(lower,lowerCase,false);
    testID = defaultStr(testID,'RN_TextField');
    type = defaultStr(type).toLowerCase();
    if(lower){
        autoCapitalize = "none";
    }
    format = defaultStr(format).toLowerCase();
    const canValueBeDecimal =  (type =='number' || type =='decimal');
    const isMoneyFormat = format == 'currency' || format =='money' ?true : false;
    const canValueBeFormattable = customFormatValue === false ? false : (typeof customFormatValue ==='function' || canValueBeDecimal || isMoneyFormat || format == 'number');
    emptyValue = defaultVal(emptyValue,canValueBeFormattable?"0":"");
    const formatValue = customFormatValue === false ? x=> x : (val)=>{
        if(val === undefined || val === null){
            val = canValueBeDecimal ? 0 : '';
        }
        if(canValueBeDecimal || (format !='custom')){
            val = parseDecimal(val,type);
        }
        let r = val;
        if(isDecimal(val)){
            if(isMoneyFormat){
                val = val.formatMoney();
            } else {
                val = val.formatNumber()
            }
        }
        if(typeof(customFormatValue) == 'function'){
            r = customFormatValue({value:r,isFilter,formattedValue:val,context:customContext,inputRef})
            if(isNonNullString(r)){
                val = r;
            }
        }
        return val;
    }
    const parseValueToDecimal = canValueBeFormattable ? (x) => parseDecimal(x,type,true) : x => x; 
    type = defaultStr(type,"text").toLowerCase();
    if(type =="pass") type = "password";
    const ref = React.useRef(null);
    disabled = defaultBool(disabled,false);
    readOnly = defaultBool(readOnly,false);

    const isEditable = !disabled && !readOnly;
    inputMode = defaultStr(inputMode).toLowerCase();
    let hasFountKeyboardType = false;
    if(isNonNullString(inputMode)){
        if(!keyboardTypes[inputMode]){
            for(let i in keyboardTypes){
                if(inputMode === keyboardTypes[i]){
                    hasFountKeyboardType = true;
                }
            }
        }
    }
    if(!hasFountKeyboardType && (!inputMode || !keyboardTypes[inputMode])){
        if(canValueBeDecimal){
            inputMode = keyboardTypes.decimal;
        } else if(type == "email"){
            inputMode = keyboardTypes.email;
        } else if(type =="phone" || type =="tel"){
            inputMode = keyboardTypes.phone;
        } else if(!keyboardTypes[type]){
            inputMode = keyboardTypes.default;
        }
    }
    const isSecureText = type =="password"?true : false;
    const [secureTextEntry,setSecureTextEntry] = React.useState(isSecureText);
    const [toggle,setToggle] = React.useState(false);
    const prevSecureTextEntry = React.usePrevious(secureTextEntry);
    containerProps = defaultObj(containerProps);
    mode = defaultStr(mode,theme.textFieldMode);
    if(!modes[mode]){
        mode = theme.textFieldMode;
    }
    const isOutlinedMode = mode === outlinedMode ? true : false;
    const isShadowMode = mode ==shadowMode ? true : false;
    const isNormalMode = mode == normalMode ? true : false;
    const isFlatMode =  mode == flatMode ? true : false;
    
    const MULTIPLE_HEIGHT = isShadowMode ? HEIGHT : HEIGHT;
    
    const [inputState, setInputState] = React.useState({
        focused : false,
        touched: false,
    });
    const isFocused = inputState.focused;
    //const callOnChangeRef = React.useRef(false);
    const toCase = (t) =>  {
        if(isNumber(t)) t+="";
        if(t === emptyValue){
            t = "";
        }
        const ret = ((upper !== true && lower !== true) || isAndroid) ? (typeof t =='string'? t : "") : (isNonNullString(t)? (upper ? t.toUpperCase() : lower ? t.toLowerCase():t) : "");
        if(toCustomCase){
            toCustomCase(ret);
        }
        return ret;
    };
    const [text, _setText] = React.useState(toCase(defaultValue));
    const previousText = React.usePrevious(text);
    

    const callOnChange = (value,previousValue)=>{
        const nV = value !== undefined ? value : text;
        value = parseValueToDecimal(nV);
        previousValue = parseValueToDecimal(previousValue!==undefined? previousValue :  previousText);
        const arg = {value,previousValue,context:ref.current};
        if(typeof onChangeText =='function'){
            onChangeText(value);
        }
        if(typeof onChange =='function'){
            onChange(arg);
        }
        //callOnChangeRef.current = false;
    }
    React.useEffect(()=>{
        return;
        if(!callOnChangeRef.current || previousText === text) return;
        callOnChange();
    },[text])
    const setText = function(text1,force){
        text1 = toCase(text1);
        if(force!== true && text1 === text) return;
        //callOnChangeRef.current = true;
        _setText(text1);
    }
    React.useEffect(()=>{
        defaultValue = toCase(defaultValue);
        if(defaultValue === toCase(emptyValue)){
            defaultValue = "";
        }
        if(defaultValue ===text || parseValueToDecimal(defaultValue) === parsedValue) return;
        _setText(defaultValue);
    },[defaultValue])
    React.useEffect(()=>{
        if(typeof onMount =='function'){
            onMount({context:ref,defaultValue,displayText,parsedValue,value:text})
        }
        return ()=>{
            ref.current = undefined;
            if(typeof onUnmount =='function'){
                onUnmount({context:ref});
            }
        }
    },[])
    React.useEffect(()=>{
        if(prevSecureTextEntry !== secureTextEntry && ref && ref.current){
            if(ref.current.focus) {
                ref.current.focus(); 
            } else {
                if(ref.current.forceFocus){
                    ref.current.forceFocus();
                }
            }
        }
    },[secureTextEntry])
    underlineColor = Colors.isValid(underlineColor)? underlineColor : Colors.setAlpha(theme.colors.text,theme.ALPHA);
    activeUnderlineColor = Colors.isValid(activeUnderlineColor)? activeUnderlineColor : theme.colors.primaryOnSurface;
    numberOfLines = isNumber(numberOfLines) && numberOfLines > 0 ? numberOfLines : isNumber(rows) && rows > 0 ? rows : undefined;
    contentContainerProps = defaultObj(contentContainerProps);
    contentProps = defaultObj(contentProps);
    leftContainerProps = defaultObj(leftContainerProps);
    rightContainerProps = defaultObj(rightContainerProps);
    const pointerEvents = isEditable?"auto":'none';
    const upperStyle =  text && (upper || lower) && !isAndroid ? {textTransform:upper?'uppercase':'lowercase'} : null;
    const opacity = disabled ? DISABLED_OPACITY : (useReadOnlyOpacity !== false && !error && (readOnly)) ? READONLY_OPACITY : undefined;
    const disabledStyle = typeof opacity =="number" ? {opacity} : undefined;
    if((readOnly === true || disabled === true) ){
        selection = defaultObj(selection);
        if(!isNumber(selection.start)){
            selection.start = 0;
        }
    }
    selectionColor = Colors.isValid(selectionColor)? selectionColor : theme.colors.secondaryOnSurface;
    const flattenStyle = StyleSheet.flatten([{pointerEvents},styles.input,styles.textInput,props.style,styles.w100,style,upperStyle]);
    fontSize = defaultNumber(fontSize,flattenStyle.fontSize,FONT_SIZE);
    labelProps = defaultObj(labelProps);
    const alphaColor = isShadowMode || isNormalMode ? theme.colors.text : Colors.setAlpha(theme.colors.text,theme.ALPHA);
    const disabledColor = disabled && Colors.isValid(theme.colors.disabled)?theme.colors.disabled : alphaColor;
    let labelColor = error ? theme.colors.error : !isEditable ? disabledColor : isFocused ? activeUnderlineColor : alphaColor;
    if(labelColor ==='transparent'){
        labelColor = theme.colors.secondaryOnSurface;
    }
    if (disabled) {
        placeholderColor = theme.colors.disabled;
    } else {
        placeholderColor = Colors.isValid(theme.colors.placeholder)?theme.colors.placeholder : undefined;
    }
    if(isFocused || error){
        placeholderColor = labelColor;
    }
    let labelText = React.isValidElement(label,true)?React.getTextContent(label):"";
    const defaultBackgroundColor = theme.surfaceBackgroundColor;
    let backgroundColor = Colors.isValid(flattenStyle.backgroundColor)? flattenStyle.backgroundColor : defaultBackgroundColor;
    if(labelText && (backgroundColor ==='transparent' && dynamicBackgroundColor !== false)){
        backgroundColor = defaultBackgroundColor;
    }
    placeholder = defaultStr(placeholder,labelText);
    const parsedValue = canValueBeDecimal ? parseValueToDecimal(text):text;
    const formattedValue = formatValue(text);
    let displayText = isFocused ? (parsedValue+"") : formattedValue;
    if((isFocused || usePlaceholderWhenEmpty) && displayText ==emptyValue){
        displayText = "";
    }
    displayText +="";
    if(typeof parsedValue =='number' && text){
        if(text.endsWith(".")){
            displayText = (parsedValue+"").rtrim(".")+".";
        } 
        if(text.endsWith(",")){
            displayText = (parsedValue+"").rtrim(",")+",";
        }
        if(isFocused && (text.contains('.') || text.contains(',') || text.contains("00"))){
            displayText = text;
        }
    }
    let hasLabel = label && (isShadowMode || isNormalMode || alwaysUseLabel || text || (isFocused || (!usePlaceholderWhenEmpty && canValueBeFormattable)))? true : labelText !== placeholder;
    const innerRef = React.useRef(null);
    const componentRef = React.useMergeRefs(innerRef,ref,setRef);
    validType = defaultStr(validType,validRule).toLowerCase();
    multiline = isFilter ? false : defaultBool(multiline,multiple,!!numberOfLines);
    let inputColor = (isFocused || error) ? labelColor : Colors.isValid(color)?color : theme.colors.text;
    if(!isFocused &&  !displayText && !error){
        inputColor = placeholderColor;
    }
    if(!isEditable){
        //inputColor = disabledColor;
    }
    const isMob = isMobileMedia();
    const borderWidth = outlined !== false ? (isFocused ? 2: 1):0;
    const _height = typeof flattenStyle.height == 'number' && flattenStyle.height > 20 ?  flattenStyle.height : HEIGHT;
    const tHeight = _height;//isShadowMode ?  (_height+(isMobileNative()?10:0)) : isNormalMode ? (_height-10) : _height;
    const heightRef = React.useRef(multiline?MULTIPLE_HEIGHT:tHeight);
    //const lineHeightRef = React.useRef(0);
    roundness = typeof roundness =='number'? roundness : undefined;
    const borderRadius = isShadowMode ? (roundness || Math.max(tHeight/3,10)) : isOutlinedMode ? (roundness || 10) : 0;
    const borderColor = isFocused || error || disabled ? labelColor : Colors.setAlpha(theme.colors.text,0.2)
    const currentDefaultValue = alwaysUseLabel && displayText == emptyValue ? "" : displayText;
    const withAutoHeight = typeof autoHeight === 'boolean'? autoHeight : false;
    const height = withAutoHeight || multiline ? undefined : tHeight;
    const inputStyle2 = withAutoHeight || multiline ? {height : heightRef.current} : null;
    const containerStyle = StyleSheet.flatten(containerProps.style) || {};
    const inputProps= {
        caretHidden : false,
        ellipsizeMode : "head",
        testID : testID+"_Input",
        keyboardAppearance : theme.isDark()? 'dark': 'default',
        caretHidden : false,
        ...props,
        innerRef:componentRef,
        placeholder : (isFocused || isShadowMode || isNormalMode) && labelText ? "":placeholder,
        placeholderTextColor : error ? theme.colors.error : placeholderColor,
        selectionColor,
        onKeyPress : (e)=>{
            if(props.onKeyPress){
                props.onKeyPress(e);
            }
            if(!isFocused){
                setInputState({...inputState,focused:true,touched:true});
            }
        },
        onBlur : (e)=>{
            setInputState({...inputState,touched: true,focused:false})
            const txt = defaultStr(text).trim();
            if((txt.length <=1 && !error)){
                if(validType.contains("unique") || validType.contains("required")){
                    callOnChange(toCase(txt));
                }
            }
            if(props.onBlur){
                props.onBlur(e);
            }
        },
        onFocus : (e)=>{
            setInputState({...inputState,touched: true,focused:true});
            if(props.onFocus){
                props.onFocus(e);
            }
        },

        disabled,
        readOnly : readOnly || !isEditable,
        error : !!error,
        mode,
        underlineColor,
        activeUnderlineColor,
        multiline,
        style : [
            flattenStyle,
            {
                backgroundColor : 'transparent',
                color : !error && !isFocused && Colors.isValid(flattenStyle.color)?flattenStyle.color : inputColor,
                fontSize,
                verticalAlign: 'center',//multiline ? 'top' : 'center',
                overflow : 'hidden',
            },
            isWeb && { outline: 'none'},
            disabledStyle,
            {height},
            readOnly || disabled && theme.styles.cursorNotAllowed,
            inputStyle2,
            isNormalMode && styles.inputNormalMode,
            isShadowMode && styles.inputShadowMode,
            //isShadowMode && multiline && {minHeight:heightRef.current},
            multiline && {paddingTop : isFlatMode? 12 : 7},
        ],
        secureTextEntry,
        inputMode,
        autoCapitalize : upper?(isAndroid?'characters':"none"):autoCapitalize,
        value : currentDefaultValue,
        realValue : text,
        formattedValue,
        displayText,
        parsedValue,
        rows:numberOfLines,
        onContentSizeChange : (e,...rest) => {
            if(typeof onContentSizeChange ==='function' && onContentSizeChange(e,...rest) === false)  return;
            if(multiline){
                heightRef.current = e.nativeEvent.contentSize.height;
                setToggle(!toggle);
            }
        },
        onChange : ({ nativeEvent: {target, text:text2} }) => {
            if(canValueBeDecimal && (text2 && !text2.isNumber() && !text2.endsWith(".") && !text2.endsWith(","))) {
                return;
            }
            if(canValueBeDecimal && isFocused && (text2 ==='.'|| text2 =='.')){
                text2 = "0"+text2;
            }
            const tVal = toCase(text2);
            if(tVal !== text){
                if(multiline && tVal.toLowerCase()+"\n" === text.toLowerCase()){
                    heightRef.current = Math.max(heightRef.current - 16,MULTIPLE_HEIGHT);
                }
                setText(text2,true);
                callOnChange(tVal);
            }
        },
        selection,
    }
    const isDesktop =  isDesktopMedia();
    const iconProps = {style:{color:inputColor},color:inputColor};
    right = typeof right ==='function'?right(iconProps) : right;
    left = typeof left =='function'? left(iconProps) : left;
    let hasRight = React.isValidElement(right),hasLeft = React.isValidElement(left);
    enableCopy = enableCopy ? true : false;
    fieldToCopy = defaultStr(fieldToCopy).toLowerCase().trim();
    if(isEditable ||  isFilter || defaultStr(containerStyle.pointerEvents).toLowerCase().contains("none")){
        enableCopy = false;
    }
    if(enableCopy){
        let valueToCopy = canValueBeDecimal ? parsedValue : displayText;
        if(fieldToCopy.contains("real")){
            valueToCopy = text;
        }
        valueToCopy +="";
        right = <>
            {React.isValidElement(right)? right:null}
            {valueToCopy?<Icon
                {...iconProps}
                title = {"Copier la valeur ["+valueToCopy+"] dans le presse papier"}
                icon = {COPY_ICON}
                onPress = {(e)=>{
                    /*if(selectFieldToCopy){
                        return DialogProvider.open({
                            title : 'Valeur à copier',
                            fullScreen : false,
                            content : <SimpleSelect
                                label = {"Valeur"}
                                items = {{
                                    parsedValue,
                                    displayText,
                                    text,
                                }}
                                itemValue = {({item,index})=>item}
                                onChange = {({item,value})=>{
                                    DialogProvider.close();
                                    return copyTextToClipboard(item);
                                }}
                            />,
                            actions : [{
                                text : 'Annuler',
                                secondary : true,
                                onPress : DialogProvider.close
                            }]
                        })
                    }*/
                    copyTextToClipboard(valueToCopy);
                }}
            />:null}
        </>
    }
    hasRight = hasRight || React.isValidElement(right)? true : false;
    affix = isFilter || multiline ? false : typeof affix =='boolean'? affix : true;
    let affixContent = null;
    if(isSecureText && !disabled){
        right =  <Icon 
            {...iconProps}
            disabled = {!isEditable}
            forceTextInputFocus={false}
            accessibilityLabel ={!secureTextEntry?"Cliquez pour masquer le contenu":"Cliquez pour afficher le contenu"} 
            icon={secureTextEntry?'eye-off':'eye'}
            onPress={()=>{
                setSecureTextEntry(!secureTextEntry);
            }}
        />
        hasRight = true;
    } else {
        if(isFocused && !disabled){
            if(!canValueBeDecimal){
                let aff = isNonNullString(text)? text.length.formatNumber(): "";
                if(isNumber(maxLength) && aff){
                    aff += ((isNumber(length)?"-":"/")+maxLength.formatNumber());
                }
                affixContent = <Label disabled={!isEditable} children={defaultStr(affix,aff)} style={[styles.affix,multiline && styles.affixMultiline,{color:theme.colors.primaryOnSurface},iconProps.style,affixStyle,!hasRight && !isFlatMode && styles.affixOnly]} />;
                if(affix){
                    right = hasRight ? <>{affixContent}{right}</> : affixContent;
                }
            }
        } else affix = undefined;
    }
    elevation = defaultNumber(contentContainerProps.elevation,elevation,isShadowMode?4:0);
    const paddingVertical = multiline ? 0 : (hasRight || hasLeft)? isMob?5 : 0 : 10;
    const contentContainerStyle = isOutlinedMode ? {
        borderColor,
        borderWidth,
        borderRadius,
    } : isShadowMode ? {
        marginHorizontal  : 0,
        paddingLeft : 10,
        paddingRight : 0,
        marginVertical : 0,
        borderColor,// : 'transparent',
        borderRadius,
        borderWidth,
        backgroundColor,
    } : isNormalMode ?{
        borderColor,
        borderRadius : 0,
        paddingHorizontal : 10,
        borderWidth : borderWidth,
    } :  {
        borderColor,
        //paddingLeft : 0,
        borderBottomWidth : divider !== false ? borderWidth : 0,
        paddingHorizontal : PADDING_HORIZONTAL_FLAT_MODE,
    }
    contentContainerStyle.backgroundColor = backgroundColor;
    if(!height){
        contentContainerStyle.paddingVertical = paddingVertical;
    }
    const children = typeof customChildren =='function'? customChildren(iconProps) : customChildren;
    return (
        <View testID={testID+"_Container"} {...containerProps} style={[styles.container,containerProps.style]}>
            {hasLabel? <Label
                ellipsizeMode = {"tail"}
                numberOfLines = {1}
                testID={testID+"_Label"}
                {...labelProps}
                disabled={!isEditable && !isOutlinedMode ? true : false}
                style={[
                    styles.label,
                    isOutlinedMode ? styles.labelOutlined : styles.labelFlat,
                    labelProps.style,
                    (isFocused) && styles.focusedLabel,
                    isFlatMode && (isFocused) &&  {fontSize},
                    isFlatMode && {paddingHorizontal : PADDING_HORIZONTAL_FLAT_MODE},
                    isNormalMode || isShadowMode && {fontSize},
                    {color:labelColor},
                    isOutlinedMode && {paddingHorizontal:5,backgroundColor},
                    isShadowMode && styles.labelShadow,
                    isNormalMode && styles.labelNormal,
                    labelStyle,
                ]}
                >
                {label}
            </Label> : null}
            <>
                <Surface testID={testID+"_ContentContainer"}  {...contentContainerProps} elevation={elevation}  style={[styles.contentContainer,{pointerEvents},!left? styles.paddingLeft:null,styles.row,contentContainerStyle,contentContainerProps.style]}>
                    {left ? (<View testID={testID+"_Left"} {...leftContainerProps} style={[styles.AdornmentContainer,styles.leftAdornment,leftContainerProps.style,disabledStyle]}>
                        {left}
                    </View>) : null}
                    <KeyboardAvoidingView testID={testID+"_Content"} {...contentProps} style={[styles.inputWrapper,contentProps.style,disabledStyle]}>
                        {
                            typeof render ==="function"? render(inputProps):
                             <RNTextInput 
                                {...inputProps}
                                ref = {componentRef}
                            /> 
                        }
                    </KeyboardAvoidingView>
                    {right ? (<View testID={testID+"_Right"} {...rightContainerProps} style={[styles.AdornmentContainer,styles.rightAdornment,rightContainerProps.style,disabledStyle]}>
                        {right}
                    </View>) : null}
                </Surface>
                <View testID={testID+"_Children"} style={[styles.children,disabledStyle]}>
                    {React.isValidElement(children)? children : null}
                </View>
                {<View testID={testID+"_AffixContainer"} style={styles.affixContainer}>
                    {multiline && !error && !helperText ? affixContent:null}
                    <HelperText style={[isDesktop && styles.helperTextAbsolute]} testID={testID+"_HelperText"} error={error} disabled={!isEditable}>{helperText}</HelperText>
                </View>}
            </>
        </View>
    );    
});
TextFieldComponent.displayName = "TextFieldComponent";
export default TextFieldComponent;
const styles = StyleSheet.create({
    children : {
        width : '100%',
        flexDirection:'column',
        flexWrap : 'wrap'
    },
    container: {
        width: "100%",
        marginVertical : 8,
        padding : 0,
        alignSelf : 'center',
        justifyContent : 'center',
        alignItems : 'flex-start'
    },
    row : {
        flexDirection:'row',
    },
    contentContainer : {
        width : '100%',
        position : 'relative',
        paddingVertical : 0,
        paddingHorizontal : 0,
        marginHorizontal : 0,
        marginVertical : 0,
        justifyContent : 'center',
        alignSelf : 'center',
        alignItems : 'center',
    },
    paddingLeft : {
        paddingLeft : 10,
    },
    input : {
        paddingVertical : 0,
        marginVertical : 0,
        marginHorizontal : 0,
        paddingHorizontal : 0,
        maxWidth : '100%'
    },
    label: {
        //...StyleSheet.absoluteFill,
        paddingHorizontal : 0,
        position : 'absolute',
        zIndex : 10,
        top : -6,
        left:0,
    },
    labelShadow : {
        position:'relative',
        marginBottom : 2,
        marginHorizontal:10,
        fontWeight : '400',
        top : 0,
        left : 0,
    },
    labelNormal : {
        position:'relative',
        marginBottom : 2,
        marginHorizontal:2,
        top : 0,
        left : 0,
    },
    labelOutlined : {
        top : -10,
        left : 5,
    },
    labelFlat : {
    },
    inputWrapper : {
        flex:1,
        flexGrow:1
    },
    affix : {
        paddingHorizontal:0,
        marginHorizontal : 0,
        marginLeft : 5,
        fontSize:15
    },
    affixMultiline : {
        position : 'absolute',
        right : 0,
        top : 0,
    },
    affixContainer : {
        position : 'relative',
        width : '100%',
    },
    helperTextAbsolute : {
        position : 'absolute',
        left : 0,
        top : 0,
        flexWrap : 'wrap',
    },  
    affixOnly : {
        marginRight:7
    },
    leftAdornment : {
        flexGrow : 0,
        alignSelf : 'center',
        justifyContent : 'flex-start'
    },
    rightAdornment : {
        flexGrow : 0,
        alignSelf : 'center',
        justifyContent : 'flex-end'
    },
    w100 : {
        width : '100%'
    },
    AdornmentContainer : {
        alignSelf : 'center',
        alignItems : 'center',
        justifyContent : 'center',
        flexDirection : 'row',
        margin : 0,
        padding : 0,
    },
    inputShadowMode: {
        paddingHorizontal : 0,
        marginRight : 10,
        minHeight : 37,
        marginHorizontal : 0,
        marginVertical:0,
        paddingVertical:0,
    },
    inputNormalMode : {
        paddingHorizontal : 10,
        minHeight : 37,
        marginHorizontal : 0,
        marginVertical:0,
        paddingVertical:0,
    },
})

TextFieldComponent.propTypes = {
    ...defaultObj(TextInput.propTypes),
    children : PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.func,
    ]),
    useReadOnlyOpacity : PropTypes.bool,
    selectFieldToCopy : PropTypes.bool,
    enableCopy : PropTypes.bool, //si l' on pourra copier le contenu du champ textuel
    fieldToCopy : PropTypes.string, /// la valeur à copier : displayValue, value, parsedValue
    //la fonction permettant de formatter la valeur, pour les valeurs formattables
    formatValue : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.bool,///si booléan alors la valeur ne pourra pas être formattable;
    ]),
    format : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
    ]),
    left : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.node,
    ]),
    right : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.node,
    ]),
    autoHeight : PropTypes.bool,///si la taille sera automatique
    alwaysUseLabel : PropTypes.bool,//si l'on utilisera toujours le label quel qu'en soit le cas
    containerProps : PropTypes.object,//les props du container au composant TextField
    contentContainerProps : PropTypes.object,///les props du container parent direct au text input
    contentProps : PropTypes.object,///les props du container immédia à l'input
    rightContainerProps : PropTypes.object,
    leftContainerProps : PropTypes.object,
    defaultValue : PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    upper : PropTypes.bool,
    upperCase : PropTypes.bool,
    lower : PropTypes.bool,
    lowerCase : PropTypes.bool,
    outlined : PropTypes.bool,//si le textField prendra en compte le outline
    roundness : PropTypes.number,///l'épaisseur du border radius, lorsque le mode est de type outlined
    usePlaceholderWhenEmpty : PropTypes.bool,//si la valeur du placeholder sera utilée, lorsque la valeur du champ de type formatable est nulle ou égale à la valeur vide
    emptyValue : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),///la valeur par défaut considérée comme vide ou nulle
    /*** si un contenu de droite sera affiché, ie, le nombre d'éléments du champ de texte lorsqu'on remplit sera affiché */
    affix : PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.string,
    ]),
    ///le style à afficher sur l'affix
    affixStyle : PropTypes.object,
    //handleOpacity : PropTypes.bool,///si l'opacité sera géré automatiquement en fonction du status disabled de la textField
    toCase : PropTypes.func,
};

