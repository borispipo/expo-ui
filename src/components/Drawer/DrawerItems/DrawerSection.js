import View from "$ecomponents/View";
import {defaultObj,defaultBool} from "$cutils";
import Divider from "$ecomponents/Divider";
import Label from "$ecomponents/Label";
import theme,{Colors,tinyColor,ALPHA_OPACITY} from "$theme";
export default function DrawerSection ({children,divider,labelStyle,minimized,labelProps,withDivider,dividerProps,label,text,...rest}){
    label = defaultStr(label,text);
    if(!label) return children;
    dividerProps = defaultObj(dividerProps);
    labelProps = defaultObj(labelProps);
    rest = defaultObj(rest);
    let color = theme.colors.text;
    if(Colors.isValid(color)){
        color = tinyColor(color).setAlpha(ALPHA_OPACITY).toRgbString();
    } else color = undefined;
    return <View {...rest} style={[{marginVertical:0,marginBottom: 0,marginTop:5},rest.style]}>
        {label && (
             <Label
                numberOfLines={1}
                {...labelProps}
                style={[{justifyContent: 'center',color,marginLeft: minimized?5:16,paddingVertical:0,marginVertical:0,fontWeight:'bold'
                },labelProps.style,labelStyle,minimized?{
                    alignItems : 'center',
                    textAlign : 'center',
                }:null]}
            >
                {label}
         </Label>
        )}
        {children}
      {divider !== false? <Divider {...dividerProps} style={[{marginVertical:4,width:'100%'},dividerProps.style]}/> : null} 
    </View>
}