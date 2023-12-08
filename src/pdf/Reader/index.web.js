/**@see : https://github.com/pipwerks/PDFObject#readme */
let {Dialog} = require("$components/Dialog")
let Icon = require("$components/Icon")
require("./styles.css")
let PDFObject = require("pdfobject")
let {MenuButton} = require("$ui")
let isMSE = //checkEdge ? false : 
            window.navigator && typeof window.navigator.msSaveOrOpenBlob == "function" ? true : false;
class PDFViewer extends APP.Component {
    constructor(props){
        super(props);
        APP.extend(this._events,{
            resize : this.resetPos.bind(this)
        })
        this.autobind();
    }

    componentDidMount(){
        super.componentDidMount();
        this.updatePdfContent();
        window.addEventListener('resize',this._events.resize, true)
        this.resetPos();
    }
    resetPos (){
        if(!this._isMounted()) return;
        let pdfWrap = document.getElementById(this.pdfViewerWrapperDomId);
        if(isDOMElement(pdfWrap)){
            let parent = pdfWrap.parentNode;
            let mP = pdfWrap.closest(".dialog.md-dialog-container");
            if(isDOMElement(parent) && isDOMElement(mP)){
                let maxHeight = mezr.height(parent);
                let maxH2 = mezr.height(mP);
                let min = Math.min(maxHeight,maxH2);
                if(min == 0){
                    min = "100%";
                } else min = min+"px";
                pdfWrap.style.height = min;
            }
        }
    }

    componentDidUpdate(){
        super.componentDidUpdate();
        if(this.dialogRef && this.dialogRef.open){
            this.dialogRef.open();
        }
        this.updatePdfContent()
        this.resetPos();
    }
    componentWillUnmount(){
        super.componentWillUnmount();
        this.dialogRef = undefined;
        window.removeEventListener('resize',this._events.resize, true)
        this.clearEvents();
    }
    viewCapacitor (){
        let f = window.PreviewAnyFile || (cordova && cordova.plugins.PreviewAnyFile);
        if(f && f.preview){
            f = f.preview;
            let {file} = this.props;
            APP.FILE.getCapacitorPDFromDataURL({content:file,fileName:this.props.fileName,success:({path})=>{
                if(isFunction(f)){
                    f(
                        path,
                        function(win){}, 
                        function(err){
                            console.log(err," pdf viewer in cap android ios")   
                        }
                    )
                }
            }}) 
        }
    }
    updatePdfContent(){
        let file = this.props.file;
        if (isMSE) {
            let b64 = dataURLToBase64(file);
            if(b64){
                var byteCharacters = atob(b64);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                var blob = new Blob([byteArray], {
                    type: 'application/pdf'
                });   
                return window.navigator.msSaveOrOpenBlob(blob, defaultStr(this.props.title,'données-impr')+".pdf");
            }
            return null;
        }
        if(isElectron()){
            return ELECTRON.PRINTER.preview({
                content:this.props.file,
                fileName : this.props.fileName,
                fileExtension : 'pdf',
            });
        }
        if(isCapacitor(true)){
            return this.viewCapacitor();
        }
        let dom = document.getElementById(this.pdfViewerWrapperDomId);
        if(isDOMElement(dom)){
            try {
                this.pdfInstance = PDFObject.embed(file,dom);
            } catch (e){
                console.log(e,' error on loading pdf file')
            }
        }
    }
    UNSAFE_componentWillReceiveProps(nexProps,prevProps){
        if(nexProps.file && nexProps.file != this.state.file){
            this._pageNumber = 1;
        }
    }
    onPrint (args){
        console.log(args,' was printed');
    }
    getPrintSettings(){
        return defaultObj(this.props.printProps,this.props.printOptions);
    }
    render (){
        if(isMSE || isElectron() || isCapacitor(true)) return null;
        let {file,dialogProps,title,onPrint,printProps,printOptions,fileName,...rest} = this.props;
        dialogProps = defaultObj(dialogProps);
        dialogProps.contentProps = defaultObj(dialogProps.contentProps)
        dialogProps.contentProps.id = defaultStr(dialogProps.contentProps.id,this.dialogWrapperParentId,uniqid('dialog-content-wrp-par'))
        this.dialogWrapperParentId = dialogProps.contentProps.id;
        dialogProps.contentProps.className = classNames(dialogProps.contentProps.className,'no-padding pdf-viewer-dialog-content')
        dialogProps.className = classNames(dialogProps.className,'pdf-viewer-dialog')
        dialogProps.title = defaultStr(dialogProps.title,title)
        rest = defaultObj(rest)
        let {actions} = dialogProps;
        let acts = []
        let mIts = []
        if(mIts.length > 0){
            acts.push(
                <MenuButton
                    menuItems = {mIts}
                    flat
                    id = {uniqid("view-page-id-butt")}
                >
                    {<Icon name="material-more_vert" title={"pages"}/>}
                </MenuButton>
            )
        }
        Object.map(actions,(a,i)=>{
            if(!a) return;
            acts.push(a);
        })
        this.pdfViewerWrapperDomId = defaultStr(this.pdfViewerWrapperDomId,uniqid("pdf-viewer-wrapper-id"))
        return (
                <Dialog 
                    key = {_uniqid("dialog-pdf-viewer-key-id")}
                    {...dialogProps}
                    ref = {(el)=>{
                        if(el){
                            this.dialogRef = el;
                        }
                    }}
                    fullPage
                    visible
                    actions = {acts}
                >
                    <div className="pdf-viewer-wrapper w100 h100" id={this.pdfViewerWrapperDomId}></div>
                </Dialog>
          );
    }
}

module.exports = PDFViewer;
PDFViewer.PDFObject = PDFObject;

PDFViewer.propTypes = {
    ...Document.propTypes,
    /*** méthode appelée lorsque le document est imprimé */
    onPrint : PropTypes.func,
}