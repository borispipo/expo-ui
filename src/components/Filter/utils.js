
import {isNonNullString,defaultStr,defaultArray,isObjOrArray,isObj} from "$utils";
import DateLib from "$date";
import mangoParser from "mongo-parse";

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

export const regexExpressions = {
    notcontains : {
        left : "^((?!(",
        right : ")).)*$",
        /***@see : https://www.w3schools.com/sql/sql_like.asp */
        sql : (string)=>{
            return "%"+defaultStr(string).ltrim("%").rtrim("%")+"%";
        }
    },
    notequals : {
        left : "^(?!",
        right : "$).*$",
    },
    equals : {
        left : "/^",
        right : '$/'
    },
    startswith : {
        left : "/^",
        right : '/',
        sql : (string)=>{
            return defaultStr(string).rtrim("%")+"%";
        }
    },
    endswith : {
        left : "",
        right : '$/',
        sql : (string)=>{
            return "%"+defaultStr(string).ltrim("%");
        }
    },
    contains : {
        left : "/",
        right : '/',
        sql : (string)=>{
            return "%"+defaultStr(string).ltrim("%").rtrim("%")+"%";
        }
    },
}
/**** prend en paramètre une chaine de caractère et un nom d'opérateur et génère 
 *  la chaine de caracètre mango regex correspondant
 */
