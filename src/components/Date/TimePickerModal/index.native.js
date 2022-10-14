import  "../utils";
import DateLib from "$lib/date";
import DateTimePicker from '@react-native-community/datetimepicker';
export default function TimePickerComponent(props){
    const {visible,date,onTimeChange,onCancel} = props;
    const value = DateLib.isDateObj(date)?date:new Date();
    return visible? <DateTimePicker
        value = {value}
        mode = {"time"}
        is24Hour={true}
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
