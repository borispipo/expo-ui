import  "../utils";
import DateTimePicker from '@react-native-community/datetimepicker';
import DateLib from "$lib/date";
export default function DateTimePickerComponent(props){
    const {visible,date,onDateChange,startDate,endDate,onCancel} = props;
    const value = DateLib.isDateObj(date)?date:new Date();
    return visible? <DateTimePicker
        value = {value}
        mode = {"date"}
        minimumDate = {startDate}
        maximumDate = {endDate}
        onChange = {(e,selectedDate)=>{
            if(!selectedDate){
                if(typeof onCancel ==='function'){
                    onCancel((date?value:undefined))
                }
                return;
            }
            onDateChange(selectedDate);
        }}
    /> : null;
}
