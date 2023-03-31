import {isNativeMobile} from "$cplatform";
import View from "$ecomponents/View";
import React from "$react";
import theme,{remToPixel,Colors,flattenStyle} from '$theme';
import {StyleSheet} from "react-native";
import {defaultStr,defaultObj,defaultNumber} from "$cutils";
import LogoComponent from "$logoComponent";

export const height = 150;
export const width = undefined;//300;
export default function Logo (props) {
    let {icon,color,style,testID,containerProps,smallStyle,largeStyle,mediumStyle,height:customHeight,withImage,withText} = props;
        testID = defaultStr(testID,"RN_LogoComponent");
        containerProps = defaultObj(containerProps);
        customHeight  =defaultNumber(customHeight,height);
        const hasHeight = customHeight && customHeight != height? true : false;
        const styles = getStyle({style,color,height:hasHeight?customHeight:undefined,smallStyle,largeStyle,mediumStyle});
        let logoImage = null,img,txt=null,hasTwice = false;
        if(LogoComponent){
            hasTwice = React.isComponent(LogoComponent.Image) && React.isComponent(LogoComponent.Text);
            if(!hasTwice){
                logoImage = React.isValidElement(LogoComponent)? LogoComponent : React.isComponent(LogoComponent)? <LogoComponent {...props} style={styles.logoContent} testID={testID+"_Content"} styles={styles}/> : null;
            } else {
                img = icon !== false ? <View testID={testID+"_ContentContainer"} style={styles.logoImage}>
                    <LogoComponent.Image styles={styles}/>
                </View> : null;
                txt = withText !== false && React.isComponent(LogoComponent.Text) ? <LogoComponent.Text style={styles.logoContent} styles={styles}/> : null;
            }
        }
        return <View testID={testID} style={[styles.container,hasHeight && {height:customHeight}]}> 
            {hasTwice && withImage !== false ? img : null}
            {hasTwice? txt : null}
            {!hasTwice ? logoImage : null}
        </View>
}   

const getStyle = ({style,color,height:customHeight,smallStyle,mediumStyle,largeStyle})=>{
    const cColor = flattenStyle([{color:Colors.isValid(color)? color : theme.colors.primaryOnSurface}]);
    let size = 5;
    if(typeof customHeight =='number' && customHeight <= customHeight){
        const divider = Math.min(size,Math.max(Math.ceil(height/customHeight),2));
        size = divider <= 2 ? 2 : divider;
    }
    let smallSize = size/2, medium = (3/4)*size;
    return  {
        ...styles,
        container : flattenStyle([styles.container,style]),
        large : flattenStyle([styles.large,styles.large,{color:theme.colors.secondaryOnSurface,fontSize:remToPixel(size)},largeStyle]),
        medium : flattenStyle([styles.medium,cColor,{fontSize:remToPixel(medium)},mediumStyle]),
        small : flattenStyle([styles.small,cColor,styles.small,{fontSize:remToPixel(smallSize)},smallStyle]),
    };
}


const styles = StyleSheet.create({
    container : {
        flex : 1,
        justifyContent : "center",
        alignItems : "center",
        flexDirection : "row",
        maxHeight:height,
        width,
    },
    logoImage : {
        marginTop : 0,
        marginRight:0,
        justifyContent : 'center',
        alignItems : 'flex-end'
    },
    logoImageContent : {
        alignItems:"flex-end",
        justifyContent : "center"
    },  
    logoContent : {
        position:"relative",
        flexDirection : "row",
        alignItems : "center",
        justifyContent : "flex-start"
    },
    small : {
        fontSize:remToPixel(2.5),
        marginLeft:isNativeMobile()? -15 : -10
    },
    medium : {
        fontSize:remToPixel(3),
    },
    large : {
        fontSize : remToPixel(5),
        alignItems : "flex-start",
        justifyContent : "center",
        marginTop: 0
    },
})

Logo.height = height;
Logo.width = width;
Logo.displayName = "ExpoLogoComponent";