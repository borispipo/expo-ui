module.exports = (args,options)=>{
    let sellersTables = APP.DATA_FILE_MANAGER.getSellersTables ();
    options = defaultObj(options);
    let importer = defaultObj(options.importer);
    let {content,name,fileName,success,error} = defaultObj(args);
    let {getDB,constants} = require("$database");
    let validate = require("./validate")
    let {notify} = require("$components/Dialog")
    fileName = defaultStr(fileName,name);
    let extraData = require("$database/data/tables/extra");
    let fFields = isFunction(importer.getFields)? importer.getFields("import") : {};
    let handleErrors = (errors)=>{
        if(isArray(errors) && errors.length > 0){
            let err = "";
            let fileName = "";
            let cF = 0;
            let length = 0;
            errors.map((e,i)=>{
                if(isObj(e)){
                    err += "Ligne : "+e.index
                        + ", Table : "+defaultStr(e.tableText,e.table)
                        +", Fichier : "+defaultStr(e.dbId)
                        +", msg : "+e.msg
                        +"\r\n"
                    if(cF < 3 && isNonNullString(e.tableText) && !fileName.contains(e.tableText)){
                        fileName +=(fileName? ", ":"")+e.tableText;
                    }
                }
                cF++;
                length++;
            });
            if(length > 0){
                let s = length > 1 ? "s":"";
                let errL = (length > 9? "":"0")+length.formatNumber();
                fileName = sanitizeFileName(("Erreur"+s+" import-"+fileName+" au &dateheure&"))+".txt";
                APP.FILE.saveText({
                    content : err,
                    fileName,
                    //mimeType : "text/csv",
                    directory : APP.getId()+"/imports/erreurs/"
                }).then(({path})=>{
                    notify.warning({
                        message : "Opération d'import terminée avec "+errL+" erreur"+s+". Retrouvez le rapport dans le fichier "+(isNonNullString(path)? path:fileName)
                        ,timeout : 8000
                    });
                }).catch((e)=>{
                    console.log(e,' saving import error');
                })
            }
        }
    }
    return new Promise((resolve,reject)=>{
        let json = content;
        let TABLES = constants.TABLES; 
        let STRUCT_DATA_TABLES = constants.STRUCT_DATA_TABLES;
        let errors = [];
        let breakLoop = undefined;
        let footer = false ? [{
            text :'Annuler',
            icon : 'cancel',
            onClick : ()=>{
                breakLoop = true;
                hidePreloader();
                let msg = "Opération annulée";
                notify.error(msg);
                throw (msg);
            }
        }] : undefined;
        let errorF = (e)=>{
            hidePreloader();
            resolve({status:false,errors});
            handleErrors(errors);
            if(isFunction(error)){
                error(e,errors);
                return;
            }
            if(isNonNullString(e)){
                notify.error(e);
            }
        };
        let successF = (d)=>{
            d = {result:d,errors};
            hidePreloader();
            handleErrors(errors);
            if(isFunction(success)){
                success(d);
                return;
            } 
            resolve(d);
        }
        if(!content) {
            errorF(null);
            return;
        }
        let dbs = {};
        let preloader = "import fichier "+fileName;
        showPreloader(preloader);
        let docs = [];
        let isCSV =  false;
        if(!isJSON(json)) {
            let parsedData = parser.parse(json,{delimiter:defaultStr(importer.delimiter)});
            if(isObj(parsedData)){
                if(isArray(parsedData.errors) && parsedData.errors.length > 0){
                    let err = parsedData.errors[0];
                    let _msg = "";
                    if(isObj(err) && isNonNullString(err.message)){
                        _msg += ", message : "+err.message;
                    }
                    return errorF("Impossible d'importer le fichier "+fileName+" car celui-ci contient "+parsedData.errors.length.formatNumber()+" erreur(s)"+_msg);
                } else if(isArray(parsedData.data) && isArray(importer.fields) && isNonNullString(importer.table) && isNonNullString(importer.dbId)){
                    let meta = parsedData.meta;
                    if(isObj(meta) && isNonNullString(meta.delimiter)){
                        let delimiter= meta.delimiter;
                        let arr = [];
                        let k = defaultNumber(importer.ignoreFirstLigne,1)? 1 : 0;
                        let length = parsedData.data.length;
                        while(k < length){
                            let d = parsedData.data[k];
                            let _d = {};
                            let p = false;
                            if(isArray(d) && d.length > 1){
                                importer.fields.map((f,index)=>{
                                    _d[f] = d[index];
                                    if(isObj(fFields[f])){
                                        let ff = fFields[f];
                                        if(isNonNullString(ff.piece)){
                                            _d.piece = ff.piece;
                                        }
                                    }
                                    if(!p && _d[f] !== undefined && isNonNullString(_d[f])){
                                        p = true;
                                    }
                                })
                                _d.table = importer.table;
                                _d.dbId = importer.dbId;
                            }
                            if(p){
                                let tableText = defaultStr(importer.label,_d.table)
                                let msg = validate({data:_d,index:k,requiredFields:defaultArray(importer.fields),fields:fFields,table:_d.table,tableText});
                                if(isNonNullString(msg)){
                                    errors.push({dbId:importer.dbId,index:k,msg,status:false,table:_d.table,tableText});
                                    p = false;
                                } else p = !msg ? false : true;
                            }
                            if(p) arr.push(_d);
                            k++;
                        }
                        isCSV = true;
                        
                        if(isFunction(importer.prepareData)){
                            json = defaultArray(importer.prepareData({docs:arr,fields:fFields,delimiter,rawDocs:parsedData.data,delimiter,table:importer.table,dbId:importer.dbId,dbName:importer.dbId}))
                        } else json = arr;
                    }
                }
            } else {
                errorF("Le fichier "+fileName+" est un fichier de données json invalide");
                return;
            }
        } else {
            isCSV = false;
            json = parseJSON(json);
            if(isObj(json) && defaultStr(json.origin).toLowerCase() =="shared" && isNonNullString(json.provider) && isNonNullString(json.dataType)){
                return require("../share/import")({success:successF,error:errorF,json});
            }
        }
        if(isArray(json)){
            json = {rows : json};
        } else if(!isObj(json)) {
            errorF("fichier json invalide : ")
            return;
        }
        let isStructData = arrayValueExists(["struct_data",'structdata'],defaultStr(json.type).toLowerCase()); 
        if(isStructData ){
            if(isObj(json.rows) && Object.size(json.rows) > 0){
                docs = json.rows;
            } else if(isObj(json.docs) && Object.size(json.docs) > 0){
                docs = json.docs;
            }
            let count = 0;
            if(isObj(docs)){
                let {commonDB} = require("$database");
                let promises = [];
                for(let i in docs){
                    let table = i.toUpperCase();
                    if(table in STRUCT_DATA_TABLES && isObj(docs[i])){
                        for(let k in docs[i]){
                            let d = docs[i][k];
                            if(isObj(d) && isNonNullString(d.code)){
                                promises.push(commonDB.upsertStructData(table,d).then(()=>{
                                    count++;
                                }));
                            }
                        }
                    }
                }
                Promise.all(promises).then(()=>{
                    if(count > 0){
                        notify.success(count+" Données de structures modifiées ");
                    }
                })
            }
            ///l'import des données de structure se fait autrement
            return successF();
        } else {
            if(isArray(json.rows) && json.rows.length > 0){
                docs = json.rows;
            } else if(isArray(json.docs) && json.docs.length > 0){
                docs = json.docs;
            }
            if(docs.length <= 0) {
                successF()
                return;
            }
        }
        let allDBS = APP.DATA_FILE_MANAGER.getAll();
        showPreloader({content:preloader+" ...",footer});
        
        let doc = null;
        for(let j in docs){
            if(!isObj(docs[j])) continue;
            if(breakLoop) break;
            doc = null;
            if(isObj(docs[j])){
                doc = docs[j];
                if(isObj(docs[j].doc) && (isNonNullString(docs[j].doc._id) || isNonNullString(docs[j].doc._rev))){
                    doc = docs[j].doc;
                }
            }
            if(!doc) continue;
            let dbId = APP.DATA_FILE_MANAGER.sanitizeName(defaultStr(doc.dbId,json.dbName));
            let dF = allDBS[dbId];
            if(!isNonNullString(dbId) || !dF) {
                errors.push({status:false,dbId,index:j,msg:"Impossible de faire une importation dans le "+APP.DATA_FILE_MANAGER.dataFileText+" "+dbId+" car celui-ci est innexistant",table:doc.table,tableText:doc.table})
                continue;
            }
            let table = defaultStr(doc.table).toUpperCase();
            if(!arrayValueExists(extraData.ids,doc._id) && !extraData.tables[table]){
                if(!table) {
                    errors.push({dbId,index:j,msg:'le champ table est invalide pour la données',status:false,table});
                    continue;
                }
                let isDocStructData = dbId.trim() =='struct_data' ? true : false;
                let tb = isDocStructData ? STRUCT_DATA_TABLES[table] : TABLES[table];
                if(!isObj(tb)){
                    continue;
                }
                let dbType = defaultStr(dF.type,"seller").toLowerCase();
                let fields = tb.fields;
                if(isDocStructData){
                    dbType = "common";
                    fields = APP.extend(true,{},{
                        code : {
                            required : true,
                            label: 'Code',
                        },label:{
                            type : 'text',
                            label : 'Libelé',
                            required : true,
                        }
                    },fields);
                } 
                if(!isObj(fields)){
                    continue;
                }
                if(APP.DATA_FILE_MANAGER.isCommon(tb.dbName)){
                    dbType = "common"
                }
                let tableText = defaultStr(tb.label,tb.text,table);
                let _msg = undefined;
                if(dbType == 'common'){
                    if(isDocStructData){
                        if(dbId !== 'struct_data'){
                            _msg = "Impossible d'insérer les données de structure dans le fichier "+dbId;
                        }
                    } else if(!APP.DATA_FILE_MANAGER.isCommon(dbId)) {
                        _msg = "Impossible d'insérer ce type de données dans le "+APP.DATA_FILE_MANAGER.dataFileText+" communes";
                    }
                } else if(dbType =='project' && dbId !=='project'){
                    _msg = "Impossible d'insérer ce type de données dans le "+APP.DATA_FILE_MANAGER.dataFileText+" des projets";
                } else {
                    if((dbType ==='seller' || dbType =='pos') && !arrayValueExists(sellersTables,table)){
                        _msg = "Impossible d'enregistrer ce type de données dans un "+APP.DATA_FILE_MANAGER.dataFileText+" commercial";
                    }
                }
                if(_msg){
                    errors.push({dbId,index:j,msg:_msg,status:false,table,tableText});
                    continue;
                }
                if(!doc["has-validate-content-imp"]){
                    let vArgs = {data:doc,index:j,fields,requiredFields:defaultArray(tb.import  && tb.import.requiredFields? tb.import.requiredFields:[]),table,tableText};
                    let msg = validate(vArgs);
                    if(isNonNullString(msg)){
                        errors.push({dbId,index:j,msg,status:false,table,tableText});
                        continue;
                    } else if(!msg) continue;
                }
                delete doc["has-validate-content-imp"];
                doc.table = table;
                doc.dbId = dbId;
            } 
            doc.dbId = dbId;
            dbs[dbId] = defaultArray(dbs[dbId]);
            dbs[dbId].push(doc);
        }
        if(Object.size(dbs) <= 0){
            return successF();
        }
        let count = 0;
        ///les données sont insérées par base de données;
        for(let dbName in dbs){
            count++;
            if(breakLoop) break;
            getDB(dbName).then(({db})=>{
                let _docs = dbs[dbName];
                let dLen = _docs.length;
                let sLen = dLen.formatNumber()
                let preloadP = preloader+"["+dbName+"]";
                showPreloader({content:preloadP+"...",footer});
                let promises = [];
                let length = 0;
                let c = 0;
                for(let j in _docs){
                    let doc = _docs[j];
                    doc.table  = defaultStr(doc.table).toUpperCase();
                    let table = doc.table;
                    let isDocStructData = doc.dbId.trim() =='struct_data' ? true : false;
                    let tb = isDocStructData ? STRUCT_DATA_TABLES[table] : TABLES[table] || {};
                    let tableText = defaultStr(tb.label,tb.text,table);
                    let mutator = isCSV ? (isFunction(importer.mutator)? importer.mutator:undefined) : isObj(tb.import) && isFunction(tb.import.mutator)? tb.import.mutator : undefined;
                    let dbId = doc.dbId;
                    if(mutator){
                        doc = mutator({doc,db,dbId,table,tableText});
                    }
                    if(isNonNullString(doc)){
                        errors.push({dbId,index:j,msg:doc,status:false,table,tableText});
                        continue;
                    } else if(!isObj(doc) || !isNonNullString(doc.table)){
                        errors.push({dbId,index:j,msg:"Document non valide, car la table de données est manquante",status:false,table,tableText});
                        continue;
                    }
                    doc._id = db.uniqid({data:doc}).id;
                    /**** la fonction de muter la données au moment de la mise à jour */
                    let upsertMutator = isCSV ? (isFunction(importer.upsertMutator)? importer.upsertMutator:undefined) : isObj(tb.import) && isFunction(tb.import.upsertMutator)? tb.import.upsertMutator : undefined;
                    promises.push(
                        db.upsert(
                            doc._id,
                            (_doc)=>{
                                let ret  = isCSV? APP.extend({},_doc,doc):APP.extend(true,{},_doc,doc);
                                if(upsertMutator){
                                    return upsertMutator({doc:ret,old:_doc,new:doc,db,dbId:doc.dbId,table,tableText});
                                }
                                return ret;
                            },{updatedBy:false,updatedHour:false,updatedDate:false}
                        ).then((u)=>{
                            c++;
                            showPreloader({
                                    content : preloadP+", "+(c.formatNumber()+" sur "+sLen+" traités, "+(Math.floor(c*100/dLen)+"%")),
                                    footer
                                }
                            )
                            return u;
                        }).catch((e)=>{
                            c++;
                            return e;
                        })
                    );
                    length++;
                }
                Promise.all(promises).then((a)=>{
                    successF(a);
                    showPreloader(preloader+", 100% traités");
                    let dF = APP.DATA_FILE_MANAGER.get(dbName);
                    if(dF){
                        dbName = dF.label;
                    }
                    let dbPref = " le "+APP.DATA_FILE_MANAGER.dataFileText+" ["+dbName+"]";
                    if(promises.length>0){   
                        notify.success(promises.length+" modification(s) effectuée(s) dans "+dbPref);
                    } else {
                        notify.success("Auccune modification apportée au "+dbPref);
                    }
                    setTimeout(()=>{
                        hidePreloader();
                    },1000);
                }).catch((e)=>{
                    if(length >= _docs.length){
                        hidePreloader();
                        errorF(e);
                    }
                })
            }).catch((e)=>{
                if(count >= Object.size(dbs)){
                    hidePreloader();
                    errorF(e);
                }
            })
        }
    })
}