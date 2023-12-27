import * as FileSaver from "$efile-system/utils/FileSaver";
import {isElectron} from "$cplatform";
import notify from "$cnotify";
import Preloader from "$preloader";
import {defaultStr,isNonNullString,defaultObj,getFileExtension,isPromise} from "$cutils";
import {HStack} from "$ecomponents/Stack";
import Label from "$ecomponents/Label";
import DialogProvider from "$ecomponents/Form/FormData/DialogProvider";
import session from "$session";

const startSessionKey = "desktop-capturer-session";
const actionsSessionKey = "desktop-capturer-actions";

export const canRecord = x=> isElectron()? true : typeof navigator !=="undefined" && window?.navigator && (navigator?.mediaDevices) && typeof navigator?.mediaDevices?.getDisplayMedia === 'function';

export const updateSystemTray = x => isElectron() && typeof ELECTRON !=="undefined" && ELECTRON && typeof ELECTRON?.desktopCapturer?.updateSystemTray ==="function" ? ELECTRON.desktopCapturer.updateSystemTray() : undefined;


export function getUserMedia(constraints) {
    // if Promise-based API is available, use it
    if ((navigator?.mediaDevices && typeof navigator?.mediaDevices?.getUserMedia =="function")) {
        return navigator.mediaDevices.getUserMedia(constraints);
    }
    // otherwise try falling back to old, possibly prefixed API...
    const legacyApi = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    if (legacyApi) {
      return new Promise(function (resolve, reject) {
        legacyApi.bind(navigator)(constraints, resolve, reject);
      });
    }
    return Promise.reject({status:false,msg:"user media not available"})
}
export const getAudioConstraint = x=>{
    return {audio: true,echoCancellation:{exact: true},noiseSuppression:{exact:true}};
}
export async function getUserMediaAsync(constraints,video) {
    try {
      const stream = await (video === false ? getUserMedia(constraints): navigator.mediaDevices.getDisplayMedia(constraints));
      return stream;
    } catch (e) {
      console.error('navigator.getUserMedia error:', e);
    }
    return null;
}
export function handleUserMediaError(e) {
    console.error(e," stream recording error");
    notify.error(e);
}

