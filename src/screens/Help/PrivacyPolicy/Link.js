import Link from "$components/Link";
import {PRIVACY_POLICY} from "./routes";
import theme from "$theme";
import {StyleSheet} from "react-native";
import title from "./title";
import {defaultObj} from "$utils";
import Label from "$components/Label";
export default function(props){
    const {style,...rest} = props;
    return <Link routeName={PRIVACY_POLICY}>
        <Label {...defaultObj(rest)} style={[{color:theme.colors.primary},styles.content,style]}>
            {props.children || title}
        </Label>
    </Link>
}

const styles = StyleSheet.create({
     content : {
        textDecorationLine:'underline',
        fontWeight : 'bold',
     }
})