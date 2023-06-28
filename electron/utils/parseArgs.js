module.exports = (argv,supportedScript)=>{
  if(!Array.isArray(argv)) {
    argv = process.argv.slice(0);
  }
  const args = {};
  supportedScript = typeof supportedScript =='object' && supportedScript || null;
  argv.map(arg=>{
    if(!arg || typeof arg != 'string') return;
    arg = arg.trim();
    if(supportedScript && arg in supportedScript){
       args.script = arg;
    } else if(arg.includes("=")){
        const split = arg.split("=");
        if(split.length !=2) return;
        args[split[0].trim()] = split[1].trim();
    } else {
       args[arg] = true;
    }
  });
  return args;
}