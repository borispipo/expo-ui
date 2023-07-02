import  "../utils";
import {DatePickerModal} from 'react-native-paper-dates'
import {PaperProvider} from 'react-native-paper';
import theme from "$theme";

export default function DatePickerModalComponent(props){
    console.log(theme," is theme heeeee")
    return <PaperProvider theme={theme}>
        <DatePickerModal {...props}/>
    </PaperProvider>
}
