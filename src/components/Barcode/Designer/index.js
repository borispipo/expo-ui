import React,{useRef,useState,forwardRef,useMergeRefs,useEffect,useMemo} from "$react";
import Generator from "../Generator";
import PropTypes from "prop-types";
import View from "$ecomponents/View";
import { barcodeFormats,defaultBarcodeFormat } from "../Generator/utils";
import SimpleSelect from "$ecomponents/SimpleSelect";
import { isNonNullString,defaultStr,defaultNumber,defaultObj } from "$cutils";
import notify from "$cnotify";
import TextField from "$ecomponents/TextField";
import theme from "$theme";
import Surface from "$ecomponents/Surface";
import Dimensions from "$cdimensions";
import Divider from "$ecomponents/Divider";
import Label from "$ecomponents/Label";
import Switch from "$ecomponents/Switch";
import Icon from "$ecomponents/Icon";
import Color from "$ecomponents/Color";
import Expandable from "$ecomponents/Expandable";
import session from "$session";
const sessionKey = "appDesigner-sess"
import { encode } from "../Generator/utils";

const fontOptionsKeys = ["bold","italic","bold italic"];
const alignments = ["left","center","right"];

const BarcodeDesigner = forwardRef(({
        format,testID,onReady,text,value,flat,onChange,width,height,displayValue,fontOptions,font,textAlign,textPosition,textMargin,fontSize,background,lineColor,margin,marginTop,marginBottom,marginLeft,marginRight,
        sessionName,
        bottomContent,
        leftContent,
        rightContent,
        topContent,
        saveAction,
        ...rest
    },ref)=>{
    testID = defaultStr(testID,'RNBarcodeDesigner');
    const sKey = sessionName ? `${sessionKey}-${sessionName}` : null;
    const sData = !isNonNullString(sessionName)? {} : defaultObj(session.get(sKey));
    Dimensions.useWindowDimensions();
    const innerRef = useRef(null);
    const sFormat = !isNonNullString(format) || !barcodeFormats.includes(format) ? isNonNullString(sData.format) && barcodeFormats.includes(sData.format) ? sData.format : defaultBarcodeFormat : format;
    const sHeight = defaultNumber(height,sData.height,100), sWidth = defaultNumber(width,sData.w100,2), sDisplayValue = typeof displayValue =='boolean'? displayValue :sData.displayValue !== undefined ? !!sData.displayValue:true;
    const sFontOptions = isNonNullString(fontOptions) && fontOptionsKeys.includes(fontOptions) ?  fontOptions : isNonNullString(sData.fontOptions) && fontOptionsKeys.includes(sData?.fontOptions) ? sData.fontOptions : "bold";
    const sTextAlign = isNonNullString(textAlign) && alignments.includes(textAlign)? textAlign : isNonNullString(sData.textAlign) && alignments.includes(sData.textAlign)? sData.textAlign : "center";
    const sTextPosition = isNonNullString(textPosition) && ["top","bottom"].includes(textPosition) ? textPosition : isNonNullString(sData.textPosition) && ["top","bottom"].includes(sData.textPosition) ? sData.textPosition : "bottom";
    const sFontSize = typeof fontSize ==='number'? fontSize : typeof sData.fontSize ==='number'? sData.fontSize : 20;
    const sLineColor  = theme.Colors.isValid(lineColor)? lineColor : theme.Colors.isValid(sData.lineColor)? sData?.linceColor:"#000000";
    const sBackground = theme.Colors.isValid(background)? background : theme.Colors.isValid(sData.background)? sData.background : "#ffffff";
    const sTextMargin = typeof textMargin =='number'? textMargin : typeof sData.textMargin =='number'? sData.textMargin : 2;
    const sValue = isNonNullString(value)? value : isNonNullString(sData.value)? sData.value : "";
    const sMargins = {};
    Object.map({marginTop,marginBottom,marginLeft,marginRight},(val,k)=>{
        sMargins[k] = typeof v =='number'? v : typeof sData[k] == null ? sData[k] : 10;
    });
    const marginKeys = Object.keys(sMargins);
    const [state,setState] = useState({
        format : sFormat,height:sHeight,width : sWidth,value:sValue,displayValue :sDisplayValue,fontOptions : sFontOptions,textAlign:sTextAlign,
        textPosition : sTextPosition,fontSize : sFontSize,lineColor:sLineColor,background:sBackground,textMargin:sTextMargin,...sMargins
    });
    useEffect(()=>{
        if(sessionName){
            session.set(sKey,state);
        }
        if(typeof onChange =='function'){
            onChange({data:state,state,setState});
        }
    },[state]);
    const isValid = encode(state)!==null;
    const args = {state,setState,sessionName,isValid,isMobile,isTablet,isDesktop,getState:()=>state,getData:()=>state};
    leftContent = typeof leftContent =='function'? leftContent(args) : leftContent;
    rightContent = typeof rightContent =='function'? rightContent(args) : rightContent;
    bottomContent = typeof bottomContent =='function'? bottomContent(args) : bottomContent;
    topContent = typeof topContent =='function'? topContent(args) : topContent;
    saveAction = typeof saveAction =='function'? saveAction(args) : saveAction;
    const isMobile = Dimensions.isMobileMedia(),isTablet= Dimensions.isTabletMedia(),isDesktop= Dimensions.isDesktopMedia();
    const cellProps = {}
    const inputProps = {mode:"flat",affix:false,style:{width:"100%",paddingLeft:10},labelProps:{style:{paddingLeft:10}},containerProps:{style:[]}}
    return <Surface {...rest} testID={testID} style={[theme.styles.w100,theme.styles.p2,rest.style]}>
        <View testID={testID+"SurfaceContent"} style={[isMobile || isTablet && {flexDirection:"column"},{justifyContent:"flex-start",alignItems:"flex-start"},isDesktop && {flexDirection:"row"}]}>
            <View elevation={isDesktop?5:0} testID={`${testID}_SettingsContainer`} style={[{paddingHorizontal:5},isDesktop? {width:400,marginRight:10,paddingBottom:20,borderColor:theme.colors.divider,borderWidth:1}:{width:"100%"}]}>
                <Expandable defaultExpanded title={<View style={[theme.styles.row,theme.styles.flexWrap,theme.styles.alignItemsCenter,theme.styles.justifyContentSpaceBetween]}>
                    <Label primary textBold fontSize={15} children={"Options du Designer"}/>
                    {React.isValidElement(saveAction)? saveAction : null}
                </View>}>
                    <View {...cellProps}>
                        <TextField
                            {...inputProps}
                            label = {"Valeur de test"}
                            defaultValue = {state.value}
                            onChange = {({value})=>{
                                setState({...state,value});
                            }}
                        />
                    </View>
                    <View {...cellProps}>
                        <SimpleSelect
                            inputProps = {inputProps}
                            items ={barcodeFormats}
                            label = {"Format du code"}
                            defaultValue = {state.format}
                            itemValue = {({item,index})=>item}
                            renderItem = {({item,index})=>item}
                            onChange = {({value})=>{
                                if(!value) return notify.error("Merci de sélectionner un format");
                                if(value === state.format) return;
                                setState({...state,format:value});
                            }}
                         /> 
                    </View>
                    <View {...cellProps}>
                        <TextField
                            {...inputProps}
                            label = {"Hauteur des barres"}
                            type ="number"
                            defaultValue = {state.height}
                            onChange = {({value})=>{
                                setState({...state,height:value});
                            }}
                        />
                    </View>
                    <View {...cellProps}>
                        <TextField
                            {...inputProps}
                            type ="number"
                            label = {"Longueur des barres"}
                            defaultValue = {state.width}
                            onChange = {({value})=>{
                                setState({...state,width:value});
                            }}
                        />
                    </View>
                    <View {...cellProps}>
                        <Switch
                            label = {"Afficher la valeur"}
                            defaultValue = {state.displayValue}
                            onChange = {({value})=>{
                                setState({...state,displayValue:value});
                            }}
                        />
                    </View>
                    <View {...cellProps}>
                        <SimpleSelect
                            inputProps = {inputProps}
                            items ={[{code:"bold",label:"Gras"},{code:"bold italic",label:"Gras, Italic"},{code:"italic",label:"Italic"}]}
                            label = {"Police de texte"}
                            defaultValue = {state.fontOptions}
                            itemValue = {({item,index})=>item.code}
                            renderItem = {({item,index})=>item.label}
                            onChange = {({value})=>{
                                if(value === state.fontOptions) return;
                                setState({...state,fontOptions:value});
                            }}
                         /> 
                    </View>
                    <View {...cellProps}>
                        <SimpleSelect
                            inputProps = {inputProps}
                            items ={[{code:"left",label:"A gauche"},{code:"center",label:"Au centre"},{code:"right",label:"A droite"}]}
                            label = {"Aligner le texte"}
                            defaultValue = {state.textAlign}
                            itemValue = {({item,index})=>item.code}
                            renderItem = {({item,index})=>item.label}
                            onChange = {({value})=>{
                                if(value === state.textAlign) return;
                                setState({...state,textAlign:value});
                            }}
                         /> 
                    </View>
                    <View {...cellProps}>
                        <SimpleSelect
                            inputProps = {inputProps}
                            items ={[{code:"top",label:"En haut"},{code:"bottom",label:"En bas"}]}
                            label = {"Postion du texte"}
                            defaultValue = {state.textPosition}
                            itemValue = {({item,index})=>item.code}
                            renderItem = {({item,index})=>item.label}
                            onChange = {({value})=>{
                                if(value === state.textPosition) return;
                                setState({...state,textPosition:value});
                            }}
                         /> 
                    </View>
                    <View {...cellProps}>
                        <TextField
                            {...inputProps}
                            type ="number"
                            label = {"Police du texte"}
                            defaultValue = {state.fontSize}
                            onChange = {({value})=>{
                                if(state.fontSize === value) return;
                                setState({...state,fontSize:value});
                            }}
                        />
                    </View>
                    <View {...cellProps}>
                        <Color
                            {...inputProps}
                            label = {"Couleur de texte|ligne"}
                            defaultValue = {state.lineColor}
                            onChange = {({value})=>{
                                if(state.lineColor === value) return;
                                setState({...state,lineColor:value});
                            }}
                        />
                    </View>
                    <View {...cellProps}>
                        <Color
                            {...inputProps}
                            label = {"Couleur d'arrière plan"}
                            defaultValue = {state.background}
                            onChange = {({value})=>{
                                if(state.background === value) return;
                                setState({...state,background:value});
                            }}
                        />
                    </View>
                    <View {...cellProps}>
                        <TextField
                            {...inputProps}
                            type ="number"
                            label = {"Espace entre texte de code barre"}
                            tooltip = {"Spécifiez l'espace entre le texte et le code barre généré"}
                            defaultValue = {state.textMargin}
                            onChange = {({value})=>{
                                if(state.textMargin === value) return;
                                setState({...state,textMargin:value});
                            }}
                        />
                    </View>
                    {marginKeys.map((m)=>{
                        const ml = m.toLowerCase();
                        const label = ml.includes("top")? "Haut" : ml.includes("bottom") ?  "Bas" : ml.includes("right") ? "Droite" : "Gauche";
                        return <TextField
                            {...inputProps}
                            key = {m}
                            type ="number"
                            label = {`Marge ${label}`}
                            title = {`Spécifiez l'espace laissé en ${label} après le code barre`}
                            defaultValue = {state.fontSize}
                            onChange = {({value})=>{
                                if(state[m] === value) return;
                                setState({...state,[m]:value});
                            }}
                        />
                    })}
                </Expandable>
            </View>
            <View testID={`${testID}_DesignerContainer`} style={[!isDesktop && {width:"100%"},{flexDirection:"column"},theme.styles.p1]}> 
                 {React.isValidElement(topContent)? topContent : null}
                 <View testID={testID+"_DesignerContent"} style={[theme.styles.w100,theme.styles.row,theme.styles.justifyContentFlexStart,theme.styles.alignItemsFlexCenter]}>
                    {React.isValidElement(leftContent)? leftContent : null}
                    <Generator
                        {...state}
                        displayValue = {!!state.displayValue}
                        autoConvertToDataURL = {false}
                        ref = {useMergeRefs(ref,innerRef)}
                    />
                    {React.isValidElement(rightContent) ?rightContent : null}
                </View>
                {React.isValidElement(bottomContent) ? bottomContent : null}
            </View>
        </View>
    </Surface>
});
const contentType = PropTypes.oneOfType([PropTypes.func,PropTypes.node]);
export const barcodeSetingsFields = {
    sessionName : PropTypes.string,
    format : PropTypes.oneOf(barcodeFormats),
    width : PropTypes.number, //The width option is the width of a single bar., default : 2
    height : PropTypes.number,//The height of the barcode., default 100,
    text : PropTypes.string, //Overide the text that is diplayed
    displayValue : PropTypes.bool,
    fontOptions : PropTypes.string,//With fontOptions you can add bold or italic text to the barcode.
    font : PropTypes.string,
    textAlign : PropTypes.oneOf(["center","left","right"]), //Set the horizontal alignment of the text. Can be left / center / right.
    textPosition : PropTypes.oneOf(["bottom","top"]),//Set the vertical position of the text. Can be bottom / top., default bottom
    textMargin : PropTypes.number,//default : 2, Set the space between the barcode and the text.
    fontSize : PropTypes.number,//Set the size of the text., default : 20,
    flat : PropTypes.bool, //Only for EAN8/EAN13
    background : PropTypes.string,//Set the background of the barcode., default #ffffff
    lineColor: PropTypes.string,//Set the color of the bars and the text., default #000000
    margin : PropTypes.number,//deafult : 10, Set the space margin around the barcode. If nothing else is set, all side will inherit the margins property but can be replaced if you want to set them separably.
    marginTop : PropTypes.number,
    marginBottom : PropTypes.number,
    marginLeft : PropTypes.number,
    marginRight : PropTypes.number,
    onChange : PropTypes.func,
    topContent : contentType, //le contenu de l'élément à rendre en haut du Générateur
    bottomContent : contentType,//le contenu de l'élément à rendre en haut du content
    leftContent : contentType,
    saveAction : contentType,
    rightContent : contentType, //le contenu à render à droite du générateur
}

BarcodeDesigner.displayName = "BarcodeDesigner";

BarcodeDesigner.propTypes = {
    ...Generator.propTypes,
}

export default BarcodeDesigner;