import APP from "$capp";

const refresh = (force)=>{
    const name = APP.getName();
    return [
        {
            label : name,
            icon : 'view-dashboard',
            title : 'Dashboard',
            routeName : "Home",
            divider : true,
        },
        {
            divider : true,
        },
        {
            key : 'dataHelp',
            label : 'Aide',
            section : true,
            divider : false,
            items : [
                /*{
                    icon : 'timeline-help',
                    label : name+", Mises à jour",
                },*/
            ]
        }
    ]
}

export default refresh;