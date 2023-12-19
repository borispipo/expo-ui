module.exports = (str)=>{
    if(typeof str !=='string' || !str) return false;
    return /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/.test(str);
};
