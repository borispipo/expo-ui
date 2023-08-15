import React from "$react";
import View from "$ecomponents/View";

export default function DatagridAccordionToggleRow({handleRowToggle,avatarContent,...props}){
    if(!React.isValidElement(avatarContent)){
        avatarContent = null;
    }    
    return null;
}