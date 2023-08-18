import createPDF from "./createPDF";
import {defaultObj,isFunction,sanitizeFileName,defaultNumber,sprintf,defaultVal,arrayValueExists,isObj,defaultFunc,isNonNullString,defaultStr,defaultArray} from "$cutils";
import notify from "$cnotify";
import appConfig from "$capp/config";
import APP from "$capp/instance";
import toPdfMakeObj from "./toPdfMakeObj";

//let {generate} = require("./qrCode");
let signatoriesItems = undefined;
let subTotalFillColor = "#FDE9D9";
let subTotalTitleFillColor = "#fcd9bb"//"#FCD5B4";
let totalPrintTableTextColor = "red";
let tableHeaderPrintFillColor = "#cccccc";
let MAX_CREATED_SIGNATURE_PRINT_SIZE = 50;

export * as pdfSettings from "./";

import Colors from "$theme";

export * from "./pdf";

export const isValidPrintableContent = (args)=>{
    return (isObj(args) && isObj(args.docDefinition) && args.content && isObj(args.options));
}
export const createPDFFile = (args) =>{
    return new Promise((resolve,reject)=>{
        args.data = defaultObj(args.data);
        args.fileName = defaultStr(args.fileName);
        let {fileName,title,data,content,showPreloader,hidePreloader,multiple,docDefinition,options} =args;
        options = defaultObj(options);
        showPreloader = typeof showPreloader =='function' ? showPreloader : x=>true;
        hidePreloader = typeof hidePreloader =='function' ? hidePreloader : x=> false;
        const error = (e)=>{     
            let message = "";
            if(isObj(e)){
                message = defaultStr(e.msg,e.message);
            }
            notify.error("Une erreur est survenue pendant l'impression du fichier au format pdf\n"+message);
            reject(e);
        };
        if(isValidPrintableContent(args)){
            let pdf = null;
            docDefinition.watermark = { text: defaultStr(docDefinition.watermark,options.watermark),fontSize:80, color: 'blue', opacity: 0.1, bold: false, italics: false,...defaultObj(options.watermark)}
            if(!isNonNullString(docDefinition.watermark.text)){
                delete docDefinition.watermark;
            }
            let printTitle = defaultStr(options.printTitle,options.docTitle,options.title);
            docDefinition.info = defaultObj(docDefinition.info);
            docDefinition.info.title = defaultStr(docDefinition.info.title,printTitle,fileName);
            docDefinition.info.author = APP.getName();
            docDefinition.info.creator = APP.getName();
            docDefinition.info.producer = APP.getName();
            try {
                showPreloader("création du contenu...")
                pdf = createPDF({
                    ...getPrintPageSettings(options),
                    content,
                    ...docDefinition,
                });
                title = defaultStr(typeof title =='function'? title(args):multiple?fileName:'',printTitle,options.printTitle,options.docTitle,options.title,title)
                fileName = sanitizeFileName(defaultStr(fileName,title)).trim().rtrim(".pdf")+".pdf"
                if(pdf){
                    pdf.getDataUrl((dataUrl) => {
                        resolve({dataURL:dataUrl,dataUrl,pdf,data}) 
                    });
                } else {
                    error({status:false,data,message:'Impossible de générer le pdf'})
                }
            } catch(e){
                console.log("creating pdf file in printing document ",e,data);
                error({status:false,data,msg:'Error lors de la création du fichier pdf ',data})
                return e;
            }
    } else {
        error({status:false,data,msg : "Impossible d'imprimer le document car le contenu du fichier est invalide"});
    }
    })
};


export const getPrintPageSettings = (opts)=>{
    opts = defaultObj(opts);
    let title = defaultStr(opts.printTitle,opts.docTitle,opts.title)
    let defaultFont = "Roboto";
    const fts = Object.keys(createPDF.fonts);
    if(!arrayValueExists(fts,defaultFont)){
        defaultFont = fts[0];
    }
    return {
        ...defaultObj(getPageSize(opts)),
        pageMargins: getPageMargins(opts),
        footer: getFooter(opts), 
        info : {
            title,//- the title of the document
            author : APP.getName(),//the name of the author
            subject :tile,//- the subject of the document
            keywords :APP.getName()+","+defaultStr(opts.keywords),//- keywords associated with the document
            creator : APP.getName(),//- the creator of the document (default is ‘pdfmake’)
            producer : APP.getName()//- the producer of the document (default is ‘pdfmake’)
        },
        defaultStyle: {
            ...defaultObj(opts.defaultStyle),
            font: typeof defaultFont !== "undefined" ? defaultFont : undefined,
            color : Colors.isValid(opts.defaultFontColor)? opts.defaultFontColor : undefined,
        }
    }
}
export const getPageSize = (options,force)=>{
    options = defaultObj(options);
    let {pageFormat,pageSize,pageHeight,pageWidth,pageOrientation,formatName} = options;
    pageFormat = defaultStr(pageFormat,formatName)
    if(!isNonNullString(pageFormat) || !pdfSettings.pageFormats[pageFormat]){
        pageFormat = pdfSettings.defaultPageFormat;
    }
    pageSize = defaultStr(pageSize,pageFormat);
    pageOrientation = defaultStr(pageOrientation,pdfSettings.defaultPageOrientation);
    if(!arrayValueExists(['landscape','portrait'],pageOrientation)){
        pageOrientation = 'portrait';
    }
    pageWidth = defaultNumber(pageWidth);
    pageHeight = defaultNumber(pageHeight);
    const oPageSize = pageOrientation == 'landscape'? 1 : 0;
    if(pageWidth != 0 || pageHeight != 0 || force){
        if(pageSize && isObj(pdfSettings.pagesSizes[pageSize]) && isArray(pdfSettings.pagesSizes[pageSize].pt)){
            if(pageWidth <= 0){
                pageWidth = pdfSettings.pagesSizes[pageSize].pt[oPageSize]
            }
            if(pageHeight <= 0){
                pageHeight = pdfSettings.pagesSizes[pageSize].pt[oPageSize]
            }
        }
    }
    if( pageWidth > 0 && pageHeight>0){
        pageSize = {
            width : pageWidth,
            height: pageHeight           
        }
        pageOrientation = undefined;
    }   
    return {pageSize,pageFormat,pageOrientation}
}
export const getPageMargins = (options)=>{
    options = defaultObj(options);
    const ret = [20,20,20,30];
    const margins = ['left','top','right','bottom']
    for(let i in margins){
        const m = margins[i]+"Margin";
        if(isNumber(options[m])){
            ret [i]=options[m] 
        }
        if(i == 3){
            ret[i] = Math.max(ret[i],30)
        }
    }
    return ret;
}
export const getFooter = (opts)=>{
    opts = defaultObj(opts);
    const margin = [10,0,10,10];
    let footerCopyRight = opts.footerCopyRight === false ? "" : defaultStr(opts.footerCopyRight,undefined)
    if((footerCopyRight)){
        footerCopyRight = {
            text : toPdfMakeObj(footerCopyRight),
            alignment : "center",
            fontSize:10,
            margin,
            color : Colors.isValid(opts.footerCopyRightColor)? opts.footerCopyRightColor : undefined
        }
    }

    let devWebsite = isValidUrl(APP.getDevWebsite()) && APP.getDevWebsite() || undefined;
    return function(currentPage, pageCount, pageSize) {
        showPreloader("page "+pageCount.formatNumber()+"/"+defaultNumber(pageCount).formatNumber());
        currentPage = isNumber(currentPage)? currentPage.formatNumber().toString() : currentPage.toString();
        pageCount = pageCount > 2 ? {
            fontSize: 9,
            width : "140",
            text:[
                {
                    text : '     Page '+currentPage + '/' + pageCount.formatNumber(),
                    bold : true,
                },
                {
                    text: ['\n[ powered by ',{text:APP.getName(),link:devWebsite,color:'red'}," ]"],
                    fontSize : 9,
                    italics : true,
                    link : devWebsite
                }
            ],
            margin : [5,0,20,0],
            alignment: 'right'
        } : null;
        if(isObj(footerCopyRight) && footerCopyRight.text && pageCount){
            footerCopyRight.alignment = "left";
            footerCopyRight.width = "*"
        }
        const content = pageCount ? [
            {
                columns: [
                    footerCopyRight,
                    pageCount
                ],
                columnGap: 10,
                margin 
            }
        ] : footerCopyRight? [footerCopyRight] : undefined;
        return content;
    }
}

