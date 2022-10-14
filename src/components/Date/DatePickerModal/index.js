import  "../utils";
import {DatePickerModal} from 'react-native-paper-dates'
import {Provider} from 'react-native-paper';
import theme from "$theme";

export default function DatePickerModalComponent(props){
    return <Provider theme={theme}>
        <DatePickerModal {...props}/>
    </Provider>
}
