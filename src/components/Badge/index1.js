import {Badge} from "react-native-paper";
import {StyleSheet} from "react-native";
const defaultSize = 20;
import {isNativeMobile} from "$cplatfrom";

export default function BadgeComponent(props){
    let {size,style,...rest} = props;
    size = defaultDecimal(size,defaultSize);
    return <Badge
        {...rest}
        size = {size}
        style = {[
            styles.badge,
            style,
            styles.center,
            {width:size,height:size}
        ]}
    />
}

const styles = StyleSheet.create({
    badge : {
        paddingVertical : 0,
        marginVertical : 0,
        fontSize : isNativeMobile ? 12 : 11,
    },
    center : {
        justifyContent : 'center',
        paddingHorizontal:0,
        paddingVertical : 0,
        alignItems : 'center',
        alignSelf:'center'
    },
})