import { StyleSheet } from "react-native";
import theme from '$theme';

const styles = StyleSheet.create({
    menuItem : {
        borderRadius : 10,
    }
});

export const getMenuStyle = (style)=>([
    styles.menuItem,
    {backgroundColor:theme.surfaceBackground},
    style,
]);

export default styles;