/*** le prompt selector a pour fonction de retourner 
 *  une form field de type select qui lorsqu'on clique sur le boutton addIcon, affiche une boîte de dialogogue permettant à l'utilisateur
 *  d'ajouter un nouvel item
 */
export default  (_props)=>{
    let {items,onAdd,addItemTitle,yes,no,prompTitle,message,promptMessage,onUnselect,...props} = defaultObj(_props)
    props = defaultObj(props);
    props.type = 'select';
    props.text = defaultStr(props.text,props.label);
    props.showAdd = defaultBool(props.showAdd,true);
    props.addIcon = defaultStr(props.addIcon,'account-multiple-plus');
    props.multiple = defaultBool(props.multiple,true);
    props.display = defaultStr(props.display, props.multiple?"tags":"list");
    props.items = isObjOrArray(items)? items : [];
    props.itemValue = defaultFunc(props.itemValue,({item})=>{
        return item;
    })
    props.onUnselect = (arg)=>{
        let {item,context}= arg;
        if(context && context.state){
            let data = []
            Object.map(context.state.menuItems,(v,i)=>{
                if(isNonNullString(v) && v !== item){
                    data.push(v);
                }
            })
            context.setState({menuItems:data,onKey:!context.state.onKey});
            if(isFunction(onUnselect)){
                onUnselect(arg);
            }
        }
    }
    props.renderItem = defaultFunc(props.renderItem,({item,context})=>{
        return item;
    });
    props.onAdd = (arg)=>{
        let {context}= arg;
        if(context && context.state){
            showPrompt({
            yes : defaultVal(yes,'Enregistrer'),
            no : defaultVal(no,'Annuler'),
            title:defaultStr(prompTitle,addItemTitle,'Ajouter un élément'),
            message:defaultStr(message,promptMessage),
            onSuccess:({value})=>{
                let {menuItems} = context.state;
                let data = defaultArray(menuItems);
                if(isNonNullString(value) && !arrayValueExists(data,value)){
                    data.push(value);
                }
                context.setState({menuItems:data,onKey:!context.state.onKey},()=>{
                    if(isFunction(onAdd)){
                        onAdd(arg);
                    }
                });
            }})
        }
    }
    return props;
}