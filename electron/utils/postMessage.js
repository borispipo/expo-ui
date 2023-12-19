/****
 * envoie un message au client à travers la fonction postMessage de window, le message envoyé sera de la forme : 
 * {
 *   message : ELECTRON_MESSAGE/{message en question},
 *   callback : {function}, la fonction de rappel
 *   params : {array}, les paramètres supplémentaires à la fonction
 * }
 * @param message {string|object} le message à envoyer au client web
 * @param [...params], le reste des paramètres
 */
module.exports = function(message,...params){
    message = typeof message =='string' ? {message} : message;
    const opts = message && typeof message =='object' && !Array.isArray(message) ? message : {};
    message = opts.message;
    if(!message || typeof message !='string') return null;
    opts.params = Array.isArray(opts.params) && opts.params || params;
    opts.message = "ELECTRON_MESSAGE/"+message.trim();
    return window.postMessage(opts);
}