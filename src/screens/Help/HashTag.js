import templates from "$ecomponents/Form/Fields/sprintfSelectors";
import Icon from "$ecomponents/Icon";
import View from "$ecomponents/View";
import Label from "$ecomponents/Label";
import Screen from "$screen";
import Br from "$ecomponents/Br";
import Grid from "$ecomponents/Grid";
import theme from "$theme";

export default function HashTagHelpScreen (props){
    const icon = <Icon name="format-header-pound" primary textBold cursorPointer/>;
    const rowStyle = [{width:150}];
    const borderStyle = {borderWidth:1,borderColor:theme.colors.divider};
    return <Screen withScrollView {...props}>
        <View style={[theme.styles.p1,theme.styles.w100]}>
            <Label primary textBold>
                Rubrique d'aide SALITE relative aux HashTags.
            </Label>
            <View>
                <Label>
                    Les hashtag permettent de créer des liens vers les documents de stocks, ventes, achats, .... dans un contenu de type chaine de caractère.
                </Label>
                <Label>
                    Ils peuvent être insérés dans de tout type de champ portant l'icone ci-dessous à droite
                </Label>
                {icon} 
                <Label>
                    A chaque fois que vous rencontrez un champ de texte portant cette icone, il est possible d'insérer un hastag lors de la saisie des informations du champ de type texte.
                    Pour insérer un hastag, il suffit tout simplement d'insérer dans le texte l'une des valeur du code situé dans le tableau suivant et de cliquer
                    sur l'icone en question où d'éffectuer la combinaison des touches clavier : ctr+m
                </Label>
                <Br/>
                <Label primary textBold>Liste des code hashtag suppportés par l'application</Label>
                <Br/>
            </View>
            <View style={[theme.styles.w100]}>
                <Grid.Row style={[borderStyle]}>
                    <Label textBold style={[rowStyle[0]]}>Code</Label>
                    <Label textBold>Signification</Label>
                </Grid.Row>
                {
                    Object.mapToArray(templates,(t,i)=>{
                        if(isObj(t)){
                            t = defaultStr(t.desc,t.title);
                        }
                        if(!isNonNullString(t)) return null;
                        return <Grid.Row style={[borderStyle]} key={i}>
                            <Label primary textBold style={[rowStyle[0]]}>{i}</Label>
                            <Label splitText numberOfLines={3}>{t}</Label>
                        </Grid.Row>
                    })
                }
            </View>
        </View>
    </Screen>
}

export const screenName = HashTagHelpScreen.screenName = "Help/Hashtag";
export const title = HashTagHelpScreen.title = "Hashtags : Aide".toUpperCase();

HashTagHelpScreen.Modal = true;