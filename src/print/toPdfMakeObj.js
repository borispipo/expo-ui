import {isNonNullString,sprintf} from "$cutils";
export default function toPdfmakeObj(str){
    if(!isNonNullString(str)) return null;
    let bold = false, italics = false;
    const output = [];
    const text = sprintf(str).split('').reduce((a, b) => {
        if(b == '*'){
            if(bold){
                if(a != ''){
                    if(italics)
                        output.push({text: a, bold: true, italics:true});
                    else
                      output.push({text: a, bold: true});
                }
                bold = false;
            }
            else{
                if(italics)
                    output.push({text: a, italics: true})
                else
                    output.push({text: a})
                bold = true;
            }
            return '';
        }
        else if(b == '_'){
            if(italics){
                if(a != ''){
                    if(bold)
                        output.push({text: a, bold: true, italics:true});
                    else
                      output.push({text: a, italics: true});
                }
                italics = false;
            }
            else{
                if(bold)
                    output.push({text: a, bold: true})
                else
                    output.push({text: a})
                italics = true;
            }
            return '';
        }
        else{
            return a+b;
        }
    }, '');
    if(text != '') output.push({text : text});
    return output;
}