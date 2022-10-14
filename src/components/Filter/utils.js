
import {isNonNullString,defaultStr,isObjOrArray,isObj} from "$utils";

export const filterTextTypes = ['text','number','email','search','tel','url','password',"id","idfield",'piecefield','piece'];

export const regexActions = {
    $regexequals : 'Egal à',
    $regexcontains : 'Contient',
    $regexnotcontains : 'Ne contient pas',
    $regexnotequals : 'Différent de',
    $regexstartswith : 'Commence par',
    $regexendswith : 'Se termine par'
 }
export const escapeRegexChars = (value)=>{
    //if(value === undefined || value ===null || value === '' || value ==='undefined') return '';
    //value+='';
    if(!isNonNullString(value)) return '';
    let escapeChars = ['!', '^', '$', '(', ')', '[', ']', '{', '}', '?', '+', '*', '.', '/', '\\', '|']
    for(var i in escapeChars){
        value.replace(escapeChars[i],'\\'+escapeChars[i]);
    }
    return value.toString();
}

export const getFilterStateValues = (state)=>{
    state = defaultObj(state);
    const r = {};
    ['defaultValue','action','actions','operator','operators','ignoreCase','value','manualRun'].map((v)=>{
      r[v] = state[v];
    })
    return r;
  
}

/**** si le filtre peut être pris en compte */
export const canHandleFilter = (f)=>{
    if(!isObj(f)) return false;
    if(!isNonNullString(f.operator) || !isNonNullString(f.action)) {
        return false;
    }
    if(f.value === undefined || f.value === 'undefined' || f.value ==='' || f.value ===null) {
        return false;
    }
    if(f.value instanceof RegExp){
        return true;
    }
    if(isObjOrArray(f.value) && Object.size(f.value,true) <=0) return false;
    return true;                    

}

export const regexParser = {
    equals : (val)=> {
        if(!isNonNullString(val)) return '';
        return "/^"+escapeRegexChars(val)+'$/';
    },
    startswith : (val) => {
        if(!isNonNullString(val)) return "";
        return "/^"+escapeRegexChars(val)+'/'
    },
    endswith : (val) => {
        if(!isNonNullString(val)) return ""; 
        return  escapeRegexChars(val)+'$/'
    },
    contains : (val) => {
      if(!isNonNullString(val)) return "";
      return  "/"+escapeRegexChars(val)+'/'
    },
    notequals : (val) => {
      if(!isNonNullString(val)) return ""
      return "^(?!"+escapeRegexChars(val)+"$).*$"
    },
    notcontains : (val) =>{
      if(!isNonNullString(val)) return ""; 
      return "^((?!("+escapeRegexChars(val)+")).)*$"
    }
 }

export const matchPouchDBOperator = (operator,value)=>{
    if(!isNonNullString(operator)) return null;
    if(!(value) && !isDecimal(value)) return null;
    switch(operator){
        case "MATCH":
            if(isDecimal(value)) value +="";
            return {operator:"$regex",value:RegExp(defaultStr(regexParser.contains(value)).ltrim("/").rtrim("/"),'i')}
        case "NOTMATCH": 
          if(isDecimal(value)) value +="";
           return {operator:"$regex",value:RegExp(defaultStr(regexParser.notcontains(value)).ltrim("/").rtrim("/"),'i')}
        case "EQ" : 
            return {operator:'$eq',value}
        case "NEQ" : 
            return {operator:"$ne",value}
        case "GT":
          return {operator:"$gt",value}
        case "GTE":
            return {operator:"$gte",value}
        case "LT":
          return {operator:"$lt",value}
        case "LTE":
          return {operator:"$lte",value}
    }
  }

