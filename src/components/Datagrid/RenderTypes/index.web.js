import { fixedIcon,virtualIcon } from "./utils"
export default {
    fixed : false && {
        code:'fixed',icon:fixedIcon,
        label:'Tableau virtuel optimisé',
        desktop:true,
        tooltip : "Les éléments de liste s'affichent dans un tableau virtuel optimisé",
    },
    virtual : {code:'virtual',icon:virtualIcon,
        label:'Tableau virtuel',
        tooltip : "Les éléments de liste s'affichent dans un tableau virtuel", desktop:true
    }
}