export function getSupportedMimeTypes(mediaTypes,filter) {
    if(isNonNullString(mediaTypes)){
        mediaTypes = mediaTypes.split(",");
    }
    mediaTypes = Array.isArray(mediaTypes)? mediaTypes : isNonNullString(mediaTypes)? mediaTypes.split(",") : [];
    filter = typeof filter =="function"? filter : x=>true;
    if (!mediaTypes.length) mediaTypes.push(...['video', 'audio'])
    const FILE_EXTENSIONS = ['webm', 'ogg', 'mp4', 'x-matroska']
    const CODECS = ['vp9', 'vp9.0', 'vp8', 'vp8.0', 'avc1', 'av1', 'h265', 'h.265', 'h264', 'h.264', 'opus']
    return [...new Set(
      FILE_EXTENSIONS.flatMap(ext =>
        CODECS.flatMap(codec =>
          mediaTypes.flatMap(mediaType => [
            `${mediaType}/${ext};codecs:${codec}`,
            `${mediaType}/${ext};codecs=${codec}`,
            `${mediaType}/${ext};codecs:${codec.toUpperCase()}`,
            `${mediaType}/${ext};codecs=${codec.toUpperCase()}`,
            `${mediaType}/${ext}`,
          ]),
        ),
      ),
    )].filter(variation => MediaRecorder.isTypeSupported(variation) && filter(variation))
}  
const recordingKeys = ['isRecording','isPaused','isInactive'];
function mainDesktopCapturer (){   
    let mimeType = "video/webm;codecs=vp9";
    let recordingOptions = {};
    var recorder;
    let blobs = [];
    const electronDesktopCapturer = isElectron() && typeof window?.ELECTRON !=="undefined" && typeof window?.ELECTRON?.desktopCapturer =="object" && ELECTRON?.desktopCapturer || {};
    const getRecordingStatus = ()=>{
        const ret = {}
        if(recorder){
            recordingKeys.map((v)=>{
                if(recorder){
                    ret[v] = recorder.state == v.toLowerCase().split("is")[1]? true : false
                } else {
                    ret[v] = false;
                }
            });
        } else if(electronDesktopCapturer?.getRecordingStatus){
            return electronDesktopCapturer?.getRecordingStatus();
        }
        return ret;
    };
    function handleStream(stream,opts) {
        opts = Object.assign({},opts);
        recorder = new MediaRecorder(stream, { mimeType});
        blobs = [];
        recorder.ondataavailable = function(event) {
            if(event.data.size > 0){
                blobs.push(event.data);
            }
            updateSystemTray();
        };
        recorder.onstop = function(event){
            updateSystemTray();
            if(!blobs.length) return false;
            const opts = defaultObj(recordingOptions);
            let {fileName} = opts;
            fileName = defaultStr(fileName,"video-"+APP.getName()+"-"+(new Date().toFormat("dd-mm-yyyy HHMM"))).trim();
            fileName = (fileName.rtrim(getFileExtension(fileName,false)))+".webm";
            return FileSaver.save({content:new Blob(blobs, {type: mimeType}),mimeType,fileName}).then(({path,fileName})=>{
                if(isNonNullString(path) || isNonNullString(fileName)){
                    notify.info(`Vidéo sauvegardée ${isNonNullString(path)?` à l'emplacement  [${path}]`:` avec comme nom de fichier ${fileName}`}`);    
                }
            }).catch(notify.error).finally(()=>{
                recorder = undefined;
                blobs = [];
            });
        }
        recorder.start(1000);
        updateSystemTray();
    }
     
    function startRecording(opts) {
        if(recorder){
            recorder.stop();
        }
        recorder = undefined;
        opts = defaultObj(opts)
        if(!canRecord()){
            return Promise.reject({stauts:false,isRecording:false,msg:"unable to get user media, get user media is not a function"})
        }
        if(isNonNullString(opts.mimeType)){
            const mimeTypes = getSupportedMimeTypes(x=>!x.startsWith("audio/"))
            if(mimeTypes.includes(opts.mimeType)){
                mimeType = opts.mimeType;
            }
        }
        if(typeof electronDesktopCapturer?.startRecording ==='function'){
            try {
                const e = electronDesktopCapturer.startRecording({...opts,mimeType,updateSystemTray,handleUserMediaError})
                const cb = (e)=>{
                    console.log(e," is e of recorder gettted");
                    if(e instanceof MediaRecorder){
                        recorder = e;
                    }
                    return e;
                }
                return Promise.resolve(e).then(cb).catch(notify.error);
            } catch(e){
                notify.error(e);
                return Promise.reject(e);
            }
        }
        opts.video = defaultObj(opts.video);
        const audio = isBool(opts.audio) && !opts.audio ? false : defaultObj(opts.audio);
        const video = {
            ...opts.video,
            mediaSource: "screen"
        }
        recordingOptions = opts;
        return new Promise((resolve,reject)=>{
            if(audio){
                (async() => {
                    const audioStream = await getUserMediaAsync(getAudioConstraint(),false)
                    const videoStream = await getUserMediaAsync({audio:false,video})
                    if(audioStream && videoStream){
                        const combinedStream = new MediaStream([...videoStream.getVideoTracks(), ...audioStream.getAudioTracks()])
                        handleStream(combinedStream,opts)
                    }
                    resolve({isRecording:true});
                })();
            } else {
                return getUserMediaSync({audio:false,video}).then((stream)=>{
                    handleStream(stream,opts);
                    resolve({isRecording:true})
                }).catch(handleUserMediaError);
            }
            return resolve({isRecording:false});
        })
    }

    function pauseRecording(){
        if(electronDesktopCapturer?.pauseRecording){
            return electronDesktopCapturer?.pauseRecording();
        }
        if(!recorder || !getRecordingStatus().isRecording) return;
        recorder.pause();
        updateSystemTray();
        return true;
    }
    function resumeRecording(){
        if(electronDesktopCapturer?.resumeRecording) return electronDesktopCapturer.resumeRecording();
        if(!recorder || !getRecordingStatus().isPaused) return;
        recorder.resume();
        updateSystemTray();
        return true;
    }
    function stopRecording(opts) {
        if(electronDesktopCapturer.stopRecording) return electronDesktopCapturer.stopRecording();
        if(!recorder) return false;
        let s = getRecordingStatus();
        if(!s.isPaused && !s.isRecording){
            recorder = undefined;
            return false;
        }
        if(recorder){
            let s = getRecordingStatus();
            if(s.isRecording || s.isPaused){
                recorder.stop();
            }
        }
        recorder = undefined;
        return true;
    }
    return {
        canRecord,
        isUserMediaAvailable:canRecord,
        getRecordingStatus,
        startRecording,
        pauseRecording,
        resumeRecording,
        getAudioConstraint,
        stopRecording, 
        getSupportedMimeTypes,
    }
}

export const looopForTimer = (timer)=>{
    return new Promise((resolve,reject)=>{
        let timerCB = undefined;
        timer = typeof timer =='number'? timer : 3000;
        const loopCB = ()=>{
            clearTimeout(timerCB);
            const d = Math.ceil(timer/1000);
            const testID = "RN_PreloaderLooper";
            if(timer >= 1000){
                Preloader.open({
                    content : <HStack testID={testID}>
                        <Label>Début capture dans</Label>
                        <Label textBold fontSize={40}>{" "+(d).formatNumber()+" "}</Label>
                        <Label>seconde{d>1 &&"s"}</Label>
                    </HStack>
                })
                timer-=1000;
                timerCB = setTimeout(loopCB,900);
                return;
            }
            Preloader.close();
            resolve();
        }
        return loopCB();
    })
}
const desktopCapturer = mainDesktopCapturer();

export function handleCapture(){
    if(!canRecord()){
        const message = "Impossible de faire des enregistrements vidéo sur ce type de périférique";
        notify.error(message);
        return Promise.reject({message});
    }
    const {isRecording,isPaused} = desktopCapturer.getRecordingStatus();
    let fields = {},title = "Capture d'écran vidéo en cours", yes = null, no = "Annuler";
    const mimeTypes = getSupportedMimeTypes("video");
    let onSuccess = undefined;
    const sKey = !isPaused && !isRecording  ? startSessionKey : actionsSessionKey;
    const data = Object.assign({},session.get(sKey));
    if(!isPaused && !isRecording){
        title = "Effectuer une capture d'écran vidéo";
        fields = {
            audio : {
                text : "Enregistrer le son",
                type : 'switch',
                defaultValue : true,
                checkedValue : true,
                uncheckedValue : false,
            },
            timer : {
                text : 'Délai d\'attente en secondes',
                type : 'number',
                format : 'number',
                defaultValue : !isElectron() ? 0 : 3,
            },
            mimeType : {
                text : 'Format de la vidéo',
                type : 'select',
                items : mimeTypes,
                defaultValue : mimeTypes[0],
                itemValue : ({item,index})=>item,
                renderText : ({item,index}) => item,
                renderItem : ({item,index}) => item,
            }
        }
        yes = {
            text : 'Capturer',
            icon : "record"
        }
        onSuccess = ({data})=>{
            const timer = Math.ceil(typeof data.timer =="number"? data.timer : 0);
            if(timer >  0){
                return looopForTimer(timer*1000).then(()=>{
                    desktopCapturer.startRecording(data);
                });
            }
            desktopCapturer.startRecording(data);
        }
    } else {
        const type = isRecording || isPaused ? "radio" : undefined;
        fields = {
            action : {
                text : 'Que voulez vous faire?',
                type : 'select',
                items : [
                    isRecording? {
                        code :'pauseRecording',
                        label:'Mettre la capture en pause',
                        type,
                    } : undefined,
                    isPaused ? {
                        code :"resumeRecording",
                        label:'Reprendre la capture vidéo',
                        type,
                    } : undefined,
                    {
                        code:'stopRecording',
                        label:'Arréter la capture vidéo',
                    },
                ],
                defaultValue : isPaused?'resumeRecording' : 'stopRecording',
                multiple : false,
                required : true,
            }
        }
        yes = {
            text : "Exécuter",
            icon : "play",
        }
        no = {
            text : "Annuler",
            icon :"cancel",
        }
        onSuccess = ({data})=>{
            if(typeof desktopCapturer[data.action] ==='function'){
                return desktopCapturer[data.action]();
            }
        }
    }
    return DialogProvider.open({
        title,
        actions : [yes],
        onSuccess : ({data,...rest})=>{
            if(onSuccess) onSuccess({data,...rest});
            DialogProvider.close();
            session.set(sKey,data);
        },
        data,
        fields,
    });
}


export default desktopCapturer;
