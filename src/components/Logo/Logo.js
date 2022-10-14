import {IconButton } from "react-native-paper";
import { Component } from "react";
import {isNativeMobile} from "$platform";
import {Image} from "react-native";
import View from "$components/View";
import Label from "$components/Label";
import theme,{remToPixel,Colors,flattenStyle} from '$theme';
import {StyleSheet} from "react-native";
import source from "$assets/logo.png";
import {defaultStr} from "$utils";

export const height = 150;
export const width = undefined;//300;
export default class Logo extends Component {
    render(props){
        let {icon,color,style,testID,text} = this.props;
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
            {text !== false ? <View testID={testID+"_Content"} style={styles.logoContent}>
                <Label style={styles.firstText}>XPose</Label>
                <Label style={styles.secondText}>F</Label>
                <Label style={styles.thirdText}>T</Label>
                <Label style={styles.fourthText}>C</Label>
            </View> : null}
        </View>
    }
    
}

const getStyle = (style,color)=>{
    const cColor = flattenStyle([{color:Colors.isValid(color)? color : theme.colors.primary}]);
    return  {
        ...styles,
        container : flattenStyle([styles.container,cColor,style]),
        firstText : flattenStyle([styles.text,cColor]),
        secondText : flattenStyle([styles.text,styles.secondText,cColor]),
        thirdText : flattenStyle([styles.text,cColor,styles.thirdText]),
        fourthText : flattenStyle([styles.text,cColor])
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
        //width : 160,
        //flex : 2,
        flexDirection : "row",
        alignItems : "center",
        justifyContent : "flex-start"
    },
    secondText : {
        fontSize : remToPixel(5),
        alignItems : "flex-start",
        justifyContent : "center",
        marginTop: 0//isNativeMobile() ? -5 : 0
    },
    thirdText : {
        fontSize:remToPixel(2.5),
        marginLeft:isNativeMobile()? -25 : -20
    },
    text : {
        fontSize:remToPixel(3),
    },
})

Logo.height = height;
Logo.width = width;