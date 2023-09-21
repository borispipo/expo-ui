import Screen from "$escreen";
import View from "$ecomponents/View";
import Label from "$ecomponents/Label";
import appConfig from "$capp/config";
import theme from "$theme";
import Link from "$ecomponents/Link";
import {StyleSheet} from "react-native";
import {H1,H2,H3,H4,H5,Paragraph} from "$ecomponents/Typography";

export default function ExpoUIHomeScreen (props){
    return  <Screen {...props}>
        <View style={theme.styles.p1}>
            <View testID="DocTestID" style={[theme.styles.alignItemsCenter]}>
                <H3 textBold primary style={theme.styles.h3}>Développez rapidement des applications mobile, web et desktop.</H3>
            </View>
            <View style={[theme.styles.row,theme.styles.flexWrap,theme.styles.rowGap05]}>
                <H5 primary textBold>{`${appConfig.name?.toLowerCase()}, version ${appConfig.version},  `}</H5>
                <Paragraph>Un framework Prêt à l'emploi multiplateforme (Mobile, web et desktop) construit sur la base du framework</Paragraph>
                <Link routeName={"https://docs.expo.dev/"}>
                    <H4 textBold>Expo</H4>
                </Link>
            </View>
        </View>
    </Screen>
}

ExpoUIHomeScreen.screenName = "Home";

ExpoUIHomeScreen.authRequired = true;

const styles = StyleSheet.create({
    
})