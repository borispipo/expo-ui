import {TimePickerModal} from 'react-native-paper-dates';
import {PaperProvider} from 'react-native-paper';
import theme from "$theme";
import FontIcon from "$ecomponents/Icon/Font";

export default function TimePickerModalComponent(props){
    return <PaperProvider theme={theme}
        settings={{
            icon: (props) => {
              return <FontIcon {...props}/>
            },
        }}
    >
        <TimePickerModal {...props}/>
    </PaperProvider>
}