export const getTableHeaderFillColor = ()=>{
    const tbFillColor = appConfig.get("tableHeaderPrintFillColor");
    if(Colors.isValidColor(tbFillColor)){
        tableHeaderPrintFillColor = tbFillColor;
    }
    return tableHeaderPrintFillColor;
}
export const getSubTotalFillColor = ()=>{
    const sColor = appConfig.get("subTotalPrintTableColor");
    if(Colors.isValidColor(sColor)){
        subTotalFillColor = sColor;
    }
    return subTotalFillColor;
}
export const getSubTotalTitleFillColor = ()=>{
    const stColor = appConfig.get("subTotalTitlePrintTableColor");
    if(Colors.isValidColor(stColor)){
        subTotalTitleFillColor = stColor;
    }
    return subTotalTitleFillColor;
}
export const getTotalPrintTableTextColor = ()=>{
    const tPColor = appConfig.get("totalPrintTableTextColor");
    if(Colors.isValidColor(tPColor)){
        totalPrintTableTextColor = tPColor;
    }
    return totalPrintTableTextColor;
}
/**** retourne l'espace entre les colonnes des entêtes du document, espace entre la colonnes du tiers et celle de la société */
export const getHeaderColumnGap = ()=>{
    return 10;
}
export const getCompanyHeader = (options)=>{
    options = defaultObj(options);
    const fontSize = defaultNumber(options.fontSize,11);
    let bold = true;
    let headerColumn = []
    let displayLogo = defaultVal(options.displayLogo ,true)? true : false;
    const displaySocialReason = defaultVal(options.displaySocialReason,true)?true : false;
    const displayEmailOnHeader = defaultVal(options.displayEmailOnHeader,false),
        displayFaxOnHeader = defaultVal(options.displayFaxOnHeader,false),
        ignoreCompanyLogoOnPrinting = false;
    const logo = displayLogo && !ignoreCompanyLogoOnPrinting && isDataURL(logo)? logo : undefined;
    if(logo){
        headerColumn.push({
            image : logo
        })
    }
    if(displaySocialReason && isNonNullString(options.companyName)){
        headerColumn.push({text:options.companyName+"\n",fontSize:13,bold})
    }
    if(displaySocialReason && isNonNullString(options.socialReason)){
        headerColumn.push({
            text : options.socialReason+"\n",
            fontSize,
            bold:!bold
        })
    }
    if(options.displayIdentifier){
        if(isNonNullString(options.companyIdentifier)){
            headerColumn.push({
                text : options.companyIdentifier+((isNonNullString(options.sellerId)? ((", "+options.sellerId)):"")),
                fontSize,
                bold
            })
        }
    }
    options.displayAddress = defaultVal(options.displayAddress,true);
    //afficher les informations sur l'addresse de la company
    if(displaySocialReason && options.displayAddress){
        let address = "";
        if(isNonNullString(options.companyCity)){
            address+= options.companyCity;
        }
        if(isNonNullString(options.companyAddress)){
            address +=(isNonNullString(address)?", ":"")+options.companyAddress;
        }
        if(isNonNullString(address)){
            headerColumn.push({
                text : ('Situé à '+address).toUpperCase(),
                fontSize,
                bold:!bold
            })
        }
    }
    let phone = defaultStr(options.companyPhone,options.companyTelephone);
    if(displaySocialReason){
        if(isNonNullString(options.companyMobile1)){
            phone += (isNonNullString(phone)?"/":"")+options.companyMobile1
        }
        if(isNonNullString(options.companyMobile2)){
            phone += (isNonNullString(phone)?"/":"")+options.companyMobile2;
        }
        if(isNonNullString(phone)){
            headerColumn.push({
                text : "TEL : "+phone,
                fontSize,
                bold
            })
        }
        if(displayFaxOnHeader && isNonNullString(COMPANY.fax)){
            headerColumn.push({
                text : "FAX : "+COMPANY.fax,
                fontSize,
                bold
            })
        }
        if(options.displayPostBox && isNonNullString(COMPANY.postBox)){
            headerColumn.push({
                text : "BP : "+COMPANY.postBox,
                fontSize,
                bold
            })
        }
        if(displayEmailOnHeader && isNonNullString(COMPANY.email)){
            headerColumn.push({
                text : "EMAIL : "+COMPANY.email,
                fontSize,
                bold
            })
        }
    }
    return headerColumn;
}
export const getThirdPartyHeader = (options)=>{
    options = defaultObj(options);
    let {thirdParty} = options;
    const thirdPartyContent = []
    thirdParty = defaultObj(thirdParty);
    if(isNonNullString(thirdParty.code) && isNonNullString(thirdParty.label)){
        thirdPartyContent.push({
            text : "["+defaultStr(thirdParty.code)+"] "+defaultStr(thirdParty.label),
            bold:true
        })
    }
    if(options.displayThirdPartiesIdentifier){
        if(isNonNullString(thirdParty.identifier)){
            thirdPartyContent.push({
                text : thirdParty.identifier+((isNonNullString(thirdParty.sellerId)? ((", "+thirdParty.sellerId)):"")),
                bold:true
            })
        }
    }
    let tpPhone = "";
    if(isNonNullString(thirdParty.phone)){
        tpPhone = thirdParty.phone;
    }
    if(isNonNullString(thirdParty.mobile1)){
        tpPhone += (isNonNullString(tpPhone)?("/"):"")+thirdParty.mobile1;
    }
    if(isNonNullString(thirdParty.mobile2)){
        tpPhone += (isNonNullString(tpPhone)?("/"):"")+thirdParty.mobile2;
    }
    if(isNonNullString(tpPhone)){
        thirdPartyContent.push({
            text : tpPhone,
            bold : true
        })
    }
    if(isNonNullString(thirdParty.fax)){
        thirdPartyContent.push({
            text : "FAX : "+thirdParty.fax,
            bold : true
        })
    }

    if(isNonNullString(thirdParty.address)){
        thirdPartyContent.push({
            text : thirdParty.address
        })
    }
    return {thirdParty,content:thirdPartyContent};
}

 /*** retourne les options des champs à exporter 
     *  @param {object}
     *  {
     *      fieldsToExport : //les items de la liste des champs à exporter
     *      groupableFields{arrayOrObject} : //la liste des champs pouvant être groupés dans la selection
     *      groupable | groupBy : //si les champs de type decimal pouvont être groupé
     * }
     *   
    */
 export const getFieldsToExportSettings = (args)=>{
    let {groupable,fieldsToExport,groupableFields,groupBy,fields} = defaultObj(args);
    fields = isObjOrArray(fieldsToExport)? fieldsToExport :  fields;
    groupBy = defaultVal(groupBy,groupable);
    if(groupBy !== false){
        groupBy = true;
        let _hasGroupedFields = false;
        groupableFields = isObjOrArray(groupableFields)? groupableFields : undefined;
        if(!groupableFields){
            groupableFields = [];
            Object.map(fields,(field,i)=>{
                if(isObj(field)){
                    field.code = defaultStr(field.code,i);
                    let type = defaultStr(field.type,'text').toLowerCase();
                    let canP = false;
                    if(type.contains("select")){
                        if(!field.multiple) {
                            canP = true;
                        }
                    } else canP = true;
                    if(canP){
                        groupableFields.push(field);
                        _hasGroupedFields = true;
                    }
                }
            })
        }
        groupBy = _hasGroupedFields || isObjOrArray(groupableFields)? true : false;
        if(!_hasGroupedFields && Object.size(groupableFields)<=0){
            groupBy = false;
        }
    }
    let ret = {}
    let itemValue = ({item,index})=> isNonNullString(item)? item : isObj(item)? (defaultStr(item.code,index)):index,
    renderItem = ({item,index})=>isNonNullString(item)? item : isObj(item)? (defaultStr(item.label,item.text)):index;
    if(isObjOrArray(fields) && Object.size(fields)>0){
        ret.fieldsToExport = {
            text : 'Champs à exporter',
            type : 'select',
            items : fields,
            itemValue,
            renderItem,
            required : true,
            multiple : true,
        }
        ret.doesNotDisplayTotalLine = {
            text : "Ne pas afficher la ligne total",
            type :'switch',
            defaultValue : 0
        }
    }
    if(groupBy){
        ret.groupByField = {
            text : 'Totaux Groupés par',
            title : 'Sélectionner le champ à partir duquel vous désirez grouper les totaux des champs de type numbre',
            type : 'select',
            multiple : false,
            items : groupableFields,
            itemValue,
            renderItem
        }
        ret.groupByFieldDivider = {
            text : 'Sous totaux Groupés par',
            title : 'Sélectionner le champ à partir duquel les sous totaux seront groupés',
            type : 'select',
            multiple : false,
            items : groupableFields,
            renderItem
        }
        ret.sortFieldBy = {
            text : 'Tableau trié par',
            title : 'Sélectionner le champ à partir duquel vous désirez trier le tableau',
            type : 'select',
            multiple : false,
            items : groupableFields,
            renderItem
        }
        ret.displayOnlyTotals = {
            type : 'switch',
            text : 'Afficher uniquement les totaux',
            defaultValue : 0,
        }
    }
    return ret;
}

