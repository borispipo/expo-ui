import registerApp from "$expo-ui-root-path"; 
registerApp({
    navigation : {
        screens : [],//all application screeens
        drawerItems : [], //application main drawer items
    },
    components : {//application components
        logo : null,//logo component's properties
        loginPropsMutator : {},//login props mutator
    },
    init : function({appConfig}){ //for application initialization
        return Promise.resolve('appInitialized');
    },
    onMount : function(){ //when main application component is mounted
    
    },
    onUnmount : function(){ //when main application component is unmounted
    },
    onRender : function(){
    
    }
});    