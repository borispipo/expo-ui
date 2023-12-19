module.exports = function isBase64(str, options) {
    if(!str || typeof str !=='string') return false;
    options = Object.assign({},options);
    options.urlSafe = typeof options.urlSafe =='boolean'? options.urlSafe: false;
    const len = str.length;
    if (options.urlSafe) {
        return /^[A-Z0-9_\-]*$/i.test(str);
    }
    if (len % 4 !== 0 || /[^A-Z0-9+\/=]/i.test(str)) {
        return false;
    }
    const firstPaddingChar = str.indexOf('=');
    return firstPaddingChar === -1 || firstPaddingChar === len - 1 || (firstPaddingChar === len - 2 && str[len - 1] === '=');
}