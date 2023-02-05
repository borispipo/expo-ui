const config = ELECTRON.CONFIG;
let path = require("path");
const fs = require("fs");
let getBackupPath = ELECTRON.getBackupPath;
/*let isNonNullString = (val) => {
    return val && typeof val =='string';
};*/
//let isFunction= x=> typeof x == 'function';
//let defaultObj = o => {return o && typeof o == 'object' && !Array.isArray(o)? 0 : {}};

let directoryExists = (dirPath)=>{
    return isDirectory(dirPath);
}
let isFileOrDirectory = (path,type)=>{
    if(!isNonNullString(path)) return false;
    if(!fs.existsSync(path)) return false;
    const stat = fs.lstatSync(path);
    switch(type){
        case 'directory':
            return stat && stat.isDirectory();
            break;
        default : 
            return stat && stat.isFile();
    }
}
let isDirectory = (dirPath)=>{
    return isFileOrDirectory(dirPath,'directory');
}
let isFile = (filePath)=>{
    return isFileOrDirectory(filePath);
}
/*** boolean permettant de créer un répertoire s'il n'existe pas */
let createDirectory = (dirPath)=>{
    if(!isNonNullString(dirPath)) return false;
    if(fs.existsSync(dirPath)) return true;
    try {
        fs.mkdirSync(dirPath,{
            recursive:true
        });
        return fs.existsSync(dirPath);
    } catch(e){
        console.log("could not create folder "+e);
        return false;
    }
    return false;
}
let getCheckedImagesPath = ()=>{
    return getBackupPath('IMAGES.CHECKED')
}
let /*** vérifie les images d'un simple fichier 
    @param string, file, le chemin complet du fichier à vérifier
*/
checkSingleFileImage = (file,options)=>{
    let checkedImagesPath = getCheckedImagesPath();
    return new Promise((resolve,reject)=>{
        if(!isFile(file)){
            return resolve({status:false,msg:"L'élément spécifier n'est pas un fichier valide : "})
        }
        let oldPath = file;
        let newPath = oldPath;
        let dirname = path.dirname(file);
        let code = getName(file,true);
        if(!isNonNullString(code)){
            return resolve({status:false,msg:'Non du fichier incorrect : '+code,code});
        }
        let codeC = APP.calculateBarCode({code:code.replace("O","0")});
        showPreloader(file+", " +defaultStr(options.percentage)+" ...");
        let UpsertImage = (p,rCode,override)=>{
            let imgP = path.join(checkedImagesPath,rCode+".jpg");
            if(!override && fs.existsSync(imgP)){
                resolve({status : true, msg : 'Aucune modification apporté au code ',code,codeC})
                oldPath = null;
                code = null;
                newPath = oldPath = null;
            } else {  
                APP.resizeImage(fileUrl(p),options).then((image)=>{
                    if(isNonNullString(image)){
                        fs.writeFileSync(imgP, getBase64FromDataUrl(image) , {encoding: "base64"});
                        let t = fs.existsSync(imgP);
                        resolve({status:t,code,codeC,action:oldPath +" => "+newPath+","+(t?'Redimentionné avec succès':' non rénommé!')});
                        t = null;
                        newPath = oldPath = null;
                        UpsertImage = null;
                        image = null;
                    } else {
                        resolve({status:false,msg:'Impossible de rédimensionner l\'image  : , ancien : '+code+" nouveau : "+codeC,code})
                    }
                }).catch((e)=>{
                    console.log(e, ' resizing image to upsert on checking db electron');
                    resolve({status:false,msg:'Nouveau code erroné : , ancien : '+code+" nouveau : "+codeC,code})   
                    code = null;
                    newPath = oldPath = null;
                })
            }
        }
        if(codeC != code){
            if(!isNonNullString(codeC)){
                resolve({status:false,msg:'Nouveau code erroné : , ancien : '+code+" nouveau : "+codeC,code})
            }
            newPath = path.join(dirname,codeC+".jpg");
            if(fs.existsSync(newPath)){
                //au cas où le fichier existait déjà
                UpsertImage(newPath,codeC,false);
            } else {
                // au renome le fichier précédent
                fs.rename(oldPath,newPath,(err)=>{
                    if(err){
                        console.log(err,' error when renaming checking db ',oldPath,' to ', newPath)
                        return resolve({status:false,msg:'Fichier non renommé ',code,codeC});
                    }
                    UpsertImage(newPath,codeC,false);
                    //resolve({status:true,code,codeC,action:oldPath +" => "+newPath})
                })
            }
        } else{
            UpsertImage(newPath,codeC,defaultBool(options.override,false));
            //resolve({status : true, msg : 'Aucune modification apporté au code ',code,codeC})
        }                               
    })
}
let getName = (file,withoutExtension)=>{
    withoutExtension = defaultVal(withoutExtension,true);
    if(isNonNullString(file)){
        return withoutExtension? path.basename(file,path.extname(file)): path.basename(file);
    }
    return "";
}
/*** @param string filePath: le chemin du fichier
 *   @param bool resolve, si la fonctioin path.resolve :Resolves all the path segments into an absolute path.
 */
