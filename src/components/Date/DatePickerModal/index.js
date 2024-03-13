import  "../utils";
import {DatePickerModal} from 'react-native-paper-dates'
import {PaperProvider} from 'react-native-paper';
import theme from "$theme";
import FontIcon from "$ecomponents/Icon/Font";

export default function DatePickerModalComponent(props){
    return <PaperProvider theme={theme}
        settings={{
            icon: (props) => {
              return <FontIcon {...props}/>
            },
        }}
    >
        <DatePickerModal {...props}/>
    </PaperProvider>
}