let Operators = {
    NONE: null,
    MATCH: {
        name: 'contient',
        func: function(value, term) {
            if(value) {
                return value.toString().search(utils.isRegExp(term) ? term : new RegExp(term, 'i')) >= 0;
            } else {
                return !(!!term);
            }
        },
        regexpSupported: true
    },
    NOTMATCH: {
        name: 'ne contient pas',
        func: function(value, term) {
            if(value) {
                return value.toString().search(utils.isRegExp(term) ? term : new RegExp(term, 'i')) < 0;
            } else {
                return !!term;
            }
        },
        regexpSupported: true
    },
    EQ: {
        name: '=',
        func: function(value, term) {
            return value == term;
        },
        regexpSupported: false
    },
    NEQ: {
        name: '<>',
        func: function(value, term) {
            return value != term;
        },
        regexpSupported: false
    },
    GT: {
        name: '>',
        func: function(value, term) {
            return value > term;
        },
        regexpSupported: false
    },
    GTE: {
        name: '>=',
        func: function(value, term) {
            return value >= term;
        },
        regexpSupported: false
    },
    LT: {
        name: '<',
        func: function(value, term) {
            return value < term;
        },
        regexpSupported: false
    },
    LTE: {
        name: '<=',
        func: function(value, term) {
            return value <= term;
        },
        regexpSupported: false
    }
};
 let utils = {
    ALL: '#All#',
    NONE: '#None#',
    BLANK: '#Blank#"',
    expressionFilter : function(operator, term, staticValue, excludeStatic) {
        var self = this;
    
        this.operator = Operators.get(operator);
        this.regexpMode = false;
        this.term = term || null;
        if(this.term && this.operator && this.operator.regexpSupported) {
            if(utils.isRegExp(this.term)) {
                this.regexpMode = true;
                if(!this.term.ignoreCase) {
                    this.term = new RegExp(this.term.source, 'i');
                }
            }
        }
    
        this.staticValue = staticValue;
        this.excludeStatic = excludeStatic;
    
        this.test = function(value) {
            if(Array.isArray(self.staticValue)) {
                var found = self.staticValue.indexOf(value) >= 0;
                return (self.excludeStatic && !found) || (!self.excludeStatic && found);            
            } else if(self.term) {
                return self.operator.func(value, self.term);
            } else if(self.staticValue === true || self.staticValue === utils.ALL) {
                return true;
            } else if(self.staticValue === false || self.staticValue === utils.NONE) {
                return false;
            } else {
                return true;
            }
        };
    
        this.isAlwaysTrue = function() {
            return !(self.term || Array.isArray(self.staticValue) || self.staticValue === utils.NONE || self.staticValue === false);
        };
    },
    defaultOperator : 'MATCH',
    Operators,
    constants : {},
    items : {
        EQ: Operators.EQ.name,
        MATCH : Operators.MATCH.name,
        NOTMATCH : Operators.NOTMATCH.name,
        NEQ : Operators.NEQ.name,
        GT : Operators.GT.name,
        GTE : Operators.GTE.name,
        LT : Operators.LT.name,
        LTE : Operators.LTE.name
    },
    isRegExp: function(obj) {
        return Object.prototype.toString.apply(obj) === '[object RegExp]';
    },
    /**
     * Escapes all RegExp special characters.
     */
     escapeRegex: function(re) {
        return re.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    },
    /**** vérifie si la valeur {value}, match la valeur {filterText} 
     * @param {object : {
     *      value : la valeur à vérifier
     *      filterText : le texte à vérifier si value le match
     *      operateur : chaine de caractère dans la liste des opérateurs :, props Operators, ci-desous
     *      useRegex : Spécifie si l'expression régulière sera utilisée pour la recherche
     * }}
    */
    match : ({value,filterText,operator,useRegex})=>{
        if(isNonNullString(operator)){
            operator = Operators[operator]
        }
        filterText = defaultStr(filterText);
        operator = defaultObj(operator);
        let isSearchMode = filterText !== '';
        if(operator && isFunction(operator.func)){
            let opterm = operator.regexpSupported && isSearchMode ? (useRegex ? filterText : utils.escapeRegex(filterText)) : filterText;
            return !isSearchMode || operator.func(value, opterm)
        }
        return !isSearchMode ? true : defaultStr(value).toLowerCase().contains(filterText.toLowerCase());
    },
    /**
     * Returns the first element in the array that satisfies the given predicate
     * @param  {Array} array     the array to search
     * @param  {function} predicate Function to apply to each element until it returns true
     * @return {Object}           The first object in the array that satisfies the predicate or undefined.
     */
    findInArray: function(array, predicate) {
        if (this.isArray(array) && predicate) {
            for (var i = 0; i < array.length; i++) {
                var item = array[i];
                if (predicate(item)) {
                    return item;
                }
            }
        }
        return undefined;
    },
    /**
     * Returns a JSON string represenation of an object
     * @param {object} obj
     * @return {string}
     */
    jsonStringify: function(obj, censorKeywords) {
        function censor(key, value) {
            return censorKeywords && censorKeywords.indexOf(key) > -1 ? undefined : value;
        }
        return JSON.stringify(obj, censor, 2);
    }
 }
 
for(let i in utils.items){
    utils.constants[i] = i;
}

export default utils;