import {defaultStr,defaultObj,defaultVal,isObj} from "$utils";
import Fields from "../Fields";
//import dataFileManager from "$dataFileManager";
import i18n from "$i18n";

const componentTypes =  {
    ...Fields,
    id : Fields.IdField,
    idfield : Fields.IdField,
    piecefield : Fields.PieceField,
    piece : Fields.PieceField,
    select : Fields.SelectField,
    switch : Fields.Switch,
    select_country : Fields.SelectCountry,
    selectcountry : Fields.SelectCountry,
    date : Fields.Date,
    time : Fields.Time,
    checkbox : Fields.Checkbox,
    slider : Fields.Slider,
    color : Fields.ColorPicker,
    tel : Fields.Tel,
    html : Fields.Html,
    datafile : Fields.DataFile,
    image : Fields.Image,
    schedule : Fields.Scheduler,
    scheduler : Fields.Scheduler,
    default : Fields.TextField,
};

export default componentTypes;


export const getFilterComponentProps = (_props)=>{
    let {
        validType,
        validRule,
        required,//label,text,title,
        onAdd,
        onAddIconClass,
        addIcon,
        disabled,
        readOnly,
        onAddIcon,
        tableName,
        multiplicater,
        dbName,
        table,
        piece,
        onChange,
        error,
        errorText,
        label,text,
        primary,
        onValidate,
        checkPiece,
        check,
        width,
        type,
        ...props
    } = _props;
    props = defaultObj(props);
    let component = Fields.TextField;
    type = defaultStr(type,'text').toLowerCase().replaceAll("_","").replaceAll("-","").trim();
    props = defaultObj(props);
    /*if(type =='datafile'){
        type = 'select';
        props = {...selectFieldProps,items : dataFileManager.getAll(),...props};
        label = defaultStr(label,dataFileManager.dataFileText);
    }*/
    if(type.startsWith("select")){
        props.inputProps = Object.assign({},props.inputProps);
        props.inputProps.placeholder = defaultStr(props.inputProps.placeholder,i18n.lang("search.."))
        props.label = label;
        component = Fields.SelectField;
        /*if(type !== 'select'){
            if(type === 'selectstructdata') {
                dbName = 'structData';
                component = StructDataSelectField;
            } else if(type === 'selecttabledata'){
                component = TableDataSelectField;
            } 
            props.tableName = tableName;
            props.dbName = dbName;
        }*/
        type = "select";
    } else if(type == 'switch' || type =='radio' || type ==='checkbox') {
        type = 'select';
        let {checkedLabel,checkedTooltip,uncheckedTooltip,checkedValue,uncheckedLabel,uncheckedValue,label,text,...pR} = props;
        checkedLabel = defaultVal(checkedLabel,checkedTooltip,'Désactivé/Désélectionné')
        uncheckedLabel = defaultVal(uncheckedLabel,uncheckedTooltip,'Activé/Sélectionné')
        checkedValue = defaultVal(checkedValue,1); uncheckedValue = defaultVal(uncheckedValue,0)
        props = pR;
        props.items = [{code:checkedValue,label:checkedLabel},{code:uncheckedValue,label:uncheckedLabel}];
        component = Fields.SelectField;
    } else if(type == "date" || type =="time"){
        component = type === 'date'? Fields.Date : Fields.Time;
    }  else if(type == 'color' || type =='colorpicker') {
        component = Fields.ColorPicker;
    } else {
        delete props.dbName;
        delete props.tableName;
        props.label = label; 
        delete props.fieldName;
    }
    type = type || "text"
    if(type =='select'){
        props.multiple = true;
    }
    props.renderFilter = true;
    if(type.contains("date") || type.contains("time")){
        delete props.right;
    }
    delete props.width;
    delete props.onAdd;
    delete props.onAddProps;
    return {Component:component,props,type};
}