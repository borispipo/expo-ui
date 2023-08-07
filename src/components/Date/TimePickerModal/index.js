import {TimePickerModal} from 'react-native-paper-dates';
import {PaperProvider} from 'react-native-paper';
import theme from "$theme";

export default function TimePickerModalComponent(props){
    return <PaperProvider theme={theme}>
        <TimePickerModal {...props}/>
    </PaperProvider>
}
