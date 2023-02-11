const isWindow = process.platform =="win32",
isMac = process.platform =='darwin',
isLinux = process.platform =="linux";
const fs = require("fs");
const getDirname = require("./getDirname");
const path = require("path");
const getIcon = (p)=>{
  if(Array.isArray(p)){
     for(let i in p){
       const r = getIcon(p[i]);
       if(r) return r;
     }
  } else if(typeof p =='string' && p && fs.existsSync(p)){
    const ext = isWindow ? ".ico" : isMac ? ".incs" : ".png";
    const possibles =  ["icon","logo","favicon"];
    for(let i in possibles){
      const ico = path.join(getDirname(p),possibles[i]+ext);
      if(fs.existsSync(ico)){
         return ico;
      }
    }
  }
  return undefined;
};
module.exports = getIcon;