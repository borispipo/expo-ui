/**** permet de parser un QRCODE LUE A PARTIR DU SCANNER
 * @param {string} //le qrCode lu
 * @return void
 */
let parse = (str)=>{
    if(!isNonNullString(str)) return null;
    return parseJSON('{"' + decodeURI(str).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
}
/***** génère le qr code à partir de la données passée en paramètre
 * @param {string||object}, si c'est une chaine de caractère, alors le contenu est retourné, sinon, ça doit être un document valide de l'applicaton
 * @return {object, pdfmake} {
 *      qr : //la valeur du contenu du qrCode voir, https://pdfmake.github.io/docs/0.1/document-definition-object/qr/
 * }
 */
let generate = (data)=>{
    if(isObj(data)){
        let t = "";
        Object.map({id:"_id",db:"dbId",tb:"table"},(v,i)=>{
            if(isNonNullString(data[v])){
                t+=(t?"&":"")+i+"="+data[v];
            }
        })
        data = t;
    }
    if(isNonNullString(data)){
        data+="&c="+APP.getName()+"&u="+Auth.getLoggedUserCode()+"&d="+new Date().toSQLDateTimeFormat();
        return  {
            qr : encodeURI(data),
            fit : '90',
            margin : [0,5,0,0]
        }
    }
    return {qr : undefined};
}

let scan = (data)=>{

}

module.exports = {
    generate,
    scan,
    parse
}