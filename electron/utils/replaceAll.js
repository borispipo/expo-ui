function replaceAll (value,find,replace){
    if(typeof value !=='string' || typeof find !=='string' || typeof replace !=='string') return "";
    return value.split(find).join(replace)
}

if(typeof String.prototype.replaceAll !== 'function'){
    String.prototype.replaceAll = function(find,replace){
        return replaceAll(this.toString(),find,replace);
    }
}

module.exports = replaceAll;