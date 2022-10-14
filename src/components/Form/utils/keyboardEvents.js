
import keyboardShortcuts from "./keyboardShortcuts";
const keyboardEvents = {};
['enter','down','up','backspace','esc',...Object.keys(keyboardShortcuts)].map((k)=>{
    keyboardEvents[k]= k;
})

export default keyboardEvents;