module.exports = (argv,supportedScript)=>{
    const args = {};
    if(!Array.isArray(argv) || !supportedScript || typeof supportedScript !=='object') return {};
    argv.map(arg=>{
      if(!arg || typeof arg != 'string') return;
      arg = arg.trim();
      if(arg in supportedScript){
         args.script = arg;
      } else if(arg.includes("=")){
          const split = arg.split("=");
          if(split.length !=2) return;
          args[split[0].trim()] = split[1].trim();
      } else {
         args[arg] = true;
      }
    })
    return args;
}