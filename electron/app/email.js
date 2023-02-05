const nodemailer = require("nodemailer");
let Email = {}
let getEmailSettings = x => defaultObj(APP.getRemoteInfos().get("smtp"));
let isAvailable = ()=>{
    if(!window.APP || typeof window.APP == "undefined") return false;
    let infos = getEmailSettings();
    let isR = infos.host && infos.port && infos.password && isNonNullString(infos.user)? true : false;
    if(!isR){
        APP.getRemoteInfos().check();
    }
    return isR;
}
let notAllowedMsg = 'Impossible d\'envoyer un mail car cette fonction n\'est pas disponible pour cette installation du logiciel';
Object.defineProperties(Email,{
    send : {
        value : (opts)=>{
            if(!isAvailable()) return Promise.reject({msg:notAllowedMsg})
            let emailSettings =getEmailSettings();
            opts = defaultObj(opts);
            opts.auth = {
                user: emailSettings.user, // generated ethereal user
                pass: defaultStr(emailSettings.pass,emailSettings.password), // generated ethereal password
            }
            if(!opts.from || !isValidEmail(opts.from)){
                opts.from = defaultStr(emailSettings.email,APP.getDevMail());
            }
            if(Array.isArray(opts.to)){
                opts.to = opts.to.join(",");
            }
            let transporter = nodemailer.createTransport({
                ...emailSettings,
                auth: {
                  user: emailSettings.user, // generated ethereal user
                  pass: defaultStr(emailSettings.pass,emailSettings.password), // generated ethereal password
                },
            });
            showPreloader(defaultStr(opts.preloader,"envoie de l'email en cours..."))
            return new Promise((resolve,reject)=>{
                    transporter.sendMail(opts, function(err, reply) {
                        hidePreloader();
                        if(err){
                            console.log(err," error sending email")
                            //APP.require("$notify").error(err);
                            reject(err);
                        } else resolve(reply);
                
                    })
            })
        }
    },
    nodemailer : {value : nodemailer},
    isAvailable : {value : isAvailable},
    notAllowedMsg : {value : notAllowedMsg}
})
module.exports = Email;