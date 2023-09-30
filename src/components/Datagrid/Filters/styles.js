import { StyleSheet } from "react-native";
import theme from '$theme';

const styles = StyleSheet.create({
    menuItem : {
        borderRadius : 7,
        margin : 5,
        paddingHorizontal : 10,
        paddingVertical : 2,
    },
    hidden : {
        display : "none",
        opacity : 0,
    },
    filterLabel : {
        fontSize:13,
        marginRight : 7,
    },
    filterContainer : {
        width : undefined,
    },
});

export const getMenuStyle = (style)=>([styles.menuItem,{backgroundColor:theme.colors.surface},style]);

export default styles;