let fileUrl = (filePath, resolve) => {
    if(!isNonNullString(filePath)){
        return "";
    }
	resolve = defaultVal(resolve,false);

	let pathName = filePath;

	if (resolve) {
		pathName = path.resolve(filePath);
    }
	pathName = pathName.replace(/\\/g, '/');
	// Windows drive letter must be prefixed with a slash
	if (pathName[0] !== '/') {
		pathName = `/${pathName}`;
	}
	// Escape required characters for path components
	// See: https://tools.ietf.org/html/rfc3986#section-3.3
	return encodeURI(`file://${pathName}`).replace(/[?#]/g, encodeURIComponent);
};
let FILE = {
    url : fileUrl,
    directoryExists,
    isFile,
    isDirectory,
    getExtension : (file)=>{
        if(isNonNullString(file)){
            return path.extname(file);
        }
        return "";
    },
    getName : getName,
    exists : fs.existsSync,
    createDirectory,
    ///retourne l'image à partir du code d'un article
    getPictureFromCode : ()=>{
        return Promise.resolve({});
    },
    /**** affiche le repertoire de sélection d'un fichier 
     *  options : {
     *      mediaType || mimeType, le type de media à récupérer
     *  }
    */
    browse : (success,error,options)=>{
        if(isObj(success)){
            let t = options;
            options = success;
            if(isFunction(error)){
                success = error;
                error = isFunction(t)?t : undefined;
            }
        }
        /*** retourne plusieurs fichiers sélectionnés dans un tableau.
         *  la promesse généère un tableau contenant les différents fichiers sélectionnés
         */

        /**
        * @param accept Optional MIME type filter (e.g. 'image/gif,video/*').
        *
        * @returns Promise containing selected file's information,
        * MIME type, display name, and original URI.
        *  return : {
                mediaType: string;
                name: string;
                uri: string;
        * }
        */
        let accept = "image/*";
        if(isNonNullString(options)){
            accept = options;
        } 
        options = defaultObj(options);
        accept = "";
        let configKeyName = "lastOpenedFilePath";
        let defaultPath = config.get(configKeyName);
        if(typeof defaultPath != 'string' || !defaultPath){
            defaultPath = undefined;
        }
        return new Promise((resolve,reject)=>{
            ELECTRON.showOpenDialog({
                ...options,
                properties: ['openFile','multiSelections'],
                defaultPath
            }).then((r)=>{
                if(r){
                    if(r.canceled){
                        return r.canceled;
                    }
                    if(Array.isArray(r.filePaths)){
                        let files = [];
                        config.set(configKeyName,path.dirname(r.filePaths[0]))
                        for(let i in r.filePaths){
                            files.push({
                                path : r.filePaths[i],
                                name : path.basename(r.filePaths[i])
                            })
                        }
                        if(isFunction(success)){
                            success(files);
                        } else {
                            resolve(files)
                        }
                    }
                }
            }).catch((e)=>{
                if(isFunction(error)){
                    error(e)
                } else reject(e);
            })
        })
    },
    /**** prend en paramètre le chemin complet d'un fichier, et lit le contenu sur forme de contenu texte brute
     *  @param filePath : le chemin absolu du fichier à lire le contenu
     *  @param success : la fonction de rappel à appeler en cas de success, cette fonction prend en paramètre le contenu lu
     *  @param error : la fonction de rappel à appeler en cas d'erreur : cette fonction prend en paramètre l'objet e correspondant à l'erreur généré
        @param readType : le type de contenu à lire : 
                        text : le fichier sera lu en contenu texttuel
     */
    read : (filePath,success,error,readType)=>{
        if(!isNonNullString(readType)) readType = "text";
        if(!filePath || !isNonNullString(readType)) return;
        if(!isNonNullString(filePath)) {
            if(isFunction(error)){
                error({msg : 'Chemin du fichier invalide ou commande non compatible pour la lecture du fichier'});
            }
            return;
        }
        try {
            // Asynchronous read
            fs.readFile(filePath, function (err, data) {
                if (err) {
                    if(isFunction(error)){
                        error(err);
                    }
                    return;
                }
                switch ((readType.toLowerCase())) {
                    case 'text':
                        data = data.toString();
                        break;
                
                    default:
                        break;
                }
                //console.log(data,' is data');
                if(isFunction(success)){
                    success(data);
                }
            });
        }  catch(e){
            if(isFunction(error)){
                error(e)
            }
        }
                        
    },
    readAsText : (filePath,success,error)=>{
        return FILE.read(filePath,success,error,'text');
    },
    showFileExplorer : function(){
        return APP.FILE.browse.apply(APP.FILE,Array.prototype.slice.call(arguments,0));
    },
    saveExcel : ({workbook,directory,fileName})=>{
        let XLSX = APP.require("$xlsx");
        return new Promise((resolve,reject)=>{
            showPreloader("génération du fichier excel "+fileName);
            let isC = isCapacitor(true);
            if(!isC && !isNativeDesktop()){
                try {
                    XLSX.writeFile(workbook, fileName)
                    resolve( {fileName,path:fileName});
                    notify.success("Données exportées avec succès!! au nom du fichier "+fileName);
                    hidePreloader();
                } catch(e){
                    reject(e);
                    hidePreloader();
                }
            } else {
                let content = XLSX.write(workbook,{
                    bookType : 'xlsx',
                    bookSST: false,
                    type: "base64"
                });
                directory = defaultStr(directory,(isC?(APP.getId()+"/DATA/EXPORTS/EXCEL"):""));
                APP.FILE.write({content,fileName,directory}).then(resolve).catch((e)=>{
                    console.log(e,' catched');
                    reject();
                }).finally(hidePreloader);
            }
        })
    },
    saveText : (args)=>{
        args = defaultObj(args);
        args.mime = args.mimeType = defaultStr(args.mime,args.mimeType,"text/plain");
        return FILE.saveBinary(args)
    },
    saveBinary : ({content,charset,data,mimeType,directory,mime,fileName})=>{
        mime = defaultStr(mime,mimeType);
        return new Promise((resolve,reject)=>{
            data = defaultVal(data,content);
            charset =  defaultStr(charset,'utf8').trim().ltrim(";");
            fileName = sanitizeFileName(defaultStr(fileName));
            blobToBase64(data instanceof Blob ? data : new Blob(isArray(data)?data:[data], { type: mime + ";" +charset })).then((content)=>{
                return FILE.write({content,mimeType:mime,mime,charset,fileName,directory}).then(resolve).catch(reject)
            }).catch(reject)
        })
    },
    /**** sauvegarde un fichier sur le disque 
     *  Si directory est dir sont à undefined, àlors, l'explorateur d'enregistrement de fichier sera proposé à l'utilisateur de sélectionner l'emplacement à enregistrer
     *  le fichier sur le disque
     *  @param {object} {
     *      content {mix}: le contenu du fichier à enregistrer
     *      charset {string}: L'encodage à utiliser pour l'enregistrement du fichier, par défaut utf-8
     *      directory || dir {string} : le répertoire dans lequel enregistrer le fichier
     *      fileName {string} : le nom du fichier à enregistrer
     *      success {function} : la fonction de rappel à appeler en cas de success
     *      error {function} la fonction de rappel à appeler en cas d'erreur
     *  }
    */
    write : ({content,isBinary,charset,directory,dir,fileName,success,error})=>{
        directory = defaultStr(directory,dir);
        return new Promise((resolve,reject)=>{
            let errorF = (err)=>{
                if(isFunction(error)){
                    error(err);
                } else reject(err);
            }
            let successF = (arg)=>{
                if(isFunction(success)){
                    success(arg);
                } else resolve(arg);
            };
            if(!isNonNullString(fileName)){
                errorF({status:false,msg:'Non de fichier invalide'});
                return;
            }
            fileName = sanitizeFileName(fileName);
            charset = defaultStr(charset,'utf8');
            let writingOpts = {charset};
            if(isDataURL(content)){
                content = dataURLToBase64(content);
            }
            if(isBase64(content)){
                writingOpts.encoding = 'base64';
            } else {
                writingOpts.encoding = charset;
            }
            if(isBinary ===true){
                delete writingOpts.encoding;
                writingOpts.encoding = "binary";
            }
            //si directory est undefined, alors une boîte de dialogue est démandé à l'utilisateur pour récupérer le chemin ainsi que le nom du fichier à sauvegarder
            if(!isNonNullString(directory)){
                let ext = getFileExtension(fileName,true);
                let options = {
                    //Placeholder 1
                    title: "Sauvegarder "+fileName,
                    
                    //Placeholder 2
                    defaultPath : fileName,
                    
                    //Placeholder 4
                    buttonLabel : "Enregistrer",
                    
                    //Placeholder 3
                    filters : ext ? [{name: 'Fichier de Type .'+ext, extensions: [ext]}]: undefined
                }

                ELECTRON.showSaveDialog(options).then((fName)=>{
                    if(isObj(fName) && isNonNullString(fName.filePath)){
                        fName = fName.filePath;
                    }
                    if(isNonNullString(fName) && !isBase64(fName)){
                        fs.writeFile(fName, content,writingOpts,(err) => {
                            if (err) {
                                errorF(err);
                                return;
                            }
                            successF(fName);
                        });
                    } else {
                      errorF({msg:"Opération annulée",status:false});
                    }
                }).catch((e)=>{
                    console.log(e,' is error writing electorn file')
                    errorF(e);
                });
            } else {
                if(createDirectory(directory)){
                    let p = path.join(directory,fileName);
                    fs.writeFile(p, content,writingOpts,(err) => {
                        if (err) {
                            errorF(err);
                            return;
                        }
                        successF(p);
                    });
                } else {
                    errorF({status : false,msg:'Impossible de créer le répertoire '+directory});
                }
            }
        })
    },
    /*** 
     *  return : Promise (
     *      resolve : 
     *      reject : 
     *  )
     */
    backupDB : ({dbContent,content,fileName,mimeType,charset,dbName,success,error,showSaveDialog})=>{
        dbContent = defaultVal(dbContent,content);
        dbName = defaultStr(dbName,fileName);
        charset = defaultStr(charset,'utf-8')
        if(!isNonNullString(dbName)){
            dbName= "export-donnéess.json";
        }
        return new Promise((resolve,reject)=>{
            let errorF = (err)=>{
                if(isFunction(error)){
                    error(err);
                } 
                console.log(err," backup func")
                reject(err);
            }
            let successF = (arg)=>{
                if(isFunction(success)){
                    success(arg);
                } 
                resolve(arg);
            }
            let DATA_FOLDER = getBackupPath("BACKUP");
            
            let date = new Date().format("dd-mm-yyyy");
            if(!showSaveDialog){
                date = path.join(DATA_FOLDER,date);
            }
            if(createDirectory(date)){
                 if(!isNonNullString(getFileExtension(dbName,true))){
                    dbName+=".json"
                }
                let sArg = {directory:date,fileName:dbName,filePath:!showSaveDialog? path.join(date,dbName):dbName};
                if(showSaveDialog){
                    APP.require("$file-saver")(new Blob([dbContent], { type: mimeType + ";" + charset }), dbName, true);
                    successF(sArg);
                } else {
                    fs.writeFile(path.join(date,dbName), dbContent, charset,(err) => {
                        if (err) {
                            errorF(err);
                            return;
                        }
                        successF(sArg);
                    });
                }
            } else {
                errorF({msg:'Impossible de créer le répertoire de sauvegarde des données '+date});
            }
        })
    },
    /*** retourne les statistiques sur le fichier passé en paramètre */
    getStats : (file) =>{
        if(!isNonNullString(file)) return null;
        if(!fs.existsSync(file)) return null;
        let stats = fs.statSync(file)
        stats.sizeInBytes = stats.size;
        stats.sizeInKiloBytes = stats.size / 1024;
        stats.sizeInMegaBytes = stats.sizeInKiloBytes / 1024;
        return stats;
    }
}

module.exports = FILE;