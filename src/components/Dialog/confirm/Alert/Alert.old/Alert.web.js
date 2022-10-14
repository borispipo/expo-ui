import {uniqid,defaultStr,defaultObj} from "$utils";
import {addClassName, removeClassName} from "$utils/dom";
import theme from "$theme";
import {MAX_WIDTH} from "$components/Dialog/utils";
import {Elevations} from "$components/Surface";
import { StyleSheet } from "react-native";
import {Dimensions} from "react-native";
const domId = uniqid("alter-7-dom-id");
(function (Alert7) {

    var _TYPE_DEFAULT = 0;
    var _TYPE_CONFIRM = 1;
    (function () {
        Alert7 = window.Alert7 = Alert7 || _getInitialClass();
    }());

    function _getInitialClass() {

        Alert7Class.TYPE_DEFAULT = _TYPE_DEFAULT;
        Alert7Class.TYPE_CONFIRM = _TYPE_CONFIRM;
        Alert7Class.alert = _staticAlert;
        Alert7Class.break = _staticBreak;
        _appendCSS();
        return Alert7Class;

    }

    function _staticAlert(_title, _message) {

        var _tempAlert = new Alert7Class();
        var _args = [].splice.call(arguments, 2);
        _tempAlert.setTitle(_title);
        _tempAlert.setMessage(_message);
        while ( _args.length ) _tempAlert.addAction(_args.shift(), _args.shift());
        _tempAlert.present();
        return _tempAlert;

    }

    function _staticBreak() {

        throw null;

    }

    function _appendCSS() {
        let maxWidth = MAX_WIDTH;
        const backgroundColor = theme.colors.surface+";",color=theme.colors.text+";";
        const {width:windowWidth} = Dimensions.get("window");
        if(typeof windowWidth <= maxWidth){
            maxWidth = windowWidth*90/100;
        }
        var _styleElement = document.getElementById(domId);
        if(!_styleElement){
            _styleElement = document.createElement("style");
            document.getElementsByTagName("head")[0].appendChild(_styleElement);
        }
        _styleElement.id = domId;
        _styleElement.innerHTML = "" +
            "#Alert7," +
            "#Alert7::after," +
            "#Alert7 .alert7-container {" +
                "vertical-align: middle;" +
            "}" +
            "" +
            "#Alert7 {" +
                "position: fixed;" +
                "top: 0;" +
                "bottom: 0;" +
                "left: 0;" +
                "right: 0;" +
                "z-index: 1001;" +
                "background-color: " +theme.colors.backdrop+";"+
                "text-align: center;" +
                "font-size: 16px;" +
                "-webkit-user-select: none;" +
                "   -moz-user-select: none;" +
                "    -ms-user-select: none;" +
                "        user-select: none;" +
            "}" +
            "" +
            "#Alert7.alert7-confirm {" +
            "}" +
            "" +
            "#Alert7::after," +
            "#Alert7 .alert7-container {" +
                "display: inline-block;" +
            "}" +
            "" +
            "#Alert7::after {" +
                "height: 100%;" +
                "content: '';" +
            "}" +
            "#Alert7 .alert7-container {" +
                "min-width:240px;"+
                "max-width: "+maxWidth+(typeof maxWidth =='number'? "px":"")+";" +
                "width: auto;" +
                "box-sizing: border-box;" +
                "background-color:"+backgroundColor+
                "border-radius: 0px;" +
                "max-height: calc(100% - 64px);"+
                "overflow-y: auto;"+
                "color:"+color+
                "box-shadow:rgb(0 0 0 / 20%) 0px 11px 15px -7px, rgb(0 0 0 / 14%) 0px 24px 38px 3px, rgb(0 0 0 / 12%) 0px 9px 46px 8px"+
            "}" +
            "" +
            "#Alert7 .alert7-title," +
            "#Alert7 .alert7-message {" +
                "font-family: Roboto, Helvetica, Arial, sans-serif;"+
                "line-height: 1.6;"+
                "letter-spacing: 0.0075em;"+
                "padding:10px;"+
                "text-align:left;"+
            "}" +
            "" +
            "#Alert7 .alert7-title {" +
                "font-size: 1.1em;" +
                "font-weight: bolder;" +
                //"line-height: 2rem;" +
            "}" +
            "" +
            "#Alert7 .alert7-message {" +
                "padding-bottom: 14px;" +
                "font-size: 0.9em;" +
            "}" +
            "" +
            "#Alert7 .alert7-actions {" +
                "width:100%;"+
                "text-align:right;"+
                "padding-bottom:7px"+
            "}" +
            "" +
            "#Alert7 .alert7-actions button.alert7-action-item {" +
                "display: inline-block;"+
                "position: relative;"+
                "box-sizing: border-box;"+
                "-webkit-tap-highlight-color: transparent;"+
                "background-color: transparent;"+
                "outline: 0px;"+
                "border: 0px;"+
                "margin: 0px;"+
                "cursor: pointer;"+
                "user-select: none;"+
                "vertical-align: middle;"+
                "appearance: none;"+
                "text-decoration: none;"+
                "font-family: Roboto, Helvetica, Arial, sans-serif;"+
                "font-weight: 500;"+
                "font-size: 0.875rem;"+
                "line-height: 1.75;"+
                "letter-spacing: 0.02857em;"+
                "text-transform: uppercase;"+
                "min-width: 64px;"+
                "padding: 6px 8px;"+
                "margin-right:7px;"+
                "margin-bottom:4px;"+
                "border-radius: 4px;"+
                "transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;"+
            "}" +
            "" +
            "#Alert7.alert7-confirm .alert7-actions button.alert7-action-item:first-of-type:last-of-type {" +
                "width: 100%;" +
            "}" +
            "" +
            "#Alert7.alert7-confirm .alert7-actions button.alert7-action-item:nth-of-type(n+3) {" +
                "display: none;" +
            "}" +
            "@media only screen and (min-width: "+(MAX_WIDTH)+"px) {"+
                "#Alert7 .alert7-container {"+
                    "max-width:"+(MAX_WIDTH-20)+"px!important;"+
                "}"+
            "}"+
            "@media only screen and (max-width: "+MAX_WIDTH+"px) {"+
                "#Alert7 .alert7-container {"+
                    "max-width:90%!important;"+
                "}"+
             "}"+
            "";
    }

    function Alert7Class() {

        this.title = "";
        this.message = "";
        this.type = _TYPE_DEFAULT;
        this.actions = [];
        _createAlertElement(this);

    }

    function _createAlertElement(_self) {

        _self.instanceElement = document.createElement("div");
        _self.instanceElement.id = "Alert7";
        _self.alertElement = document.createElement("div");
        _self.alertElement.className = "alert7-container";
        _self.instanceElement.appendChild(_self.alertElement);
        _self.titleElement = document.createElement("div");
        _self.titleElement.className = "alert7-title";
        _self.alertElement.appendChild(_self.titleElement);
        _self.messageElement = document.createElement("div");
        _self.messageElement.className = "alert7-message";
        _self.alertElement.appendChild(_self.messageElement);
        _self.actionsElement = document.createElement("div");
        _self.actionsElement.className = "alert7-actions";
        _self.alertElement.appendChild(_self.actionsElement);

    }

    Alert7Class.prototype.setTitle = function (_text) {

            this.title = _text || "";

        };

    Alert7Class.prototype.setMessage = function (_text) {
        this.message = _text || "";
    };

    Alert7Class.prototype.setType = function (_enum) {

            this.type = _enum || _TYPE_DEFAULT;

        };

    Alert7Class.prototype.addAction = function (_text, _handler) {

            this.actions.push({
                text: _text,
                handler: _handler
            });

        };

    Alert7Class.prototype.present = function () {
        this.titleElement.innerText = this.titleElement.textContent = this.title;
        const isDark = theme.isDark();
        _appendCSS();
        removeClassName(this.titleElement,"alert7-title");
        if(typeof this.title =="string" && this.title.length){
            addClassName(this.titleElement,"alert7-title");
            this.titleElement.style.background = isDark?theme.colors.surface : theme.colors.primary;
            this.titleElement.style.color = isDark?theme.colors.surfaceText : theme.colors.primaryText;
            this.titleElement.style.borderBottom = "1px solid "+theme.colors.divider;
        }
        this.messageElement.innerHTML = this.messageElement.textContent = defaultStr(this.message).replaceAll("\n","</br>");
        switch ( this.type ) {
            case _TYPE_CONFIRM: this.instanceElement.classList.add("alert7-confirm");
        }
        if ( !this.actions.length ) this.actions.push({});
        _createActions(this);
        document.querySelector("body").appendChild(this.instanceElement);

    };

    Alert7Class.prototype.dismiss = function () {

            if ( !this.instanceElement.parentNode ) return;
            this.instanceElement.parentNode.removeChild(this.instanceElement);

        };

    function _createActions(_self) {

        var _actions = _self.actions;
        var _numOfAction = _actions.length;
        var _tempActionElement;
        var _datum;
        _self.actionsElement.innerHTML = "";
        while ( _numOfAction-- ) {
            _datum = _actions[_numOfAction];
            const button = _datum.text;
            if(typeof button =="text"){
                button = {text:button};
            } else button = defaultObj(button);
            const text = defaultStr(button.text,button.label); 
            if(!text) _numOfAction--;
            _tempActionElement = document.createElement("button");
            _tempActionElement.className = "alert7-action-item";
            _tempActionElement.innerText = _tempActionElement.textContent = text;// _datum.text || "OK";
            const stylesInput = StyleSheet.flatten(button.style);
            const style = _tempActionElement.style;
            for(let i in stylesInput){
                if(style.hasOwnProperty(i)){
                    style[i] = stylesInput[i];
                }
            }
            _tempActionElement.addEventListener("click", _onClick(_datum.handler), false);
            _self.actionsElement.insertBefore(_tempActionElement, _self.actionsElement.firstChild);
        }

        function _onClick(_handler) {
            return function () {
                    try {
                        if ( _handler ) _handler();
                        _self.dismiss();
                    } catch (_error) {}
                };
        }

    }

}(window.Alert7));