const toMangoRegex = (val,operator)=>{
    if(!isNonNullString(val) || !isNonNullString(operator) || !regexExpressions[operator]) return "";
    const rOp = regexExpressions[operator];
    return rOp.left+escapeRegexChars(val)+rOp.right;
}
export const regexParser = {
    equals : (val)=> {
        return toMangoRegex(val,"equals");
    },
    startswith : (val) => {
        return toMangoRegex(val,"startswith");
    },
    endswith : (val) => {
        return toMangoRegex(val,"endswith");
    },
    contains : (val) => {
        return toMangoRegex(val,"contains");
    },
    notequals : (val) => {
       return toMangoRegex(val,"notequals");
    },
    notcontains : (val) =>{
       return toMangoRegex(val,"notcontains");
    }
}
/*** prend une expression regulière et le convertis en operateur, valeur 
 * @param {string} la valeur otenue au format regex
*/
export const regexDeparser = (regexValue)=>{
    if(!regexValue) return null;
    regexValue = regexValue.toString();
    if(regexValue.endsWith("/i")){
        regexValue = regexValue.rtrim("/i")+"/";
    }
    if(!isNonNullString(regexValue)) return null;
    for(let i in regexExpressions){
        const p = regexExpressions[i];
        let rVal = regexValue.ltrim("/").rtrim("/");
        const pLeft = p.left.ltrim("/"),pRight = p.right.rtrim("/");
        if(rVal.startsWith(pLeft) && rVal.endsWith(pRight)){
            return {
                operator : i,
                value : rVal.ltrim(pLeft).rtrim(pRight),
                regexValue : rVal,
            }
        }
    }
    return null;
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
        case "IN":
            return {operator:"$in",value}
        case "NOT IN":
            return {operator:"$in",value}
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
 const utils = {
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

/*** prend en paramètre un objet de filtres et les prépare pour la requête distante
 * @param {object} filtersToPrepare les filtres à exploiter pour la requête distante 
 * le tableau des filtres 
 * @param {function|object} filter|options, la méthode utilisée pour effectuer un filtre sur les les élément à prendre en compte
 * 
*/
export const prepareFilters = (filtersToPrepare,opts)=>{
    if(typeof opts =='function'){
        opts = {filter:opts};
    }
    let {filter,convertToSQL:convToSQL} = opts;
    const filters = {}
    filter = typeof filter =='function'? filter : x=>true;
    Object.map(filtersToPrepare,(f,i)=>{
        if(!isObj(f) || !filter(f) || !isNonNullString(f.operator) || !isNonNullString(f.action)) {
            return;
        }
        f.field = defaultStr(f.field,i).trim();
        f.action = defaultStr(f.action).toLowerCase().trim();
        if(f.action =="$today"){
            f.operator = "$and";
            f.action = "$eq"
        }
        filters[f.operator] = defaultArray(filters[f.operator]);
        const ob = {};
        ob[f.field] = {}
        if(f.action == "$period"){
            let sp = defaultStr(f.value);
            if(sp){
                sp = sp.split("=>");
                const isValid1 = DateLib.isValidSQLDate(sp[0]) || DateLib.isValidSQLDateTime(sp[0]);
                const isValid2 = DateLib.isValidSQLDate(sp[1]) || DateLib.isValidSQLDateTime(sp[1]);
                if(isValid1 && isValid2){
                    filters[f.operator].push({
                        [f.field] : {$gte:sp[0]}
                    })
                    filters[f.operator].push({
                        [f.field] : {$lte:sp[1]}
                    })        
                }
            }
        } else {
            ob[f.field][f.action] = f.value;
            filters[f.operator].push(ob)
        }
    });
    return convToSQL ? convertToSQL(filters) : filters;
}

/*** la liste des actions supportés par les filtres 
 * @see : https://github.com/cloudant/mango from mango query mapping
 *  
*/
export const actions = ["$lt", "$gt", "$lte", "$gte", "$eq", "$exists", "$type", "$in", "$nin", "$all", "$size", "$or", "$nor", "$not", "$mod", "$regex", "$elemMatch"]

export default utils;

/*** convertis les filtres pris au format mangoesQuey, au format de sortie SQL
 * @see : https://github.com/gordonBusyman/mongo-to-sql-converter
 * @param {object} filters, les filtres au format mango query à convertir au format SQL
 */
export const convertToSQL = (filters)=>{
    if(!isObjOrArray(filters)) return [];
    const whereParsed = mangoParser.parse(filters)
    return whereParsed.parts.reduce((prev, curr) => {
        const c = whereClauseToSQL(curr);
        return c ? [...prev,c] : prev;
    }, []).map((filter)=>{
        if(filter.field === MANGO_QUERY_OPERATOR){
            delete filter.field;
        }
        return filter;
    });
}
export const MANGO_QUERY_OPERATOR = "MANGO_QUERY_OPERATOR";
const whereClauseToSQL = (currentMongoParserElement) => {
    let { field, operator, operand } = currentMongoParserElement;
    if(!isNonNullString(operator) || !operatorsMap[operator]) return null;
    operator = operatorsMap[operator]
    if(operator == 'LIKE'){
        const deparsed = regexDeparser(operand);
        if(!isObj(deparsed)){
            return null;
        }
        operand = deparsed.value;
        const deparsedOp = deparsed.operator;
        if(deparsedOp =='notcontains'){
            operator = "NOT LIKE";
        }
        if(deparsedOp =='equals'){
            operator = operatorsMap.$eq;
        } else if(deparsedOp =='notequals'){
            operator = operatorsMap.$ne;
        } else{
            const opMap = regexExpressions[deparsedOp];
            if(!opMap || typeof opMap.sql !=='function') return null;
            operand = opMap.sql(operand);
        }
    }
    // AND or OR operators with nested elements
    if (typeof field === 'undefined') {
      // parse nested elements
      const nested = operand.reduce((prev, curr) => {
        const parsed = mangoParser.parse(curr);
        const prepared = whereClauseToSQL(parsed.parts[0]);
        if(prepared){
            return [...prev,prepared]
        }
        return prev;
      }, [])
  
      // nested WHERE element
      return {
        field: MANGO_QUERY_OPERATOR,
        operator,
        operand: nested
      }
    }
    // simple WHERE element
    return {
      field,
      operator,
      operand
    }
  }

  // map mongoDB -> SQL operators
const operatorsMap = {
    $or: 'OR',
    $and: 'AND',
    $lt: '<',
    $lte: '<=',
    $gt: '>',
    $gte: '>=',
    $ne: '!=',
    $in: 'IN',
    $nin : 'NOT IN',
    $eq: '=',
    $regex : "LIKE"
  }

  /**
 *
 * @param {*} operand
 * @param {*} operator
 * @param {*} field
 *
 * Return the operand in right format
 */
export const getTyppedOperand = (operand, operator, field) => {
    if (typeof operand === 'string') { // wrap strings in double quots
      return "'" +(operand) + "'"
    } else if (operator === 'IN' || operator =='NOT IN') { // wrap IN arguments in brackers
      operand = Array.isArray(operand)? operand.map(op => getTyppedOperand(op, null, null))
      .join(', '): operand;
      return '(' + operand + ')'
    } else if (!isNonNullString(field) && Array.isArray(operand)) { // AND or OR elements
      // recursively call 'buildWhereElement' for nested elements
      // join each element with operator AND or OR
      return operand.reduce((prev, curr) => {
        return [...prev, buildWhereElement(curr)]
      }, []).join(' ' + operator + ' ')
    } else {
      return operand
    }
}
  
  /**
   *
   * @param {*} elem
   *
   * Return element of WHERE clause
   */
  export const buildWhereElement = (elem) => {
    const { field, operator, operand } = elem
    if (!isNonNullString(field)) { // nested WHERE element
      return '(' + getTyppedOperand(operand, operator, field) + ')'
    } else { // simple WHERE element
      return field + ' ' + operator + ' ' + getTyppedOperand(operand, operator, field)
    }
  }
  
  /**** construit une requête Where à partir des filtres préparé dans le tableau whereClausePrepared
   * @see : https://github.com/gordonBusyman/mongo-to-sql-converter
   * @parm {array} whereClausePrepared, les filtres préparés avec la méthode prepareFilters puis convertis avec la fonction convertToSQL
     @return {string}, la requête Where correspondante
  */
  export const buildWhere = (whereClausePrepared)=>{
    if(!Array.isArray(whereClausePrepared)) return null;
    // build WHERE string clause by adding each element of array to it, separated with AND
    return whereClausePrepared.reduce((prev, curr) => [
        ...prev, buildWhereElement(curr)
    ], []).join(' AND ');
  }