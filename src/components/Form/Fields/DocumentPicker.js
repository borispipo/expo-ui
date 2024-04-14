import Field from "./Field";
import DocumentPicker from "$ecomponents/DocumentPicker";
import {isObj,defaultObj} from "$cutils";
export default class FormFieldDocumentPicker extends Field {
    canFocus(){
        return false;
    }
    isValid(){
        return true;
    }
    compareAssets(assets){
        if(Array.isArray(assets)){
            const previousValue = this.getPreviousValue();
            const allPrev = Array.isArray(previousValue)? previousValue : [previousValue];
            for(let i in assets){
                let hasFound = false;
                for(let j in allPrev){
                    if(this.compareSingleAssets(assets[i],allPrev[j])) {
                        hasFound = true;
                    }
                    if(hasFound) break;
                }
                if(!hasFound) return false;
            }
            return true;
        } 
        return this.compareSingleAssets(assets,this.getPreviousValue());
    }
    compareSingleAssets(assets,previousValue){
        if(!isObj(assets) || !isObj(previousValue)) return false;
        return previousValue.lastModified === assets.lastModified && previousValue.mimeType == assets.mimeType && previousValue.name === assets.name && previousValue.size == assets.size && previousValue.uri == assets.uri;
    }
    onChange(args){
        const assets = Array.isArray(args.assets) ? args.assets : [args.assets];
        const value = this.props.multiple ? assets:assets[0];
        if(this.compareAssets(value)){
            return ;
        }
        this.validate({...args,value,context:this});
    }
    getComponent(){
        return DocumentPicker;
    }
    _render({pickOptions,...props}){
        pickOptions = defaultObj(pickOptions,props);
        if(typeof this.props.multiple =="boolean"){
            pickOptions.multiple = this.props.multiple;
        }
        return <DocumentPicker
           {...props}
           pickOptions = {pickOptions}
           onChange = {this.onChange.bind(this)}
        />
    }
    isTextField(){
        return false;
    }
}

FormFieldDocumentPicker.propTypes = {
    ...Field.propTypes,
    ...DocumentPicker.propTypes,
}