function escapeHTML(string) {
  let pre = document.createElement('pre');
  let text = document.createTextNode(string);
  pre.appendChild(text);
  return pre.innerHTML;
}

const Alert = {
  alert(title, message='', callbackOrButtons=[{text:'OK', onPress : (f) => f}]) {
    let alert = new Alert7();
    alert.setTitle(title);
    alert.setMessage(escapeHTML(message));
    if (typeof callbackOrButtons === 'function') {
      const callback = callbackOrButtons;
      alert.addAction('OK', callback);
    } else {
      const buttons = callbackOrButtons;
      buttons.forEach((button) => {
        alert.addAction(button, button.onPress || (f=>f));
      });
      if (buttons.length === 2) {
        alert.setType(Alert7.TYPE_CONFIRM);
      }
    }
    alert.present();
  },

  prompt(title, message='', callbackOrButtons=(f) => f, type='plain-text', defaultValue='') {
    const alertPromptId = uniqid('alert7-prompt-input')
    function getInputCallback(callback) {
      return () => {
        const text = document.getElementById(alertPromptId).value;
        return callback(text);
      };
    }

    let alert = new Alert7();
    alert.setTitle(title);
    const msg = `<br/><input type="${(type==='secure-text'||type==='login-password')?'password':'text'}" value="${defaultValue}" id=${alertPromptId} style="width: 100%; height: 18px; border: 1px solid #ccc;" />`;
    alert.setMessage(escapeHTML(message) + msg);
    if (typeof callbackOrButtons === 'function') {
      const callback = callbackOrButtons;
      alert.addAction('OK', getInputCallback(callback));
    } else {
      const buttons = callbackOrButtons;
      buttons.forEach((button) => {
        alert.addAction(button, getInputCallback(button.onPress || (f=>f)));
      });
      if (buttons.length === 2) {
        alert.setType(Alert7.TYPE_CONFIRM);
      }
    }
    alert.present();
  }
};
export default Alert;