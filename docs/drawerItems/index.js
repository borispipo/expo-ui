import introduction from "./introduction";

export default function(){
    return {
        introduction : {
            section : true,
            label :"Introduction",
            items : introduction,
        },
        components : {
            section : true,
            label : "Composants",
            icon : "",
            items : [],
        }
    }
}