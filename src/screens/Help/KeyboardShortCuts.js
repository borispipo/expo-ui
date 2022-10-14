import shortcuts from "$components/Form/utils/keyboardShortcuts";
import Screen from "$screen";
import Grid from "$components/Grid";
import View from "$components/View";
import theme from "$theme";
import Label from "$components/Label";
import Tooltip from "$components/Tooltip";

export default function keyboardShortcutsScreen (props){
    const borderStyle = {borderWidth:1,borderColor:theme.colors.divider};
    const paddingVertical = 5;
    const paddingHorizontal = 3;
    const rowStyle = [{width:100,paddingVertical:2,paddingVertical,paddingHorizontal},{width:80,paddingVertical,paddingHorizontal},{width:'50%',minWidth:120,paddingVertical,paddingHorizontal}]
    const labelProps = {}
    return <Screen withScrollView title ={title} {...props}>
        <View style={[theme.styles.w100,theme.styles.p1]}>
            <Label textBold primary s>
                Rubrique d'aide SALITE relative aux Raccourcis clavier
            </Label>
            <Label s>
                Les raccourcis clavier représentent des combinaison de touches à appuyer simultanément sur le clavier 
                pour effectuer une action bien précise de l'application pendant l'édition d'un document.
                Ci-dessous la liste des raccourcis clavier supportés par l'application.
            </Label>
            <View style={[theme.styles.w100,theme.styles.pv1]}>
                <Grid.Row style={[borderStyle]}>
                    <Label style={[rowStyle[0]]}>Raccourcis clavier</Label>
                    <Label style={[rowStyle[1]]}>Action</Label>
                    <Label style={[rowStyle[2]]}>Description</Label>
                </Grid.Row>
                {
                    Object.mapToArray(shortcuts,(t,action)=>{
                        if(!isObj(t)){
                            return null;
                        }
                        return <Grid.Row key={action} style={borderStyle}>
                            <Label primary textBold  style={[rowStyle[0]]}>{action}</Label>
                            <Label  style={[rowStyle[1]]}>{defaultStr(t.text)}</Label>
                            <View style={[rowStyle[2]]}>
                                <Tooltip Component={Label} title={t.desc} splitText numberOfLines={3} >{defaultStr(t.desc)}</Tooltip>
                            </View>
                        </Grid.Row>
                    })
                }
            </View>
        </View>
    </Screen>
}

export const screenName = keyboardShortcutsScreen.screenName = "Help/KeyboardShortCuts";
export const title = keyboardShortcutsScreen.title = "Raccourcis clavier";
keyboardShortcutsScreen.Modal = true;
