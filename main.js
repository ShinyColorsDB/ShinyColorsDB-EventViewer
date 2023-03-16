'use strict';

async function init() {

    let eventId = getQueryVariable("eventId");
    let eventType = getQueryVariable("eventType", "produce_events");
    let isIframeMode = getQueryVariable("iframeMode", null) === "1";
    let isTranslate = getQueryVariable("isTranslate", null) === '1';
    
    let jsonPath; 

    const advPlayer = new AdvPlayer();
    await advPlayer.LoadFont(usedFont); //load Font

    if (isIframeMode) {
        const receiveJson = function (e) {
            if (!e.origin || !e.data?.iframeJson) {
                return;
            }
            // prepareCanvas(null, e.data.iframeJson);
            advPlayer.loadTrackScript(e.data.iframeJson);
            if (e.data.csvText) {
                const translateJson = advPlayer._CSVToJSON(e.data.csvText)
                advPlayer._tm.setTranslateJson = translateJson;
            }
        };
        window.addEventListener('message', receiveJson, false);
        window.parent.postMessage({
            eventViewerIframeLoaded: true
        }, "*")
    }
    else{
        if (eventId) {
            jsonPath = `${eventType}/${eventId}.json`;
        }
        else {
            jsonPath = prompt("input json path: ", "produce_events/202100711.json");
            eventId = jsonPath.split("/")[1].split(".")[0];
            eventType = jsonPath.split("/")[0];
            window.location.search = `eventType=${eventType}&eventId=${eventId}`;
        }
    
        await advPlayer.loadTrackScript(jsonPath);
    }
    
    if(isTranslate){
        advPlayer.isTranslate = true
        await advPlayer.LoadFont(zhcnFont); //load Font
        await advPlayer.loadTranslateScript(jsonPath);
    }
    
    advPlayer.start();
}

function getQueryVariable(name, defRet = null) {
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    const result = window.location.search.substring(1).match(reg);
    if (result != null) {
        return decodeURI(result[2]);
    } else {
        return defRet;
    }
}

class AdvPlayer {

    _interestedEvents = ["click", "touchstart"];
    _Menu = {
        touchToStart : null,
        autoOn : null,
        autoOff : null,
        zhOn : null,
        zhJPOn : null,
        jpON : null
    }
    _isTranslate = false

    constructor(){
        this.createApp();
        this.createPlayer();
    }

    set isTranslate(boolean){
        this._isTranslate = boolean
    }

    createApp(){
        if (document.getElementById("ShinyColors")) {
            document.getElementById("ShinyColors").remove();
        }
    
        this._app = new PIXI.Application({
            width: 1136,
            height: 640
        });
    
        this._app.view.setAttribute("id", "ShinyColors");
    
        document.body.appendChild(this._app.view);
        
        this._resize();
        window.onresize = () => this._resize();
    }

    createPlayer(){
        if(!this._app){
            console.error('PIXI app has not been initialized');
            return ;
        }
        this._tm = new TrackManager(this._app);
        this._tm.addToStage();
    }

    async loadTrackScript(Track){

        if(!this._app || !this._tm){
            return Promise.reject();
        }

        if(typeof Track === 'string'){
            return new Promise((res, rej)=>{
                this._app.loader.add("eventJson", `${assetUrl}/json/${Track}`)
                .load((_, resources) => {
                    if (resources.eventJson.error) { alert("No such event."); return; }
                    this._tm.setTrack = resources.eventJson.data;
                    res(Track);
                })
            })
        }
        else if(typeof Track === 'object'){
            this._tm.setTrack = Track;
            return Promise.resolve(Track);
        }
    }

