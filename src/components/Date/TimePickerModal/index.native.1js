import  "../utils";
import DateLib from "$lib/date";
import DateTimePicker from '@react-native-community/datetimepicker';
export default function TimePickerComponent(props){
    const {visible,date,onTimeChange,onCancel,...rest} = props;
    const value = DateLib.isDateObj(date)?date:new Date();
    return visible? <DateTimePicker
        mode = {"time"}
        is24Hour={true}
        {...rest}
        value = {value}
        onChange = {(e,selectedDate)=>{
            if(!selectedDate){
                if(typeof onCancel ==='function'){
                    onCancel((date?value:undefined))
                }
                return;
            }
            onTimeChange(selectedDate);
        }}
    /> : null;
}
