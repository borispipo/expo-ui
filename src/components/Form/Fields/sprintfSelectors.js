import {DateTime,FormatSelector} from "$ecomponents/Date";
import {defaultObj} from "$cutils";
import appConfig from "$capp/config";
import DialogProvider from "$ecomponents/Dialog/Provider";
import View from "$ecomponents/View";
import DateLib from "$clib/date";
import theme from "$theme";

const sprintfSelectors = defaultObj(appConfig.get("sprintfSelectors"));

export default  {
    ...sprintfSelectors,
    "&sdate&" : {
        title : 'Sélectionner une date',
        type : 'field',
        field : {
              type : 'date',
              text : 'Sélectionner une date',
              format : DateLib.defaultDateFormat
        },
        desc : "remplace le motif par la date qui sera sélectionnée par l'utilisateur au format jj/mm/aaaa",
        select : ()=>{
            return new Promise((resolve,reject)=>{
                const valueRef = {current:new Date(),format:DateLib.defaultDateTimeFormat};
                DialogProvider.open({
                    title : 'Sélectionner une date',
                    cancelButton : true,
                    onCancel : reject,
                    content : <View testID = {"RN_SprintfSelectorSelectDate"} style={[theme.styles.p1]}>
                        <DateTime
                            label = {"Select date"}
                            defaultValue = {valueRef.current}
                            onChange = {({value,date})=>{
                                if(DateLib. isDateObj (date)){
                                    valueRef.current = date;
                                } else valueRef.current = new Date(value);
                            }}
                        />
                        <FormatSelector
                            defaultValue = {valueRef.format}
                            onChange = {({value})=>{
                                valueRef.format = value;
                            }}
                        />
                    </View>,
                    actions : [
                        {
                            text : "Sélectionner",
                            icon : "check",
                            success : true,
                            onPress : ()=>{
                                DialogProvider.close();
                                resolve(DateLib.format(valueRef.current,valueRef.format));
                            }
                        },
                    ]
                })
            })
        }
     },
    "&date&" : "remplace le motif par la date actuelle au format : jj/mm/aaaa",
    "&heure&" : "remplace le motif par l'heure actuelle au format hh:mm:ss",
    "&dateheure&" : "remplace le motif par la date et l'heure actuelle au format : jj/mm/aaaa hh:mm:ss",
}