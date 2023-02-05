const fs = require('fs')
const path = require('path')
const _path = path;
const createFile = (arg)=>{
  let dir = ELECTRON.getPath("temp");
  arg = defaultObj(arg);
  let {content,filename,fileName,charset,success,fileExtension,extension,type} = arg;
  filename = defaultStr(filename,fileName)
  if(isDataURL(content)){
      content = dataURLToBase64(content);
  }
  if(isBase64(content)){
      content = Buffer.from ? Buffer.from(content,'base64') : new Buffer(content,'base64')
  } else {
     content = null;
  }
  if(!content){
    console.warn('type de contenu invalide!! impression création fichier electron');
    return null;
  }
  success = defaultFunc(success)
  filename = defaultStr(filename,uniqid("print-salite-file-name"))
  fileExtension = defaultStr(fileExtension,extension,'pdf');
  charset = defaultStr(charset,'utf-8')
  filename = sanitizeFileName(filename+"."+fileExtension);
  fs.writeFile(path.join(dir,filename), content,{charset},(err)=>{
      if(!err) {
          let fileUrl = 'file://'+(dir+'/'+filename).replaceAll("\\","/");
          let p = _path.join(dir,filename);
          let filePathUrl = 'file://'+p.replaceAll("\\","/");
          success({content,fileName:filename,filename,path:p,filePathUrl,filePathUri:filePathUrl,fileUrl,filePath:p,fileUri:fileUrl})
      }
  })
}

function preview(arg){
  createFile({...defaultObj(arg),success:(opts)=>{
    let {path,filePathUrl} = opts;
    if(fs.existsSync(path)){            
      let urlPath = _path.join(require.resolve("pdfjs-dist-viewer-min/package.json").replaceAll("package.json",""),'build','minified','web', 'viewer.html')
      opts.loadURL = `file://${urlPath}?file=${decodeURIComponent(filePathUrl)}&locale=fr`;
      opts.showOnLoad = true;
      ELECTRON.createPDFWindow(opts)
    }
  }});
}


module.exports = {
  preview,
  createFile
}
