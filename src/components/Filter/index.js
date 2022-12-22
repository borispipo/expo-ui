

import DateLib from "$lib/date";
import {isNonNullString,defaultStr,isNullOrEmpty,debounce,isFunction,uniqid} from "$utils";
import {regexParser,regexActions,operators as _operators,actions as _actions,periodActions,betweenActions, inActions as _inActions,getFilterStateValues,getSessionData,setSessionData} from "$cfilters";
import {parseDecimal} from "$ecomponents/TextField";
import notify from "$notify";
import PropTypes from "prop-types";
import {extendObj} from "$utils";
import {getFilterComponentProps} from "$ecomponents/Form/FormData/componentsTypes"
import Menu from "$ecomponents/BottomSheet/Menu";
import {StyleSheet,View} from "react-native";
import Icon from "$ecomponents/Icon";
import React,{Component as AppComponent} from "$react";
import theme from "$theme";
import {isMobileMedia} from "$cplatform/dimensions";
import { ActivityIndicator } from "react-native-paper";
import DialogProvider from "$components/Form/FormData/DialogProvider";
import FilterBetweenComponent from "./BetweenComponent";

const manualRunKey = "manual-run";

export * from "$cfilters";

  
/***** Coposant Filter, pour les filtres de données */
export default class Filter extends AppComponent {
  constructor(props) {
    super(props);
    this.clearText = this.clearText.bind(this);
    this.fireValueChanged = this.fireValueChanged.bind(this);
    const {Component,props:filterProps,type} = getFilterComponentProps(props);
    Object.defineProperties(this,{
        Component : {
          value : Component,
          override:false,writable:false
        },
        filterProps : {value:filterProps},
        type : {
          value : type, override : false, writable : false
        },
        searchFilter : {value : React.createRef(null),},
        name : {value : defaultStr(this.props.name,uniqid("no-name-filter"))}
    })
    this.filterValidationTimeout = 0;
    switch(this.type){
        case 'select' : 
          break;
        case 'date':
          break;
        case 'time':
          break;
        case 'switch' : 
          break;
        case 'checkbox':
            break;
        default : 
          this.filterValidationTimeout = defaultNumber(this.props.timeout,1500);
          break;
    }
    Object.defineProperties(this,{
      fireFilterSearch : {
         value : this.filterValidationTimeout ? debounce(this.fireValueChanged.bind(this),this.filterValidationTimeout) : this.fireValueChanged.bind(this),
      },
      isInitializedRef : {
        value : {current:false}
      },
      previousRef : {
        value : {current : null}
      },
      manualRunRef : {value : {current : 0}},
    })
    extendObj(this.state,{
        ...this.initFiltersOp(),
        manualRun : this.getSessionManualRunValue(),
    });
    this.autobind();
  }
  componentWillUnmount(){
    super.componentWillUnmount();
  }
  toggleIgnoreCase(){
     this.setState({ignoreCase:!this.state.ignoreCase},()=>{
        if(!this.willRunManually()){
          this.fireValueChanged();
        };
     })
  }
  setSessionManualRunValue(value){
      this.manualRunRef.current = value;
  }
  getSessionManualRunValue(){
    return this.manualRunRef.current;
    return getSessionData(manualRunKey) ? true : false
  }
  willRunManually (){
     return this.state.manualRun;
  }
  toggleManualRun(){
    this.setState({manualRun:!this.state.manualRun},()=>{
       this.setSessionManualRunValue(this.state.manualRun?0:1);
       if(!this.willRunManually()){
         this.fireValueChanged(true);
       }
    })
  }
  getStateValues(){
    return getFilterStateValues(this.state);
  }
  callOnValidate(arg){
    arg = isObj(arg)? arg : {};
    if(typeof this.props.onValidate ==='function'){
      this.props.onValidate({...this.getStateValues(),field:this.props.name,...arg})
    }
  }
  isDecimal(){
    const t = defaultStr(this.type,this.props.type).toLowerCase();
    return t =="number" || t =='decimal' ? true : false;
  }
  onFilterValidate(arg){
     arg = defaultObj(arg);
     if(JSON.stringify(this.state.defaultValue) === JSON.stringify(arg.value)){
        return;
     }
     this.setState({defaultValue:arg.value},()=>{
       this.callOnValidate(arg);
       if(!isNumber(this.filterValidationTimeout)){
          this.filterValidationTimeout = 0;
       }
       this.fireFilterSearch(false);
     });
  }
  getDefaultAction(type){
      type = defaultStr(type,this.type,this.props.type).toLowerCase();
      if(type.contains('select')){
          return "$in";
      } if(type !== 'date2time' && type !== 'time' && type !== 'number' && type !== 'decimal'){
          return '$regexcontains';
      }
      return '$eq';
  }
  initFiltersOp(type){
    type = defaultStr(type,this.type).toLowerCase();
    let operators = {..._operators};
    let actions = {...betweenActions,..._actions};
    if(this.props.orOperator === false){
       delete operators.$or;
    }
    if(this.props.andOperator === false){
       delete operators.$and;
    }
    let action = this.props.action;
    let operator = this.props.operator;
    let ignoreCase = this.props.ignoreCase;
    ignoreCase = defaultVal(ignoreCase,true);
    let isTextFilter = false;
    if(type =="checkbox" || type == 'switch'){
        action = '$eq';
    } else if(type.contains('select')){
        actions = _inActions;
    } else if(type == 'date' || type =='datetime') {
      actions = {...periodActions, ...actions}  
    } else if(type !== 'date2time' && type !== 'time' && type !== 'number' && type !== 'decimal'){
        actions = {...betweenActions,...regexActions};
        isTextFilter = true;
    }
    if(!action){
        action = this.getDefaultAction(type);
    } 
    operator = defaultVal(operator,"$and");
    return {actions,action,ignoreCase,operator,operators,manualRun:defaultBool(this.props.manualRun,false),defaultValue:defaultVal(this.props.defaultValue),isTextFilter};
  }
  fireValueChanged (forceRun){
      if(this.willRunManually() && !forceRun) return;
      let {defaultValue:value,action,ignoreCase,operator} = this.state;
      let force = forceRun ===true ? true : false;
      if(!isObjOrArray(value) && (isNullOrEmpty(value,true) || value ==='undefined') ){
          value = undefined;
      }
      let originValue = value;
      if(action =="$today" || action =='$yesterday'){
         force = true;
      }
      if(this.isDecimal()){
        value = parseDecimal(value)
        if(value == 0){
          value = undefined;
        }
      }
      const prev = JSON.stringify(defaultObj(this.previousRef.current)), current = {value,operator,action,ignoreCase};
          let tV = isArray(value) && value.length <= 0 ? undefined : value;
      
      this.isInitializedRef.current = this.props.dynamicRendered || this.isInitializedRef.current;
      if(prev == "{}" && (isNullOrEmpty(tV) || value === 0) && (!this.isInitializedRef.current) && (force !== true))  {
        return this;
      }
      if(prev == JSON.stringify(current) && (force !== true)){
          return this;
      }
      this.isInitializedRef.current = true;
      this.previousRef.current = current;
      if(isFunction(this.props.onChange)){
          let selector = {};
          selector[this.props.field] = action;
          let originAction = action;
          if(isNonNullString(action)){
            action = action.toLowerCase().trim();
            if(action =="$today" || action =='$yesterday'){
              action = "$eq";
            } else if(action.startsWith("$") && (action.contains("week") || action.contains("month"))){
              action = "$period";
            }
             if(action.startsWith("$regex")){
                let f = regexParser[action.ltrim("$regex")];
                if(isFunction(f)){
                   value = f(value);
                }
                if(isNonNullString(value) && this.state.ignoreCase){
                    try {
                      const v = RegExp(value.ltrim("/").rtrim("/"),'i');
                      value = v;
                    } catch{}
                }
                action = "$regex";
             } 
             if(operator == "$nin"){
                if(isArray(value)){
                    value.push("");
                }
             }
          }
          this.props.onChange({...this.getStateValues(),value,originValue:originValue,originValue,field:this.props.field,action,operator,selector,originAction,context:this});
      }
  }
  componentDidUpdate (){
      super.componentDidUpdate();
      this.canBindEvent = true;
  }
  setIgnoreCase(ignoreCase){
    if(!(this.searchFilter.current) ) return;
    if(ignoreCase === this.state.ignoreCase) return;
    this.setState({ignoreCase},()=>{
        this.fireValueChanged();
    });
  }
  runAction ({value,action}){
      this.setState({action,defaultValue:value},()=>{
        this.callOnValidate();
        if(isFunction(this.searchFilter.current.getValue) && this.canBindEvent){
          this.fireValueChanged();
        }    
      })
  }
  isDateTime(){
    const t =  defaultStr(this.type,this.props.type);
    return t.contains("date") && t.contains("time");
  }
  showBetweenSelector(args){
      return this.showBetweenActionSelector(args);
  }
  showPeriodSelector(args){
     return this.showBetweenActionSelector(args);
  }
  showBetweenActionSelector(args){
    if(typeof args =='function'){
      args = {success:args};
    }
    let {success,callback} = defaultObj(args);
    const _type = defaultStr(this.type,this.props.type).toLowerCase().trim();
    success = typeof success =='function'? success : typeof callback =='function'? callback : undefined;
    const defaultValue = defaultStr(this.state.defaultValue).trim();
    let split = defaultValue.split("=>");
    const isDateTime = this.isDateTime();
    let start = split[0] && split[0] || undefined, end = split[1] && split[1] || undefined;
    const willHandleDate = _type.contains('date');
     if(willHandleDate){
        start = isDateTime ? new Date().toSQLDateTimeFormat() : new Date().toSQLDateFormat();
        end = start;    
        if(DateLib.isValidSQLDateTime(split[0]) || DateLib.isValidSQLDate(split[0])){
            start = split[0];
        }
        if(DateLib.isValidSQLDateTime(split[1]) || DateLib.isValidSQLDate(split[1])){
            end = split[1];
        }
    }
    const type = willHandleDate ? (isDateTime? "datetime" : "date"):_type;
    const format = this.props.format;
    return new Promise((resolve,reject)=>{
      DialogProvider.open({
        subtitle : false,
        fields : {
           start : {format,type,text:(willHandleDate?'Du':"Valeur inférieure"),defaultValue:start},
           end : {format,type,text:willHandleDate?'Au':"Valeur supérieure",defaultValue:end}
        },
        title :"Définir {0} [{1}]".sprintf(willHandleDate?"une période":"Un intervalle",defaultStr(this.props.label,this.props.text)),
        cancelButton  : true,
        actions : {
         yes : {
              text : 'Définir',
              icon : "check"
          },
        },
        onSuccess : ({data})=>{
            if(data.start !== undefined && data.start !== null && data.end !== undefined && data.end !== null && data.start> data.end){
                return notify.error("La {0} doit être supérieure à la {1}".sprintf(willHandleDate?"date de fin":"valeur supérieure",willHandleDate?"date de début":"valeur inférieure"));
            }
            if(typeof(success) =="function"){
              success(data.start+"=>"+data.end);
           }
           resolve(data.start+"=>"+data.end);
           DialogProvider.close();
           return true;
        }
      })
    })
  }
  setAction(action,text){
    if(!(this.searchFilter.current)) return;
    if(action === this.state.action && !periodActions[action] && !betweenActions[action]) return;
    let value = this.state.defaultValue;
    let act = defaultStr(action).toLowerCase();
    const isDateTime = this.type?.contains("time");
    const dateFormat = isDateTime?DateLib.SQLDateTimeFormat:DateLib.SQLDateFormat;
    if(action == '$period'){
      this.showPeriodSelector((d)=>{
          this.runAction({value:d,action});
      })
    } else if(action == '$between'){
      this.showBetweenSelector((d)=>{
          this.runAction({value:d,action});
      })
    } else if(action =="$today"){
        return this.runAction({value:new Date().resetHours().resetMinutes().resetSeconds().toFormat(dateFormat),action})
    } else if(action =="$yesterday"){
      return this.runAction({value: DateLib.removeDays(1,new Date(),null,true).resetHours().resetMinutes().resetSeconds().toFormat(dateFormat),action})
  } else if(act.startsWith("$") && (act.contains("week") || act.contains("month"))){
      let diff = undefined;
      const currentDate = new Date();
      currentDate.setHours(0);
      currentDate.setMinutes(0);
      currentDate.setSeconds(0);
      switch (action){
        case "$month":
            diff = DateLib.currentMonthDaysLimits(currentDate);
          break;
        case "$week":      
            diff = DateLib.currentWeekDaysLimits(currentDate);
          break;
        case "$prevWeek":      
          diff = DateLib.previousWeekDaysLimits(currentDate)
        break;
      }
      if(diff){
        let value = diff.first.toFormat(dateFormat) +"=>"+diff.last.toFormat(dateFormat);
        this.runAction({value,action})
      }
    } else {
        this.runAction({value,action});
    }
  }
  setOperator(op,text){
    if(this.state.operator === op) return;
    this.setState({operator:op},()=>{
      this.fireValueChanged();
      this.callOnValidate();
    });
  }
  clearText(cb){
      this.setState({
          emptyTextIcon : false,
          defaultValue : undefined,
      },()=>{
        this.callOnValidate();
        if(isFunction(cb)){
          cb();
        }
        this.fireValueChanged();
      })
  }
  clearFilter(event){
    this.setState({defaultValue:undefined,action:this.getDefaultAction()},()=>{
      this.callOnValidate();
      this.fireValueChanged(true);
      let {onClearFilter,onResetFilter} = this.props;
      onClearFilter = defaultVal(onClearFilter,onResetFilter);
      if(isFunction(onClearFilter)){
        onClearFilter.call(this,{name:this.name,field:this.name,type:this.type,context:this,props:this.props});
      }
    })
  } 
  isBetweenAction(action){
    action = defaultStr(action,this.state.action).toLowerCase();
    return !!(this.state.actions && betweenActions[action]);
  }
  isPeriodAction(action){
    action = defaultStr(action,this.state.action).toLowerCase();
    return !!(this.state.actions && periodActions[action]);
  }
  formatValue(value){
      const type = defaultStr(this.type,this.props.type).toLowerCase();
      if(this.isBetweenAction() && isNonNullString(value) && (type ==="number" || type =="decimal")){
        const sp = value.split("=>");
        if(sp.length ==2 && type){
          const format = defaultStr(this.props.format).toLowerCase();
          const v1 = defaultDecimal(parseDecimal(sp[0],type));
          const v2 = defaultDecimal(parseDecimal(sp[1],type));
          return format =="money"? (v1.formatMoney()+"=>"+v2.formatMoney()) : (v1.formatNumber()+"=>"+v2.formatNumber());
        }
      }
      if(typeof value =='number'){
          if(this.props.format =='money'){
             return value.formatMoney();
          }
          return value.formatNumber();
      }
      return value;
  }
  render (){
    let {
      filter,
      label,
      withLabel,
      text,
      tooltip,
      dynamicRendered,
      tooltipLabel,
      andOperator,
      searchIcon,
      field,
      style,
      anchorProps,
      //mode,
      //inputProps,
      moreOptions,
      isLoading,
      searchIconTooltip,
      withBottomSheet,
      render,
      ref,
      data,
      testID,
      filterContainerProps,
      ...rest
    } = {...this.props,...this.filterProps};
     const type = this.type;
     if(filter === false || ((andOperator === false && orOperator === false) || type ==='image')) return null;
     label = defaultStr(label,text,tooltip,tooltipLabel,field)
     const {defaultValue,actions,action,operator,operators} = this.state;
     searchIcon = React.isValidElement(searchIcon)?searchIcon : searchIcon ? <Icon title={searchIconTooltip} icon={searchIcon}/> : null;
     let hasFilterVal = !isNullOrEmpty(defaultValue,true);
     rest.label = label;
     const activeColor = theme.colors.primaryOnSurface;
     const activeStyle = {color:activeColor};
     const manualRun = this.willRunManually();
     testID = defaultStr(testID,'RN_FilterComponent_'+this.name);
     const options = {
        go : {
          text : 'Rechercher (Go)',
          icon : 'magnify',
          onPress : ()=>{
            this.fireValueChanged(true);
          },
        },
        divider:{divider:true},
        manual : {
           text : 'Recherche manuelle',
           icon : manualRun ? 'check': null,
           style : manualRun? activeStyle : null,
           onPress : this.toggleManualRun.bind(this)
        },
     };
     if(this.state.isTextFilter){
       options.ignoreCase = {
          text : 'Ignorer la casse',
          icon : this.state.ignoreCase ? 'check':null,
          style : this.state.ignoreCase ? activeStyle : null,
          onPress : this.toggleIgnoreCase.bind(this),
       }
     }
     if(typeof moreOptions ==='function'){
        moreOptions = moreOptions({context:this,type:this.type,props:rest});
     }
     let hasOptions = false;
     if(typeof moreOptions =='object' && moreOptions){
       Object.map(moreOptions,(o,i)=>{
          if(!isObj(o)) return null;
          const label = defaultStr(o.label,o.text);
          if(label){
            if(!hasOptions){
              hasOptions = true;
              options.moreoptsDivieer = {divider:true};
            }
            options["more-"+i] = o;
          }
       })
     }
     rest.name = this.name;
     rest.validate = false;
     rest.formName = uniqid("form-name-field-select");
     rest.renderfilter = "true"; //pour préciser que c'est un filtre de données
     if(isFunction(filter)){
         rest.filter = filter;
     }
     const isPeriodAction = this.isPeriodAction();
     const isBetweenAction = this.isBetweenAction();
     const ignoreDefaultValue = (isPeriodAction||isBetweenAction) && isNonNullString(defaultValue) && defaultValue.contains("=>");
     rest.defaultValue = defaultValue;
     rest.disabled = rest.readOnly = rest.affix = false;
     rest.editable = true;
     rest.style = [style];
     rest.type = type;
     const isMob = isMobileMedia() || withBottomSheet;
     isLoading = !!isLoading;
     rest.pointerEvents = !isLoading ? "auto" : "none";
     if(withLabel ===false){
        delete rest.label;
        delete rest.text;
        delete rest.title;
      }
     anchorProps = defaultObj(anchorProps);
     rest.anchorProps = anchorProps;
     rest.withLabel = withLabel;
     rest.pointerEvents = "auto";
     rest.right = isLoading ? <ActivityIndicator color={theme.colors.secondaryOnSurface} animating/> :<>
        <Menu 
             testID = {testID+"_Menu"}
             sheet = {withBottomSheet}
             anchor = {(props)=><Icon {...props} {...anchorProps} style={[theme.styles.noPadding,theme.styles.mt0,theme.styles.mb0,theme.styles.ml0,props.style,anchorProps.style]} primary={hasFilterVal} icon={hasFilterVal?'filter-menu':'filter-plus'}/>}
             items = {[
                    {
                      text : !isMob ? 'Options' : ("Options de filtre ["+label+"]"),
                      icon : 'cog',
                      items : options,
                    },
                    {divider:true},
                     ...[hasFilterVal /*&& type !== 'select'*/? 
                     {
                        text : 'Effacer le filtre',
                        icon : 'filter-remove',
                        onPress : this.clearFilter.bind(this),
                     }
                     :null],
                     ...[isMob?{
                       text : 'Opérateurs',
                       closeOnPress : false,
                       style : [styles.bold,styles.noVerticalPadding],
                     }:null],
                     ...Object.mapToArray(operators,(x,i)=>{
                       return {
                           text : x+' '+ (label?label.toLowerCase():'')+' ',
                           icon : i === operator ? 'check' : null,
                           style : i === operator ? activeStyle : null,
                           onPress : (e)=>{React.stopEventPropagation(e);this.setOperator(i,x);return false;},
                        }
                    }),
                   {divider:true},
                    ...[isMob?{
                      text : 'Actions',
                      closeOnPress : false,
                      style : [styles.bold,styles.noVerticalPadding],
                    }:null],
                     ...Object.mapToArray(actions,(x,j)=>{
                      if(ignoreDefaultValue && !periodActions[j] && !betweenActions[j]){
                        return null;
                      } 
                      let checked = j === action?true : false;
                       if(checked && (isNumber(defaultValue) || isNonNullString(defaultValue))) {
                         let hasS = false;
                         let act = defaultStr(action).toLowerCase();
                         if(act =="$today" || act =='$yesterday'){
                            
                         } else if((action =="$period" || (act.startsWith("$") && (act.contains("week") || act.contains("month"))))){
                           let sp = defaultValue.split("=>");
                           x = DateLib.formatDatePeriod(defaultValue,this.isDateTime());
                           if(!x){
                            if((DateLib.isValidSQLDate(sp[0])|| DateLib.isValidSQLDateTime(sp[0])) && (DateLib.isValidSQLDate(sp[1]) || DateLib.isValidSQLDateTime(sp[1]))){
                                x = "Du "+defaultStr(DateLib.format(sp[0],DateLib.defaultDateFormat),sp[0])+" au "+defaultStr(DateLib.format(sp[1],DateLib.defaultDateFormat),sp[1]);
                                hasS = true;      
                            }
                           } else {
                            hasS = true; 
                           }
                          }

                          if(!hasS){
                             x = x+" <"+this.formatValue(defaultValue)+">"
                          }
                       }                       
                       return {
                         label : x,
                         icon : checked ? 'check' : null,
                         style : checked ? activeStyle : null,
                         onPress : (e)=>{React.stopEventPropagation(e);this.setAction(j,x);return false}}
                       }
                 )
            ]}
        />
     </>
     const containerProps = defaultObj(this.props.containerProps,rest.containerProps);
     delete rest.containerProps;
     rest.onValidate = this.onFilterValidate.bind(this);
     const Component = isBetweenAction ? FilterBetweenComponent : this.Component;
     const responsiveProps = Object.assign({},responsiveProps);
     responsiveProps.style = [theme.styles.w100,responsiveProps.style]
     if(ignoreDefaultValue && isPeriodAction) {
        rest.isPeriodAction = true;
     }
     return <View testID={testID+"_FilterContainer"} {...containerProps} style={StyleSheet.flatten([theme.styles.w100,containerProps.style])}>
        <Component
          {...rest}
          readOnly = {ignoreDefaultValue}
          responsiveProps = {responsiveProps}
          isFilter
          name = {this.name}
          testID = {testID}
          ref = {React.mergeRefs(this.searchFilter,ref)}
      /> 
     </View>
 }
}