    async loadTranslateScript(Script){
        if(!this._app || !this._tm){
            return Promise.reject();
        }

        else if(typeof Script === 'string'){
            let TranslateUrl = await this._searchFromMasterList(Script);

            if(!TranslateUrl){
                return Promise.reject();
            }

            return new Promise((res, rej)=>{
                this._app.loader.add("TranslateUrl", TranslateUrl)
                .load((_, resources) => {
                    let translateJson = this._CSVToJSON(resources.TranslateUrl.data);
                    if(translateJson){
                        this._tm.setTranslateJson = translateJson;
                    }
                    res(translateJson);
                })
            })
        }

        else if(typeof Script === 'object'){
            this._tm.setTranslateJson = Script;
            return Promise.resolve()
        }
    }

    _searchFromMasterList(jsonPath){   
        return new Promise((res, rej) => {
            this._app.loader.add("TranslateMasterList", translate_master_list)
            .load((_, resources) => {
                let translateUrl = this._getCSVUrl(resources.TranslateMasterList.data, jsonPath);
                res(translateUrl);
            })
        })
    }

    async LoadFont(FontName){
        const font = new FontFaceObserver(FontName);
        return await font.load(null, fontTimeout);
    }

    _getCSVUrl = (masterlist, jsonPath) => {
        let translateUrl;
        masterlist.forEach(([key, hash])=>{
            if(key === jsonPath){
                translateUrl = translate_CSV_url.replace('{uid}', hash);
                return translateUrl;
            }
        })
    
        return translateUrl;
    }

    _CSVToJSON = (text) => {
        const json = {
            translater : '',
            url : '',
            table : []
        }
        const table = text.split(/\r\n/).slice(1);    
        table.forEach(row => {
            const columns = row.split(',');
            if(columns[0] === 'info'){
                json['url'] = columns[1];
            }
            else if(columns[0] === '译者'){
                json['translater'] = columns[1];
            }
            else if(columns[0] != ''){
                json['table'].push({
                    id : columns[0],
                    name : columns[1],
                    text : columns[2].replace('\\n', '\r\n'),
                    trans : columns[3].replace('\\n', '\r\n'),
                })
            }
        })
        return json;
    }

    _resize() {
        let height = document.documentElement.clientHeight;
        let width = document.documentElement.clientWidth;

        let ratio = Math.min(width / 1136, height / 640);
    
        let resizedX = 1136 * ratio;
        let resizedY = 640 * ratio;
    
        this._app.view.style.width = resizedX + 'px';
        this._app.view.style.height = resizedY + 'px';
    }

    start(){
        this._app.loader
            .add("touchToStart", "./assets/touchToStart.png")
            .add("autoOn", "./assets/autoOn.png")
            .add("autoOff", "./assets/autoOff.png")
            .add("jpON", "./assets/jpOn.png")
            .add("zhJPOn", "./assets/zhJPOn.png")
            .add("zhOn", "./assets/zhOn.png")
            .load((_, resources) => this._ready(resources))
    }

    _ready = (resources) =>{
        this._Menu.touchToStart = new PIXI.Sprite(resources.touchToStart.texture);
        this._Menu.autoOn = new PIXI.Sprite(resources.autoOn.texture);
        this._Menu.autoOff = new PIXI.Sprite(resources.autoOff.texture);
        this._Menu.jpON = new PIXI.Sprite(resources.jpON.texture);
        this._Menu.zhOn = new PIXI.Sprite(resources.zhOn.texture);
        this._Menu.zhJPOn = new PIXI.Sprite(resources.zhJPOn.texture);

        // this._app.stage.interactive = true;
        let touchToStart = this._Menu.touchToStart;                
        touchToStart.anchor.set(0.5);
        touchToStart.position.set(568, 500);
        this._app.stage.addChild(touchToStart)
        
        this._interestedEvents.forEach(e => {
            this._app.view.addEventListener(e, this._afterTouch);
        });
    }