/*** crée un contenu de type tableau : 
 * @param {object} de la forme : 
 *  {
 *      data {Array|Object} : l'ensemble des données à utiliser pour la création du tableau
 *      fields {Object} : la liste des champs à utiliser pour la création du tableau
 *      header {func}, la fonction prenant en paramètre un champ puis retournant une chaine de caractère à utiliser comme entête du tableau
 *      fieldsToExport {Array} : la liste des code des champs à exporter parmis les champs fields
 *      headerRows {number>=1} : Le nombre d'entêtes de lignes à repêter pour le tableau,
*       labelFields {array, default[label]} : La liste des codes champs de type label, ie les champs dont la longueur sera définit à *
*      groupByField {string} : le code du champ par lequel les données seront groupées
*      total|displayTotal {bool}, ///si les totaux des colonnes du tableau seront affichés
*      groupByFieldTitle{string|func} //titre de la colonne de groupage
*      mutator : ({data})=> data , la fonction utilisée pour éventuellement muter le data avant calcul des valeurs
* }
* @return {null|array}, si la valeur de retour est un tableau , alors elle est de la forme : 
*      0 => {
        table : {
            body : bodyContent,
            widths : widths,
            headerRows,
        },
        width:"auto",
        margin : [0,10,0,0]
    },
    1 => {
        titre de la colonne groupe
    },
    2 => {
        ....colonnne de groupage
    }
*/
export const createTable = (args)=>{
    let {data,tableMargin,rowsFormatted,fieldsToExport,mutator,labelFields,total,displayTotal,sortFieldBy,groupByField,groupByFieldDivider,groupByFieldTitle,fields,header,headerRows,displayOnlyTotals,doesNotDisplayTotalLine,headerOptions} = defaultObj(args);
    let bodyContent = [];
    fields = defaultObj(fields);
    groupByFieldDivider = defaultStr(groupByFieldDivider);
    fieldsToExport  = defaultArray(fieldsToExport);
    labelFields = defaultArray(labelFields);
    if(labelFields.length ==0) labelFields = ['label'];
    header = defaultFunc(header,({code,label,text})=>text);
    if(fieldsToExport.length ==0 ){
        Object.map(fields,(f,code)=>{
            if(isObj(f)){
                fieldsToExport.push(code);
            }
        })
    }
    let widths = []
    let tHeadersCode = [];
    let hasFLabelField = false;
    subTotalFillColor = getSubTotalFillColor();
    subTotalTitleFillColor = getSubTotalTitleFillColor();
    total = defaultVal(doesNotDisplayTotalLine !== undefined? !doesNotDisplayTotalLine : undefined,total,displayTotal,true);
    bodyContent.push(createTableHeader(fieldsToExport.map((code,i)=>{
        if(!isNonNullString(code)) return undefined;
        let f = fields[code];
        if(isObj(f)){
            f.label = f.text = defaultStr(f.label,f.text)
            let r = header(f);
            if(isNonNullString(r)){
                if(!hasFLabelField && arrayValueExists(labelFields,code)){
                    widths.push("*");
                    hasFLabelField = true;
                } else {
                    widths.push("auto");
                }
                tHeadersCode.push(code);
                return r;
            }
        }
        return undefined;
    }),headerOptions));
    if(tHeadersCode.length <=0){
        ///aucune entête à exporter
        return undefined;
    }
    headerRows = Math.max(defaultNumber(headerRows),1);
    if(!hasFLabelField && widths.length > 0){
        widths[widths.length-1] = "*";
    }
    let totalFooter = {}, totalFooterLength = 0,totalSubFooters={},previousGroupByFieldDiverValue = undefined,currentGroupByFieldDiverValue = "";
    let groupBy = {};
    let canGroupData = isNonNullString(groupByField)? true : false;
    let groupByFieldText = groupByField;
    if(canGroupData && isObj(fields[groupByField])){
        let gb = fields[groupByField];
        groupByFieldText = defaultStr(gb.label,gb.text,groupByField);
    }
    mutator = defaultFunc(mutator,({data})=>data);
    let groupByFields = {},groupByFieldsFormats = {};

    let groupByFieldDividerValue = "";
    let groupByFieldDividerObj = groupByFieldDivider ? defaultObj(fields[groupByFieldDivider]) : {};
    if(!groupByFieldDividerObj.label && !groupByFieldDividerObj.text) groupByFieldDivider = undefined;
    let groupByFieldDividerLabel = defaultStr(groupByFieldDividerObj.text,groupByFieldDividerObj.label,groupByFieldDivider);
    let groupByFieldDividerTexto = " ["+groupByFieldDividerLabel.toUpperCase()+"]";    
    let returnArray = isArray(data)? true : false;
    let getItem = (item,fieldName,extra)=>{
        let field = fields[fieldName];
        return formatField({...defaultObj(extra),rowsFormatted,format:"EXCEL",field,columnField:fieldName,rowData:item});
    }
    if(sortFieldBy && typeof sortFieldBy =='string'){
        data = sortBy(data,{column:sortFieldBy,returnArray,getItem});
    }
    if((groupByFieldDivider && groupByFieldDivider !== sortFieldBy)){
        data = sortBy(data,{column:groupByFieldDivider,returnArray,getItem});
    }
    let totalSubFootersTmp = {};
    let allData = data;
    let mustBreakSubFooter = false;
    let hasSubFooters;
    let subTotalFontSize = 14;
    Object.map(allData,(data)=>{
        if(!isObj(data)) return null;
        let ret = [];
        //totalSubFootersTmp = {}
        mustBreakSubFooter = false;
        data = mutator({data,context:this,groupBy,groupByField,fieldsToExport:tHeadersCode});
        if(groupByFieldDivider){
            groupByFieldDividerValue = getItem(data,groupByFieldDivider,{formatResult:true});
        }
        if(total && groupByFieldDividerValue){
            if(previousGroupByFieldDiverValue !== groupByFieldDividerValue){
                totalSubFootersTmp = totalSubFooters;
                hasSubFooters = true;
                totalSubFooters = {}
                mustBreakSubFooter = true;
            }
            currentGroupByFieldDiverValue = previousGroupByFieldDiverValue;
            previousGroupByFieldDiverValue = groupByFieldDividerValue;
        }

        tHeadersCode.map((f,i)=>{
            let field = fields[f];
            let type = defaultStr(field.type).toLowerCase().trim();
            let fFormat = defaultStr(field.format).toLowerCase();
            if(fFormat =="money" || fFormat =="number"){
                type = "number";
            }
            if(type == 'decimal'){
                type = "number";
            }
            let v = getItem(data,f);
            switch(type){
                case 'number':
                    v = defaultNumber(v)
                    if(total) {
                        totalFooterLength++;
                        if(groupByFieldDividerValue){
                            if(mustBreakSubFooter){
                                totalSubFooters [f] = v;
                            } else {
                                totalSubFooters[f] +=v;
                            }
                        }
                        totalFooter[f]= defaultNumber(totalFooter[f])+v;
                    }
                    let gbFieldC = getItem(data,groupByField,{formatResult:true});
                    if(canGroupData && gbFieldC){
                        groupByFields[f]= defaultStr(field.label,field.text);
                        groupByFieldsFormats[f] = fFormat;
                        groupBy[gbFieldC] = defaultObj(groupBy[gbFieldC]);
                        groupBy[gbFieldC][f]= defaultNumber(groupBy[gbFieldC][f])
                        groupBy[gbFieldC][f] +=v;
                    }
                    if(fFormat === 'money'){
                        v = v.formatMoney()
                    } else {
                        v = v.formatNumber();
                    }
                    break;
                case 'select':
                    if(isObjOrArray(field.items)){
                        for(let i in field.items){
                            if(field.items[i] && field.items[i].code == v){
                                v = defaultStr(field.items[i].label,field.items[i].text,v);
                                break;
                            }
                        }
                    }
                    break;
                case 'switch':
                    v = defaultVal(v,field.defaultValue);
                    if(v == field.checkedValue){
                        v = defaultStr(field.checkedLabel,field.checkedTooltip,v);
                    } else if(v === field.uncheckedValue){
                        v = defaultStr(field.uncheckedLabel,field.uncheckedTooltip,v);
                    }
                    break;
                case 'date':
                    v = defaultStr(APP.date.parse2Format(v),v);
                    break;
                default :
                    break;
            }
            if(total && !isDecimal(totalFooter[f])){
                totalFooter[f] ="";
                if(groupByFieldDividerValue){
                    totalSubFooters[f] = "";
                }
            }
            ret.push(defaultStr(v));
        })
        if(!displayOnlyTotals){
            if(totalFooterLength && mustBreakSubFooter){
                let tmp = [];
                Object.map(totalSubFootersTmp,(t,i)=>{
                    if(isDecimal(t)){
                        if(defaultStr(fields[i].format).toLowerCase() === 'money'){
                            totalSubFootersTmp[i] = t.formatMoney();
                        } else totalSubFootersTmp[i] = t.formatNumber();
                    } 
                    tmp.push({
                        text : totalSubFootersTmp[i],
                        fontSize:subTotalFontSize,
                        bold:true,
                        //fillColor : "#F5C6CB",
                        fillColor : subTotalFillColor,
                        //color : 'red',
                        alignment : 'center',
                    })
                })
                if(tmp.length && currentGroupByFieldDiverValue){
                    let tpt = [{
                        text : "TOTAL ["+currentGroupByFieldDiverValue.toUpperCase()+"]"+groupByFieldDividerTexto,
                        fontSize:subTotalFontSize,
                        colSpan : tmp.length,
                        fillColor : subTotalTitleFillColor,
                        alignment : 'center',
                    }]
                    for(let i =1;i <tmp.length;i++){
                        tpt.push({text:''});
                    }
                    bodyContent.push(tpt);
                    bodyContent.push(tmp)
                }
            }
            bodyContent.push(ret);
        }
    })
    let footer = [];
    if(totalFooterLength){
        if(hasSubFooters){
            let tmp = [];
            totalSubFootersTmp = totalSubFooters;
            Object.map(totalSubFootersTmp,(t,i)=>{
                if(isDecimal(t)){
                    if(defaultStr(fields[i].format).toLowerCase() === 'money'){
                        totalSubFootersTmp[i] = t.formatMoney();
                    } else totalSubFootersTmp[i] = t.formatNumber();
                }
                tmp.push({
                    text : totalSubFootersTmp[i],
                    fontSize:subTotalFontSize,
                    bold:true,
                    //fillColor : "#F5C6CB",
                    fillColor : subTotalFillColor,
                    //color : 'red',
                    alignment : 'center',
                })
            })
            if(tmp.length && previousGroupByFieldDiverValue){
                let tpt = [{
                    text : "TOTAL ["+previousGroupByFieldDiverValue.toUpperCase()+"]"+groupByFieldDividerTexto,
                    fontSize:subTotalFontSize,
                    colSpan : tmp.length,
                    fillColor : subTotalTitleFillColor,
                    alignment : 'center',
                }]
                for(let i =1;i <tmp.length;i++){
                    tpt.push({text:''});
                }
                bodyContent.push(tpt)
                bodyContent.push(tmp)
            }
        }
        Object.map(totalFooter,(t,i)=>{
            if(isDecimal(t)){
                if(defaultStr(fields[i].format).toLowerCase() === 'money'){
                    totalFooter[i] = t.formatMoney();
                } else totalFooter[i] = t.formatNumber();
            }
            footer.push({
                text : totalFooter[i],
                fontSize:15,
                bold:true,
                fillColor : getTableHeaderFillColor(),
                color : Colors.getContrast(getTableHeaderFillColor()),
                //color : 'red',
                alignment : 'center',
            })
        })
    }
    if(footer.length > 0) bodyContent.push(footer);
    let sizeFields = Object.size(groupByFields);
    let size = Object.size(groupBy);
    let groupedTable = [],groupedTableWidths=[];
    let canRenderFooter = false;
    let groupByFieldTextBackup = groupByFieldText;
    if(isFunction(groupByFieldTitle)){
        groupByFieldText = groupByFieldTitle({text:groupByFieldText,label:groupByFieldText,data,groupBy})
    } else {
        groupByFieldText = ('Totaux [ ').toUpperCase()+groupByFieldText+" ]"
    }
    let totalCounter = size;
    if(size>0 && sizeFields > 0){
        let fontSize = 14
        ///les entêtes sont en colonnes et les valeurs en lignes
        let gHeader = [];
        let gbValue = (v,format)=>{
            if(format == 'money'){
                return v.formatMoney()
            }
            return v.formatNumber();
        }
        if((size < sizeFields ) && ( sizeFields > 5 || size <= tHeadersCode.length)){
            /*** on transpose dès que le nombre d'éléments de totalisation est supérieur au nombre d'éléments d'entêtes de totaux et en même temps inférieur au nombre total d'éléments d'entêtes du tableau principal */
            totalCounter = 0;
            gHeader = createTableHeader(groupBy,({value,index})=>{
                return index;
            });
            gHeader.unshift({text:'',fillColor:getTableHeaderFillColor()});
            groupedTable.push(gHeader);
            Object.map(groupByFields,(fText,f)=>{
                let ret = [{text:fText,bold:true,fontSize}]
                let canCount = totalCounter > 0 ? false : true;
                Object.map(groupBy,(g)=>{
                    if(canCount) totalCounter+=1;
                    let v = gbValue(g[f],groupByFieldsFormats[f]);
                    ret.push({text:v,color:getTotalPrintTableTextColor(),alignment:'center',fontSize,bold:true})
                })
                groupedTable.push(ret);
            });
        } else {
            gHeader.push(groupByFieldTextBackup)
            Object.map(groupByFields,(f,v)=>{
                gHeader.push(f);
            })
            gHeader = createTableHeader(gHeader,{alignment:'left'});
            groupedTable.push(gHeader);
            Object.map(groupBy,(g,i)=>{
                let ret = [{text:i,bold:true,fontSize}]
                Object.map(groupByFields,(text,f)=>{
                    let v = gbValue(g[f],groupByFieldsFormats[f]);
                    ret.push({text:v,color:getTotalPrintTableTextColor(),fontSize:fontSize,bold:true,alignment:'center'})
                })
                groupedTable.push(ret);
            });
        }
        canRenderFooter = true;
        for(let i =0;i<gHeader.length;i++){
            groupedTableWidths.push("*");
        }
    }
    if(tableMargin === false){
        tableMargin = undefined;
    } else if(isArray(tableMargin) && (tableMargin.length == 2 || tableMargin.length ==4)){
        tableMargin.map(v=>{
            if(!isDecimal(v)) tableMargin = undefined;
        })
    } else tableMargin = [0,10,0,5];
    let ret = [!displayOnlyTotals? {
        table : {
            body : bodyContent,
            widths : widths,
            headerRows : 1,
        },
        width:"auto",
        margin : tableMargin,
    }: null]
    if(canRenderFooter){
        ret.push({
            text: groupByFieldText+" ["+totalCounter.formatNumber()+"]",
            margin : [0,0,0,5],
            fontSize:15,
            color : getTotalPrintTableTextColor(),
            alignment : 'right',
            bold:true
        })
        ret.push({
            columns : [
                {width : '*', text : ''},
                {
                    width : 'auto',
                    table : {
                        body: groupedTable,
                        headerRows : 1,
                        widths : groupedTableWidths
                    },
                    margin : [0,0,0,5]
                }
            ]
        });
    }
    return ret;
}
let printTB = {
    ,
    /**** permet de créer l'entête de la page à générer comme pdf
     * @param : Object {
     *      ///PropType.array, le contenu à concaténer auprès du companyHeader
     *      ///tableau contenant le header à afficher côte à cote ou de manière repartie au companyHeader 
     *      pageHeader : [
     *          
     *      ]
     * }
     * 
     */
    createPageHeader : (options)=>{
        options = defaultObj(options);
        let companyHeader = getCompanyHeader(options);
        let hasCompany = companyHeader && companyHeader.length> 0;
        let dynamicPageHeaderWidth = defaultVal(options.dynamicPageHeaderWidth,1);
        let pageHeader = defaultArray(options.pageHeader);
        let columnGap = getHeaderColumnGap();
        let hasLogo = hasCompany && isObj(companyHeader[0]) && companyHeader[0].image ? true : false;
        if(!pageHeader.length){
            pageHeader = undefined;
        }
        let margin = [ 0, 0, 0, 8 ]
        let ret = {
            margin
        }
        let hasColumns = false;
        if(dynamicPageHeaderWidth){
            pageHeader = pageHeader || [];
            companyHeader = companyHeader || []
            //le logo seule prend quatre lignes
            let companyHeaderLength = hasCompany ? (hasLogo? (companyHeader.length+4):companyHeader.length) : 0;
            let diff = pageHeader.length - companyHeaderLength;
            if(diff > 1){
                let div = Math.floor(diff/2);
                for(let i = div; i >= 1;i--){
                    if(i >= pageHeader.length) continue;
                    companyHeader.push(pageHeader[pageHeader.length-i]);
                    delete pageHeader[pageHeader.length-i];
                }
            } else if(companyHeader.length > pageHeader.length){
                let div = Math.floor((companyHeader.length-pageHeader.length)/2);
                div += hasLogo?2:0;
                for(let i = div; i >= 1;i--){
                    if(i >= companyHeader.length) continue;
                    pageHeader.push(companyHeader[companyHeader.length-i]);
                    delete companyHeader[companyHeader.length-i];
                }
            }
            hasCompany = companyHeader.length;
            pageHeader = pageHeader.length ? pageHeader : undefined;
        }
        let pageHeaderContent = [];
        if(hasCompany){
            if(pageHeader){
                pageHeaderContent.push(companyHeader);
                pageHeaderContent.push(pageHeader);
                hasColumns = true;
            } else pageHeaderContent = companyHeader;
        } else if(pageHeader){
            pageHeaderContent = pageHeader;
        }
        if(hasColumns){
            ret.columns = pageHeaderContent;
            ret.columnGap = columnGap;
        } else {
            if(isArray(pageHeaderContent)){
                ret = pageHeaderContent;
                ret.push({text:'',margin})
            } else {
                ret = {text:pageHeaderContent,margin}
            }
        } 
        return ret;
    },
    /**** retourne la liste des paramètres utiles pour la création d'un tableau à imprimer
    * @param {
    *      table, tableName : le nom de la table dans la base de données, si null ou innexistant, retourne null
    *      getPrintSettings : fonction permettant de récupérer les parmètres d'impression de la table à exporter
    * }
    */
    getSettingsForPrintTableData : (opts)=>{
        if(isNonNullString(opts)){
            opts = {table:opts};
        }
        opts = defaultObj(opts);
        let {table,tableName} = opts;
        tableName = defaultStr(table,tableName).trim();
        if(!tableName) return null;
        const {constants} = require("$database");
        table = defaultObj(constants.TABLES[tableName] || constants.TABLES[tableName.toUpperCase()]);
        let {notify} = require("$components/Dialog")
        if(isObj(table) && isObj(table.export) && isObj(table.export.EXCEL)){
            let exportFields = isFunction(table.export.getFields) ? table.export.getFields() : table.fields;
            let _formatRow = require("$database/exporter/formatRow");
            let formatRow = defaultFunc(table.export.EXCEL.row,_formatRow) 
            if(opts.defaultFields){
                Object.map(require("$database/defaultFields"),(field,i)=>{
                    if(!isObj(exportFields[i])){
                        exportFields[i] = {...field};
                    }
                });
            }
            let tableLabel = defaultStr(table.label,table.text)
            return {
                exportFields,
                tableLabel,
                tableObj : table,
                createTable : ({data,printInExcelDocument,fieldsToExport,fileName,filename,...options}) =>{
                    options = defaultObj(options)
                    let allData = [],printingData = [];
                    if(printInExcelDocument){
                        showPreloader("préparation des données excel....");
                    }
                    Object.map(data,(doc)=>{
                        let d = formatRow({
                            allData,
                            options,
                            data : doc,
                            rowData : doc,
                            formatRow : _formatRow,
                            exportFields : fieldsToExport,
                            table:tableName.toUpperCase(),
                            format :"EXCEL",
                            fields : exportFields,
                        });
                        if(isObj(d)){
                            printingData.push(d);
                        }
                    })
                    data = allData.length ? allData : printingData;
                    if(printInExcelDocument){
                        showPreloader("préparation du fichier excel....");
                        let sheetName = sanitizeSheetName(tableLabel);
                        if(!sheetName){
                            hidePreloader();
                            return notify.error("Vous devez renseigner le nom de la feuille excel dans laquelle exporter les donnédes");
                        }
                        fileName = defaultStr(fileName,filename,"export des "+sheetName+" au "+new Date().format('dd-mm-yyyy HHMM'))
                        if(!data.length){
                            hidePreloader();
                            return notify.warning("Aucune données à exporter dans le fichier excel");
                        }
                        let XLSX = require("xlsx");
                        let wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data,{dateNF: 'dd/MM/yyyy'}), sheetName);
                        fileName = fileName.sanitizeFileName().rtrim(".xlsx")+".xlsx";
                        showPreloader("impression du classeur excel...")
                        return APP.FILE.saveExcel({fileName,workbook:wb}).catch((e)=>{
                            console.log(e,' printing list data on exporting to excel')
                        }).finally(hidePreloader);
                    } else {
                        if(!data.length) return undefined;
                        return createTable({
                            labelFields:table.export.EXCEL.labelFields,
                            fields : exportFields,
                            fieldsToExport,
                            rowsFormatted : true,
                            groupBy : table.export.EXCEL.groupBy,
                            ...options,
                            data,
                        })
                    }
                },
                getPrintSettings : ({printTB})=>{
                    let extra = getFieldsToExportSettings({
                        fields : exportFields,
                    });
                    extra.printInExcelDocument = {
                        type : 'switch',
                        text : 'Imprimer dans un classeur excel',
                        defaultValue : 0,
                    }
                    Object.map(table.export.settings,(ex,i)=>{
                        extra[i] = ex;
                    })
                    return {extra,sessionName:'export-list-data-'+tableName,...opts};
                }
            }
        } else return null;
    },
    /*permet de créer l'entête des données de type tableau
        @param : l'entte du tableau à créer
        @param : les options supplémentaires
    */
    createTableHeader : (tableHeader,options)=>{
        if(!isObjOrArray(tableHeader)) return [];
        if(isFunction(options)){
            options = {render:options};
        }
        options = defaultObj(options);
        let {renderItem,render,...rest} = options;
        renderItem = isFunction(renderItem)? renderItem : isFunction(render)? render : undefined;
        rest = defaultObj(rest)
        let tH = [];
        Object.map(tableHeader,(e,index)=>{
            if(isFunction(renderItem)){
                if(isObj(e)){
                    e = renderItem({...e,index})
                } else {
                    e = renderItem({value:e,index})
                }   
            }
            if(isNonNullString(e)){
                tH.push(
                    {
                        text : e.toUpperCase(),
                        fillColor : getTableHeaderFillColor(),
                        color : Colors.getContrast(getTableHeaderFillColor()),
                        bold : true,
                        ...rest
                    }
                )
            }
        })
        return tH;
    },
    /**
     * 
     * @param {If pageBreakBefore returns true, a page break will be added before the currentNode. Current node has the following information attached:} currentNode 
     * @param {*} followingNodesOnPage 
     * @param {*} nodesOnNextPage 
     * @param {*} previousNodesOnPage 
     */
    pageBreakBefore: (options)=>{
        if(isFunction(options)){
            options = {pageBreakBefore:options};
        }
        options = defaultObj(options);
        let pageBreakBefore = defaultFunc(options.pageBreakBefore);
        return function(currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
            if(isObj(currentNode.startPosition) && isNonNullString(currentNode.text)){
                return pageBreakBefore({
                    ...currentNode.startPosition,
                    currentNode,
                    followingNodesOnPage, nodesOnNextPage, previousNodesOnPage,
                    text : currentNode.text,
                    top : defaultNumber(currentNode.startPosition.top),
                    pageWidth : currentNode.startPosition.pageInnerWidth,
                    left : currentNode.startPosition.left,
                    pageHeight : currentNode.startPosition.pageInnerHeight
                })
            }
            return currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0;
        }
    },
    /**** permet d'évaluer le contenu du pied de page
     *  @param {
     *      footerCopyRight : Le contenu de pied de page
     *  }
     */
    footer,
    canTogglePrintDate : ()=> Auth.isTableDataAllowed({table:'data',action:'toggleprintdate'}),
    getPrintedDate : (opts)=>{
        opts = defaultObj(opts);
        let displayPrintedDate = !canTogglePrintDate()? true : defaultVal(opts.displayPrintedDate,true);
        if(!displayPrintedDate){
            return null;
        }
        return [
            {
                text : [('Date de tirage : '+new Date().toFormat(APP.date.defaultDateTimeFormat)+", par : ").toUpperCase(),{text:Auth.getLoggedUserCode(),bold:true}],
                italics: true,
                fontSize : 11,
                margin : [0,3,0,0]
            } //: {}
        ]
    },
    printingTags : (printingTags,arg)=>{
        arg = defaultObj(arg);
        let columns = []
        Object.map(printingTags,(s,i)=>{
            if(isNonNullString(s)){
                columns.push(
                    isDOMElement() ? {
                        image : outlineText(s)
                    } : {
                        text : s
                    }
                )
            }
            return '';
        })
        if(columns.length <= 0) return null;
        return {
            columns,
            alignment : 'center',
        }
    },
    /***affiche le contenu rendu des ginataires du document
     * @param : tableau portant la liste des signataires du document
     */
    signatories : (signatories,arg,settings)=>{
        arg = defaultObj(arg);
        settings = defaultObj(settings);
        let marginNumber = isDecimal(arg.signatoriesMargin)? arg.signatoriesMargin : 3;
        let opts = {
            margin  : [0,5,0,0]
        }
        let canPrintSignatoriesImages = arg.printSignatoriesImages;
        marginNumber = Math.floor(marginNumber);
        let columns = []
        signatoriesItems = defaultObj(signatoriesItems);
        let _signatories = [];
        Object.map(signatories,(s,i)=>{
            if(isNonNullString(s)){
                let item = {label:s,order:0};
                if(isObj(signatoriesItems[s])){
                    item = signatoriesItems[s];
                }
                item.order = defaultNumber(item.order);
                _signatories.push(item);
            } 
        })
        _signatories = sortBy(_signatories,{
            column : 'order',
            dir : 'asc',
            returnArray : true,
        });
        _signatories.map((s,i)=>{
            let image = s.image;
            let sOptions = defaultObj(s.signatureOptions);
            let users = defaultArray(s.users);
            let style = {fontSize:14};
            s.fontStyle = defaultStr(s.fontStyle,'italics+bold').toLowerCase();
            if(s.fontStyle.contains("italics")){
                style.italics = true;
            }
            if(s.fontStyle.contains("bold")){
                style.bold = true;
            }
            s = defaultStr(s.label,s.code);
            if(isNonNullString(s)){
                let text = {text:s,...style};
                let canUPrint = users.length ? arrayValueExists(users,Auth.getLoggedUserCode()) : true;
                if(canPrintSignatoriesImages && isDataURL(image) && canUPrint){
                    let signature = {image,alignment:'center',margin:[0,0,0,0]};
                    let maxSignatureDim = defaultNumber(arg.maxCreatedSignaturePrintSize,MAX_CREATED_SIGNATURE_PRINT_SIZE)
                    let width = Math.abs(defaultNumber(sOptions.width)), 
                    height = Math.abs(defaultNumber(sOptions.height));
                    if(width && height){
                        width = Math.min(width,maxSignatureDim);
                        height = Math.min(height,maxSignatureDim);
                    } else if(width){
                        width = height = Math.min(width,maxSignatureDim)
                    } else if(height){
                        height = width = Math.min(height,maxSignatureDim);
                    } else {
                        width = height = maxSignatureDim
                    }
                    signature.fit = [width,height];
                    text = [text,signature]
                }
                columns.push(text);
            }
            return '';
        })
        if(columns.length > 0){
            let percent = (100/columns.length)
            for(let i in columns){
                columns[i].width = percent+"%";
            }
            let t = '';
            for(let i=0; i< marginNumber-1;i++){
                t+="\n";
            }
            if(t){
                columns.push({text:t})
            }
        } else {
            if(settings.duplicateDocOnPage){
                let t = '';
                for(let i=0; i< marginNumber-1;i++){
                    t+="\n";
                }
                if(t){
                    columns.push({text:t})
                }
            }
            delete opts.margin;
            return columns;
        }
        return {
            columns,
            alignment : 'center',
            ...opts
        }
    },
    /*** cette fonction prend en paramètre un tableau de donnés ou un objet à imprimer
    *  @param data {ArrayOf[object]|| object} les/la données à imprimer.
    *  lorsque data est un tableau, alors il s'agit de l'impression cumulée de plusieurs document
    *  lorsque data est un objet, alors il s'agit de l'impression d'une données de ventes
    *  @param arg {object
    *       data : tableau d'objet de données, ou objet document à imprimer
    *       print : La méthode de rappel appelée pour l'impression d'un document
    *       ...rest : les options d'impression du document
    * } : les options d'impression
    * 
    */
    print : function (arg){
       return new Promise((resolve,reject)=>{
           let {data,print,getSettings, ...rest} = defaultObj(arg);
           print = defaultFunc(print,(args)=>{
               resolve(args);
           });
           getSettings = defaultFunc(print.getSettings,getSettings,getSettings)
           rest = defaultObj(rest);
           let printTitle = defaultStr(rest.printTitle,rest.docTitle,rest.title);
           delete rest.onSuccess;
           let multiple = false;
           if(isArray(data)){
                multiple = data.length > 1? true : false;
                if(multiple === false){
                    data = data[0];
                }
           }
           if(!multiple){ 
              data = defaultObj(data);
           }
           let allData = data;
           getSettings({...rest,data,multiple,success:(settingsArgs)=>{
                if(settingsArgs.printInExcelDocument){
                    hidePreloader();
                    settingsArgs.format = "excel";
                    settingsArgs.printTB = printTB;
                    settingsArgs.data = settingsArgs.allData = data;
                    return print(settingsArgs)
                }
                let {pageBreakBeforeEachDoc,...rest} = settingsArgs;
                rest = defaultObj(rest)
                delete rest.data;
                let duplicateDocOnPage = rest.duplicateDocOnPage;
                if(duplicateDocOnPage){
                    let ds = [];
                    if(multiple){
                        for(let i in allData){
                            if(isDocUpdate(allData[i])){
                                ds.push(allData[i]);
                                ds.push(allData[i]);
                            }
                        }
                    } else ds = [data,data];
                    allData = ds;
                    multiple = true;
                }
                printTitle = defaultStr(printTitle,rest.printTitle,rest.docTitle);
                let printingFooterNote = rest.printingFooterNote ? rest.printingFooterNote : undefined;
                if(printingFooterNote){
                    printingFooterNote = require("./toPdfMakeObj")(APP.sprintf(printingFooterNote));
                    printingFooterNote = {
                        text : printingFooterNote,
                        fontSize: isNumber(rest.printingFooterNoteFontSize)? rest.printingFooterNoteFontSize: 11,
                        //italics : true
                    }
                    if(Colors.isValidColor(rest.printingFooterNoteTextColor)){
                        printingFooterNote.color = rest.printingFooterNoteTextColor;
                    }
                }
                let includeQRCode = rest.qrCodeInResult;
                let qrCodeAlignment = defaultStr(rest.qrCodeAlignment).toLowerCase();
                if(!arrayValueExists(["left","center","right"],qrCodeAlignment)){
                    qrCodeAlignment = "left";
                }
                let fileName = "";
                let countD = 0;
                if(multiple){
                    showPreloader("Impression en cours ...");
                    let promises = [];
                    let allContents = [];
                    let pageBreakBefores = []
                    let backgrounds = undefined;
                    let allDocDef = {}
                    for(let i in allData){
                        if(isDocUpdate(allData[i])){
                            let p = print({...rest,multiple,data:allData[i],printTitle:allData[i].code+"-"+(allData.length-1)+"documents"});
                            if(isPromise(p)){        
                                fileName = defaultStr(fileName,allData[i].code)
                                countD++
                                promises.push(p.then((r)=>{
                                    return {result:r,data:allData[i]}
                                }));
                            } else if(isValidPrintableContent(p)){
                                fileName = defaultStr(fileName,allData[i].code)
                                countD++
                                promises.push(Promise.resolve({result:p,data:allData[i]}));
                            }
                        }
                    }
                    let counter = 0;
                    return Promise.all(promises).then((results)=>{
                        for(let i in results){
                            let result = results[i].result;
                            let qrCode = generate(results[i].data);
                            qrCode.alignment = qrCodeAlignment;
                            if(isValidPrintableContent(result)){
                                let {docDefinition,content,options}= result;
                                counter ++;
                                if(isArray(result.content)){
                                    if(printingFooterNote){
                                        result.content.push(printingFooterNote);
                                    }
                                    let printedDateStr = getPrintedDate(settingsArgs);
                                    if(printedDateStr){
                                        result.content.push(printedDateStr);
                                    }
                                    let printingTags = printingTags(settingsArgs.printingTags,settingsArgs);
                                    if(printingTags){
                                        result.content.push(printingTags);
                                    }
                                    let sign = signatories(settingsArgs.signatories,settingsArgs,{duplicateDocOnPage});
                                    if(sign){
                                        result.content.push(sign);
                                    }
                                    
                                    
                                    if(includeQRCode && isNonNullString(qrCode.qr)){
                                        result.content.push(qrCode);
                                    }
                                }
                                /*if(duplicateDocOnPage && counter%2 == 1){
                                    result.content.push({text:DUPLICATE_TEXT_CONTENT, color:"white",id:DUPLICATE_TEXT_CONTENT+"-"+counter})
                                }*/
                                if(counter > 1 && pageBreakBeforeEachDoc){
                                    //saut de page suite à une nouveau pd
                                    allContents.push({text:'',pageBreak: 'before'});
                                } else if(counter > 1){
                                    allContents.push({text:'\n\n'});
                                }
                                allContents.push(result.content);
                                if(isFunction(docDefinition.pageBreakBefore)){
                                    pageBreakBefores.push(docDefinition.pageBreakBefore.bind({},options));
                                }
                                if(typeof backgrounds !== 'function'){
                                    backgrounds = isFunction(docDefinition.background)? docDefinition.background : result.background;
                                }
                                APP.extend (allDocDef,docDefinition);
                            }
                        }
                        allDocDef.pageBreakBefore = pageBreakBefore((args)=>{
                            for( let i in pageBreakBefores){
                                if(pageBreakBefores[i]() === true) return true;
                            }
                            return false;
                        });
                        if(isFunction(backgrounds)){
                            allDocDef.background = (currentPage, pageSize)=>{
                                return backgrounds({pageSize,currentPage,multiple,counter,pageBreak:pageBreakBeforeEachDoc,allData,settings:settingsArgs});
                            };
                        }
                        let docDef = {data,printTitle,content:allContents,docDefinition:allDocDef,options:rest}
                        delete docDef.success;delete docDef.resolve; delete docDef.error; delete docDef.reject;
                        docDef.success = ((args)=>{
                            resolve(args);
                            hidePreloader();
                        });
                        docDef.error = ((e)=>{
                            reject(e);
                            hidePreloader();
                        });
                        docDef.multiple = multiple;
                        fileName+= (countD-1>0? ("-et-"+(countD-1)+"-documents"):"");
                        docDef.fileName = defaultStr(docDef.fileName,rest.fileName,fileName);
                        docDef.printTitle = defaultStr(docDef.printTitle,fileName)
                        createPDFFile (docDef)
                    }).catch((e)=>{
                        resolve({status:false,error:e});
                        hidePreloader();
                        console.log(e,' printing all database data')
                    });
                }
                allData = [data];
                let p = print({...rest,multiple,data,allData})
                if(isValidPrintableContent(p)){
                    p = Promise.resolve(p);
                }
                if(isPromise(p)){     
                    showPreloader("Impression en cours ...");
                    p.then((args)=>{
                        let printedDateStr = getPrintedDate(settingsArgs);
                        let docDef = {...args,data,printTitle};
                        docDef.docDefinition = defaultObj(docDef.docDefinition);
                        let {background} = docDef;
                        args = defaultObj(args);
                        background = isFunction(background)? background : args.background;
                        docDef.fileName = defaultStr(docDef.fileName,rest.fileName,data.code);
                        delete docDef.success;delete docDef.resolve; delete docDef.error; delete docDef.reject;
                        if(isArray(docDef.content)){
                            if(printingFooterNote){
                                docDef.content.push(printingFooterNote);
                            }
                            if(printedDateStr){
                                docDef.content.push(printedDateStr);
                            }
                            let printingTags = printingTags(settingsArgs.printingTags,settingsArgs);
                            if(printingTags){
                                docDef.content.push(printingTags);
                            }
                            let sign = signatories(settingsArgs.signatories,settingsArgs,{duplicateDocOnPage});
                            if(sign){
                                docDef.content.push(sign);
                            }
                            
                            if(includeQRCode){
                                let qrCode = generate(data);
                                qrCode.alignment = qrCodeAlignment;
                                if(qrCode.qr) docDef.content.push(qrCode);
                            }
                        }
                        if(isFunction(background)){
                            /**** les paramètres d'impression de l'arrière plan : 
                             *  pageSize : {width,heigh}, la taille de la page courante
                             *  currentPage : le numéro de la page courante
                             *  settings : les paramètres d'impression
                             *  counte : //le nombre de documents à imprimer
                             *  multiple : //s'il s'agit d'une impression multiple
                             */
                            docDef.docDefinition.background = (currentPage, pageSize)=>{
                                return background({pageSize,currentPage,multiple,counter:1,pageBreak:true,allData,settings:settingsArgs});
                            };   
                        }
                        docDef.success = ((args)=>{
                            resolve(args);
                            hidePreloader();
                        });
                        docDef.error = ((e)=>{
                            reject(e);
                            hidePreloader();
                        });
                        
                        createPDFFile(docDef)
                    }).catch((e)=>{
                        console.log(e,' printing document error ',data)
                        resolve({status:false,error:e,data});
                        hidePreloader();
                    })
                } else {
                    hidePreloader();
                    console.warn("Impossible d'exécuter le fonction print, car la méthode print passé en paramètre ne retourne pas une promesse")
                    Promise.resolve({status:false,msg, data })
                }
           },printTB},{printTB})
       })
    },
    /**** vérifie si le document imprimé est valide*/
    isValidPrintedDoc : ()=>{

    },
    getSettings : ({success,data,formatName,sessionName,ignore,error,multiple,extra,title,sessionData,...options})=>{
        extra = defaultObj(extra);
        sessionName = defaultStr(sessionName,"print-settings")+"-print-pages";
        let defaultData = defaultObj($session.get(sessionName));
        APP.extend(defaultData,sessionData);
        options = defaultObj(options);
        title = defaultStr(title,"Options d'impressions")
        let {FormPage,FormDialog} = require("$wcomponents/Form");
        data = defaultObj(data);
        delete defaultData.printInExcelDocument;///on réinitialise l'impression dans un document excel
        let canPrintSignatoriesImages = Auth.isAllowed("structdata/signatories/printimage");
        let Image = require("$wcomponents/Image")
        extra.watermark = {
            text : 'Texte de filigrane',
            defaultValue : defaultStr(APP.getCompany("name"),APP.getName())
        }
        extra.signatories = {
            type : 'selectstructdata',
            table : 'signatories',
            text : 'Signataires',
            multiple : true,
            disabled : Auth.isStructDataAllowed({table:'signatories',action:'read'})? false : true,
            dynamicRenderContent : true,
            renderItem : !canPrintSignatoriesImages ? undefined : ({item,context}) =>{
                return <Button iconEl={
                        <Image src={item.image} round = {false} className="printing-image-signatory" 
                            onChange = {(opts)=>{
                                if(isObj(opts)){
                                    item.image = opts.dataURL;
                                    item.hasCreated = true;
                                    item.signatureOptions = opts;
                                    if(context){
                                        context.refresh();
                                    }
                                }
                            }}
                            drawProps = {{trim:true}}
                            drawText = "Signer"
                        />
                    }
                    iconBefore = {false}
                    className="printing-image-signatory-btn"
                >
                        {item.label}
                </Button>
            },
            itemValue : ({item,items})=> {
                signatoriesItems = items;
                return item.code;
            },
        }
        if(!canPrintSignatoriesImages){
            defaultData.printSignatoriesImages = 0;
        } else {
            extra.printSignatoriesImages = {
                type : 'switch',
                text : 'Affich images de signatures préenregistrées',
                disabled : canPrintSignatoriesImages ? false : true,
                defaultValue : 0,
            }
            extra.maxCreatedSignaturePrintSize = {
                type :"number",
                text : "Taille maximale de la signature image",
                defaultValue : MAX_CREATED_SIGNATURE_PRINT_SIZE
            }
        }
        extra. signatoriesMargin = {
            type : 'number',
            validType : 'number',
            text : 'Nbrs sauts de lignes après signataires',
            tooltip : 'Entrez le nombre de sauts de lignes à laisser sur la page après la ligne des signataires',
            defaultValue : 3,
        };
        if(Auth.isStructDataAllowed({table:'printing_tags',action:'read'})){
            extra.printingTags = {
                type : 'selectstructdata',
                table : 'printing_tags',
                text : 'Etiquettes',
                multiple : true,
            }
        }
        extra.displayEmailOnHeader = {
            text : 'Afficher l\'Email société en entête',
            type : 'switch',
            defaultValue : 0,
        }
        extra.displayFaxOnHeader = {
            text : 'Afficher le fax société en entête',
            type : 'switch',
            defaultValue : 0,
        }
        extra.dynamicPageHeaderWidth = {
            text : 'Optimiser l\'affichage de l\'entête du document',
            type : 'switch',
            defaultValue : 0,
        }
        if(canTogglePrintDate()){
            extra.displayPrintedDate = {
                text : 'Afficher la date de tirage',
                defaultValue : 1,
                type : 'switch',
            }
            /*extra.customPrintDate = {
                text : "Date de tirage personnalisée",
                format : 'hashtag',
                defaultValue : ""
            }
            delete defaultData.customPrintDate;*/
        } else delete extra.displayPrintedDate;
        extra.defaultFontColor = {
            type  : 'color',
            text : 'Couleur de texte par défaut',
            defaultValue : "#000000"
        }
        extra.printingFooterNote = {
            text : 'Note de bas de page',
            format : 'hashtag'
        }
        extra.printingFooterNoteFontSize = {
            type : 'number',
            text : 'Taille police note de bas de page',
            defaultValue : 11,
        }
        extra.printingFooterNoteTextColor = {
            type  : 'color',
            text : 'Couleur texte note de bas de page',
            defaultValue : "#000000"
        }
        extra.footerCopyRight = {
            text : 'Pied de page',
            format : 'hashtag'
        }
        extra.footerCopyRightColor = {
            type  : 'color',
            text : 'Couleur texte de pied de page',
            defaultValue : "#000000"
        }
        extra.qrCodeInResult = {
            type : 'switch',
            label : 'QR Code',
            checkedTooltip : 'Un QR sera inséré au base de page du fichier',
            defaultValue : 0,
        } ;
        extra.qrCodeAlignment = {
            type : 'select',
            text : 'Positionner le QRCode',
            selected : 'left',
            multiple : false,
            items : [{code:'left',label:'A gauche'},{code:'center',label:'Au centre'},{code:'right',label:'A droite'}]
        }
        extra.allowFilePreview = {
            type :"switch",
            text : 'Prévisualiser le document imprimé',
            defaultValue : 1,
        }
        return new Promise((resolve,reject)=>{
            if(ignore === true && isNonNullString(formatName) && isObj(printingPageFormats) && isObj(printingPageFormats[data.formatName])){
                let args = {...options,formatName,...printingPageFormats[data.formatName]}
                if(isFunction(success)){
                    success(args)
                } else {
                    resolve(args);
                }
                return args;
            }
            let onError = (args)=>{
                if(isFunction(error)){
                    error(args);
                } else {
                    reject({status:false,msg:'impression annulée',options:args})
                }
            }, onSuccess = (args)=>{
                showPreloader("Impression en cours ...");
                setTimeout(()=>{
                    let {data} = args;
                    $session.set(sessionName,data);
                    let printSetting = {}
                    if(isObj(printingPageFormats) && isObj(printingPageFormats[data.formatName])){
                        printSetting = printingPageFormats[data.formatName];
                    }
                    args = {...printSetting,...data}
                    if(isFunction(success)){
                        success(args)
                    } else {
                        resolve(args);
                    }
                },10);
                return true;
            }        
            let restP = {
                fullPage:APP.isMobileOrTabletMedia()|| isCapacitor(true),
            };
            let Component = restP.fullPage ? FormPage : FormDialog;
            if(!restP.fullPage){
                restP.no = {
                    text : 'Annuler',
                    icon : 'cancel',
                };
                restP.ok = {
                    text : 'Imprimer',
                    icon : 'mdi-printer',
                }
                restP.onSuccess = onSuccess;
                restP.onError = onError;
            } else {
                restP.closeAfterSave =true;
                restP.dialogProps = {
                    onClose : (args)=>{
                        if(args && args.closed){
                            onError();
                        }
                    }
                }
                restP.actions = {
                    ok : {
                        text : 'Imprimer',
                        icon : 'mdi-printer',
                        onClick : (data)=>{
                            return onSuccess({data});
                        }
                    },
                }
            }
            let isMasterAdmin = Auth.isMasterAdmin()
            let uCode = Auth.getLoggedUserCode()
            let pageBreakBeforeEachDocIsDisabled = multiple ? false : true;
            mountDialog(<Component
                visible 
                title = {title}
                key = {_uniqid("print-doc"+defaultStr(data.table))}
                data = {defaultData}
                {...restP}
                fields = {{
                    formatName : {
                        text : "Format d'impression",
                        multiple : false,
                        type : 'selectstructdata',
                        defaultValue : 'A4',
                        table : "print_formats",
                        sortableFields : {code:'Code',label:'Intitulé'},
                        filter : ({item})=>{
                            if(isObj(item) && isNonNullString(item.code)){
                                if(isMasterAdmin) return true
                                return isArray(item.users) && item.users.length ? arrayValueExists(item.users,uCode) : true
                            }
                            return false;
                        },
                        onFetchItems : ({items})=>{
                            printingPageFormats = items;
                        },
                        onValidate : ({item,context})=>{
                            if(item && context && context.getField){
                                let sFields = context.getField("signatories");
                                var selected = defaultArray(item.signatories);
                                if(isFunction(sFields.selectValue)){
                                    sFields.selectValue(selected,true);
                                }
                                let signatoriesMargin = context.getField("signatoriesMargin");
                                if(signatoriesMargin){
                                    signatoriesMargin.setValue(item.signatoriesMargin);
                                }
                                /*if(isNonNullString(item.footerNote)){
                                    let printingFooterNote = context.getField("printingFooterNote");
                                    if(printingFooterNote){
                                        printingFooterNote.setValue(item.footerNote)
                                    }
                                }*/
                                if(isNonNullString(item.footerCopyRight)){
                                    let fCopyRight = context.getField("footerCopyRight");
                                    if(fCopyRight){
                                        fCopyRight.setValue(item.footerCopyRight)
                                    }
                                }
                            }
                        },
                        itemValue : ({item})=>{
                            return item.code;
                        },
                        required : true,
                    },
                    duplicateDocOnPage : {
                        text :'Dupliquer le(s) document(s)',
                        type : 'switch',
                        defaultValue :  0,
                        onValidate : multiple ? undefined : ({value,context}) =>{
                            if(context){
                                let pageBreakBeforeEachDoc = context.getField("pageBreakBeforeEachDoc");
                                if(pageBreakBeforeEachDoc){
                                    if(value){
                                        pageBreakBeforeEachDoc.enable();
                                        pageBreakBeforeEachDocIsDisabled = false;
                                    } else {
                                        pageBreakBeforeEachDoc.disable();
                                        pageBreakBeforeEachDocIsDisabled = true;
                                    }
                                }
                            }
                        }
                    },
                    pageBreakBeforeEachDoc : {
                        text :'Saut de page par document',
                        type : 'switch',
                        defaultValue :  1,
                        checkedTooltip : 'Insérer un saut de page avant chaque nouveau document',
                        uncheckedTooltip : 'Ne pas insérer un saut de page avant chaque nouveau document',
                        getValidValue : ({context,data}) => {
                            let v = pageBreakBeforeEachDocIsDisabled ? 0 : context.getValue();
                            data.pageBreakBeforeEachDoc = v;
                            return v;
                        }
                    },
                    ...extra,
                }}
            />,"print-sales-docs")
        })
    }
}