const styles = StyleSheet.create({
  noVerticalPadding : {
    //paddingVertical:0,
    //marginVertical:0,
    paddingTop : 5,
    marginHorizontal : 10,
    //height : 45,
  },
  bold : {
    fontWeight :'bold'
  }
})


/***** Les filtres prenent en paramètre : 
 * 
 *   le nom d'une colonne, 
 *   un opérateur et une action
 */

 /**** lors du rendu d'un composant de type Fild, si la valeur renderFilter est définie alors l'utilisateur doit prendre en compte qu'il 
  *   s'agit du rendu d'un champ de filtre
  */

Filter.propTypes = {
    withLabel : PropTypes.bool,//si le rendu des filtres prendra en compte le label
    moreOptions : PropTypes.oneOfType([
       PropTypes.object,
       PropTypes.array,
       PropTypes.func
    ]),
    dynamicRendered : PropTypes.bool,//si le filtre est rendu dynamiquement
    isLoading : PropTypes.bool,
    /*** si l'opérateur or sera accepté */
    orOperator : PropTypes.bool,
    ///si l'opérateur and sera accepté
    andOperator : PropTypes.bool,
    /*** spécifie si la casse sera ignorée où non */
    ignoreCase : PropTypes.bool,
    operator : PropTypes.string, //l'opérateur par défaut : and, or, 
    action : PropTypes.oneOfType([PropTypes.string,PropTypes.bool]), //l'action par défaut : supérieur, supérieur où égal, est dans, ...
    searchIcon : PropTypes.oneOfType([PropTypes.string,PropTypes.node]),
    /*** l'info bulle de l'icone de recherche */
    searchIconTooltip : PropTypes.string,
    field : PropTypes.string.isRequired,
    /** 
     * La foncton de rappel appelée en cas de mise à jour du champ
     * onChange(value,{action,operator,field,value,selector})
    */
    onChange : PropTypes.func,
    /**** lorsque le contenu du filtre est réinitialisé */
    onClearFilter : PropTypes.func,
    onResetFilter : PropTypes.func, //idem à onClearFilter
}