module.exports = (ELECTRON)=>{
    let ProgressBar = require("./ProgressBar")
    let progressBarCounter = 0;
    function getUserMedia(constraints) {
        let check = typeof constraints === "boolean"? true : false;
        if(check){
            constraints = {};
        }
        // if Promise-based API is available, use it
        if (isObj(navigator.mediaDevices)) {
            if(check === true) return true;
            return navigator.mediaDevices.getUserMedia(constraints);
        }
          
        // otherwise try falling back to old, possibly prefixed API...
        var legacyApi = navigator.getUserMedia || navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia || navigator.msGetUserMedia;
        if(check === true){
            return legacyApi ? true : false;
        }
        if (legacyApi) {
          return new Promise(function (resolve, reject) {
            legacyApi.bind(navigator)(constraints, resolve, reject);
          });
        }
        return Promise.reject({status:false,msg:"user media not available"})
    }
    const { desktopCapturer,ipcRenderer } = require('electron')
    let SECRET_KEY = require("../app.config").id;
    ipcRenderer.on("click-on-system-tray-menu-item",(event,opts)=>{
        opts = defaultObj(opts);
        switch(opts.action){
            case "pauseRecording":
                return pauseRecording();
            case "stopRecording":
                return stopRecording();
            case "resumeRecording" : 
                return resumeRecording();
        }
    }),
    updateSystemTray = ()=>{
        let {isPaused,isRecording} = APP.desktopCapturer.getRecordingStatus();
        /*ipcRenderer.send("update-system-tray",{
            tooltip : isRecording? ("La capture vidéo est en cours d'enregistrement"):(isPaused? "La capture vidéo est en pause":"La capture vidéo est inactive"),
            contextMenu : isRecording || isPaused? JSON.stringify([
                { label: isRecording? 'Mettre en pause':'Relancer la capture vidéo',action:isRecording?'pauseRecording':'resumeRecording'},
                { label: 'Arréter la capture vidéo',action:'stopRecording'}
            ]): null
        });*/
        if(!APP.COMPANY.showPreloaderOnScreenCapture){
            if(progressBarCounter !== 0){
                progressBarCounter = 0;
                ProgressBar.set(0);
            }
            return false;
        }
        if((isPaused || !isRecording)){
            progressBarCounter = 0;
        } else if(isRecording){
            progressBarCounter+=2;
        } else progressBarCounter = 0;
        ProgressBar.set(progressBarCounter);
    }
    async function getUserMediaAsync(constraints) {
        try {
          const stream = await getUserMedia(constraints);
          return stream;
        } catch (e) {
          console.error('navigator.getUserMedia error:', e);
        }
        return null;
    }
    function startRecording(opts) {
        opts = defaultObj(opts)
        var title = document.title;
        document.title = SECRET_KEY;
        opts.video = defaultObj(opts.video);
        let audio = isBool(opts.audio) && !opts.audio ? false : defaultObj(opts.audio);
        let handleStream = defaultFunc(opts.handleStream), handleUserMediaError = defaultFunc(opts.handleUserMediaError)
        let video = {
            ...opts.video,
            mandatory: {
                ...defaultObj(opts.video.mandatory),
                chromeMediaSource: 'desktop',
            }
        }
        return  desktopCapturer.getSources({ types: ['window', 'screen'] }).then(function(sources) {
            for (let i = 0; i < sources.length; i++) {
                let src = sources[i];
                if (src.name === SECRET_KEY) {
                    document.title = title;
                    video.mandatory.chromeMediaSourceId = src.id;
                    if(audio){
                        (async() => {
                            const audioStream = await getUserMediaAsync(APP.desktopCapturer.getAudioConstraint())
                            const videoStream = await getUserMediaAsync({audio:false,video})
                            if(audioStream && videoStream){
                                const combinedStream = new MediaStream([...videoStream.getVideoTracks(), ...audioStream.getAudioTracks()])
                                handleStream(combinedStream)
                            }
                        })();
                    } else {
                        getUserMedia({audio:false,video}).then(handleStream).catch(handleUserMediaError);
                    }
                    return {sources,currentSource:src,isRecording:true};
                }
            }
            return {sources,isRecording:false};
        });
    }

    if(!isObj(ELECTRON.desktopCapturer)){
        Object.defineProperties(ELECTRON,{
            desktopCapturer : {
                value : {
                    updateSystemTray, 
                    startRecording,
                }
                ,override:false,writable:false
            }
        })
    }
}