    _afterTouch = async() => {
        let {touchToStart, autoOn, autoOff, zhOn, jpON, zhJPOn} = this._Menu;

        this._app.stage.interactive = false;
        this._app.stage.removeChild(touchToStart);

        this._tm.loadAssetsByTrack();

        //auto Btn
        autoOn.anchor.set(0.5);
        autoOff.anchor.set(0.5);

        this._app.stage.addChild(autoOn);
        this._app.stage.addChild(autoOff);

        autoOn.position.set(1075, 50);
        autoOff.position.set(1075, 50);

        autoOn.alpha = 1;
        autoOff.alpha = 0;

        autoOn.interactive = true;
        autoOff.interactive = false;

        this._interestedEvents.forEach(e => { // autoplay is initialized to false
            autoOn.on(e, () => {
                this._tm.toggleAutoplay();
                this._toggleAutoplay();
            });
            autoOff.on(e, () => {
                this._tm.toggleAutoplay();
                this._toggleAutoplay();
            });
        });

        if(this._isTranslate){
            //Trans
            zhOn.anchor.set(0.5);
            jpON.anchor.set(0.5);
            zhJPOn.anchor.set(0.5);
            
            zhOn.position.set(1075, 130);
            jpON.position.set(1075, 130);
            zhJPOn.position.set(1075, 130);

            this._app.stage.addChild(jpON);
            this._app.stage.addChild(zhOn);
            this._app.stage.addChild(zhJPOn);
    
            jpON.alpha = 1;
            zhOn.alpha = 0;
            zhJPOn.alpha = 0;
    
            jpON.interactive = true;
            zhOn.interactive = false;
            zhJPOn.interactive = false;

            this._interestedEvents.forEach(e => { // autoplay is initialized to false
                zhOn.on(e, () => {
                    this._tm.toggleLangDisplay();
                    this._toggleLangDisplay()
                });
                jpON.on(e, () => {
                    this._tm.toggleLangDisplay();
                    this._toggleLangDisplay()
                });
                zhJPOn.on(e, () => {
                    this._tm.toggleLangDisplay();
                    this._toggleLangDisplay()
                });
            });
        }

        this._interestedEvents.forEach(e => {
            this._app.view.removeEventListener(e, this._afterTouch);
        });

        this._interestedEvents.forEach(e => {
            this._app.stage.on(e, this._nextTrack);
        });
    }

    _toggleAutoplay(){
        let {autoOn, autoOff} = this._Menu;
        
        if (this._tm.autoplay) { // toggle on
            if (!this._tm._timeoutToClear) {
                this._tm._renderTrack();
            }
    
            autoOn.alpha = 1;
            autoOn.interactive = true;
            // autoOn.cursor = 'pointer'
            autoOff.alpha = 0;
            autoOff.interactive = false;
            // autoOff.cursor = 'none'
    
            this._app.stage.interactive = false;
        }
        else { // toggle off
            if (this._tm._timeoutToClear) {
                clearTimeout(this._tm._timeoutToClear);
                this._tm._timeoutToClear = null;
            }
    
            autoOn.alpha = 0;
            autoOn.interactive = false;
            // autoOn.cursor = 'none'
            autoOff.alpha = 1;
            autoOff.interactive = true;
            // autoOff.cursor = 'pointer'
    
            this._app.stage.interactive = true;
        }
    }

    _toggleLangDisplay(){

        let {jpON, zhOn, zhJPOn} = this._Menu;
        let btns = [jpON, zhOn, zhJPOn]
        let next = this._tm._translateLang
        
        btns.forEach((btn, index)=>{
            if(index === next){
                btn.alpha = 1;
                btn.interactive = true;
            }
            else{
                btn.alpha = 0;
                btn.interactive = false;
            }
        })
    }

    _nextTrack = (ev) => {
        if (ev.target !== this._app.stage) {return ;}
        if (this._tm.autoplay) { return; }
        if (this._tm._timeoutToClear) {
            clearTimeout(this._tm._timeoutToClear);
        }
        if (this._tm._textTypingEffect) {
            clearInterval(this._tm._textTypingEffect);
        }

        this._tm._renderTrack();
    };
}