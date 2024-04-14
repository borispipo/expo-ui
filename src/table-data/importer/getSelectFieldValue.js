export default function getSelectedFieldValue ({field,value}){
    let hasF = false;
    let itemCodes = "";
    let vStr = defaultStr(value).toLowerCase().removeSpecialChars().trim();
    value = defaultStr(value,typeof value =="number"? String(value) : value);
    value = value.trim();
    Object.map(field.items,(item,j)=>{
        if(!isObj(item)) return;
        let itemCode = defaultStr(item.code).trim();
        if(!itemCode) return;
        let rLabel = defaultStr(item.label,item.text,itemCode);
        let label = rLabel.removeSpecialChars();
        itemCodes+=(itemCodes?", ":"")+((label?(label+(field.multiple?(" et/ou "):" ou ")):"")+itemCode);
        label = label.toLowerCase().trim();
        if(itemCode == value || (itemCode.toLowerCase().trim() == vStr || label == vStr)){
            hasF = true;
            value = itemCode;
            return;
        }
    })
    value = hasF ? value : false;
    return {value,itemCodes};
}