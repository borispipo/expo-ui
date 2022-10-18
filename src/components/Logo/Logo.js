import {IconButton } from "react-native-paper";
import { Component } from "react";
import {isNativeMobile} from "$cplatform";
import {Image} from "react-native";
import View from "$ecomponents/View";
import React from "$react";
import theme,{remToPixel,Colors,flattenStyle} from '$theme';
import {StyleSheet} from "react-native";
import source from "$assets/logo.png";
import {defaultStr} from "$utils";
import LogoComponent from "$logoComponent";

export const height = 150;
export const width = undefined;//300;
export default class Logo extends Component {
    render(props){
        let {icon,color,style,testID,logo,text} = this.props;
        testID = defaultStr(testID,"RN_LogoComponent");
        const styles = getStyle(style,color);
        return <View testID={testID} style={styles.container}> 
            {icon !== false ? <View testID={testID+"_ContentContainer"} style={styles.logoImage}>
                {<IconButton testID={testID+"_IconButton"} style={styles.logoImageContent} 
                    size={50}
                    icon={() => (
                        <Image
                          source={source}
                          style={{ width: 50, height: 50}}
                        />
                    )}
                />}
            </View> : null}
            {text !== false  && logo !== false ? (React.isValidElement(LogoComponent)? LogoComponent : React.isComponent(LogoComponent)? <LogoComponent {...props} style={styles.logoContent} testID={testID+"_Content"} styles={styles}/> : null) : null}
        </View>
    }
    
}

const getStyle = (style,color)=>{
    const cColor = flattenStyle([{color:Colors.isValid(color)? color : theme.colors.primary}]);
    return  {
        ...styles,
        container : flattenStyle([styles.container,cColor,style]),
        firstText : flattenStyle([styles.medium,cColor]),
        large : flattenStyle([styles.medium,styles.large,cColor]),
        small : flattenStyle([styles.medium,cColor,styles.small]),
    };
}


const styles = StyleSheet.create({
    container : {
        flex : 1,
        justifyContent : "center",
        alignItems : "center",
        flexDirection : "row",
        height,
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
        marginLeft:isNativeMobile()? -25 : -20
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