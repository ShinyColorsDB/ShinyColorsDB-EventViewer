
'use strict';

function getQueryVariable(name, defRet = null) {
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    const result = window.location.search.substring(1).match(reg);
    if (result != null) {
        return decodeURI(result[2]);
    } else {
        return defRet;
    }
}

const EventHelper = {
    createApp : function(){
        if (document.getElementById("ShinyColors")) {
            document.getElementById("ShinyColors").remove();
        }

        PIXI.utils.skipHello();

        const app = new PIXI.Application({
            width: 1136,
            height: 640,
        });
        app.view.setAttribute("id", "ShinyColors");
        document.body.appendChild(app.view);

        let resize = () => {
            let height = document.documentElement.clientHeight;
            let width = document.documentElement.clientWidth;

            let ratio = Math.min(width / 1136, height / 640);

            let resizedX = 1136 * ratio;
            let resizedY = 640 * ratio;

            app.view.style.width = resizedX + 'px';
            app.view.style.height = resizedY + 'px';
        }
        window.onresize = () => resize();

        return app;
    },
    getTrack : async function(source){
        return await fetch(`${assetUrl}/json/${source}`)
            .then(res => res.json())
            .catch(e => console.error(e));
    },
    getTranslateByLabel : async function(label){
        label = label.includes('.json') ? label : `${label}.json`;
        let masterlist = await fetch(translate_master_list)
            .then(res => res.json())
            .catch(e => console.error(e));
        let result = masterlist.find(([key, _]) => key === label);
        if (!result) {
            return void 0;
        }

        let url = translate_CSV_url.replace('{uid}', result[1]);

        return this.getTranslateByUrl(url);
    },
    getTranslateByUrl : async function(url){
        let csvtext = await fetch(url)
            .then(res => res.text())
            .catch(e => console.error(e));
        if(csvtext === ''){
            return void 0;
        }

        return this.getTranslateByCSVText(csvtext);
    },
    getTranslateByCSVText : async function(text){
        const dataJSON = {
            translator: '',
            info : '',
            table: [],
        };
        const table = text.split(/\r\n/).slice(1);
        table.forEach(row => {
            let columns = row.split(',');
            if (columns[0] === 'info') {
                dataJSON['info'] = columns[1];
            }
            else if (columns[0] === '译者') {
                dataJSON['translator'] = columns[1];
            }
            else if (columns[0] != '') {
                dataJSON['table'].push({
                    id: columns[0],
                    name: columns[1],
                    text: columns[2].replace('\\n', '\r\n'),
                    trans: columns[3].replace('\\n', '\r\n'),
                });
            }
        });

        return dataJSON;
    }
}

class EventPlayer {
    
    _interestedEvents = ["click", "touchstart"];
    _Menu = {
        touchToStart: null,
        autoBtn: null,
        switchLangBtn: null,
    };
    _autoBtn_texture = {
        autoOn: null,
        autoOff: null,
    };
    _switchLangBtn_texture = [];
    _isTranslate = false;
    _tm = void 0;
    _app = void 0;

    constructor(pixiapp){
        this._app = pixiapp;
        this._tm = new TrackManager(this._app);
        this._tm.addToStage();
        this.helloBanner();
    }

    set isTranslate(boolean) {
        this._isTranslate = boolean;
    }

    reset() {
        this._tm.endOfEvent(false);
    }

    loadTrackScript(Track){
        if (!this._app || !this._tm) {
            return;
        }
        this._tm.setTrack = Track;
    }

    loadranslateScript(translateJson){
        if (!this._app || !this._tm) {
            return;
        }
        this._isTranslate = true;
        this._tm.setTranslateJson = translateJson;
    }

    async LoadFont(FontName) {
        const font = new FontFaceObserver(FontName);
        return await font.load(null, fontTimeout);
    }

    async start() {
        this._app.loader
            .add("touchToStart", "./assets/touchToStart.png")
            .add("autoOn", "./assets/autoOn.png")
            .add("autoOff", "./assets/autoOff.png")
            .add("jpON", "./assets/jpOn.png")
            .add("zhJPOn", "./assets/zhJPOn.png")
            .add("zhOn", "./assets/zhOn.png")
            .load((_, resources) => this._ready(resources));
    }

    _ready = (resources) => {
        this._Menu.touchToStart = new PIXI.Sprite(resources.touchToStart.texture);
        this._Menu.autoBtn = new PIXI.Sprite(resources.autoOn.texture);
        this._autoBtn_texture.autoOn = resources.autoOn.texture;
        this._autoBtn_texture.autoOff = resources.autoOff.texture;

        if (this._isTranslate) {
            this._Menu.switchLangBtn = new PIXI.Sprite(resources.jpON.texture);
            this._switchLangBtn_texture = [
                resources.jpON.texture,
                resources.zhOn.texture,
                resources.zhJPOn.texture
            ];
        }

        // this._app.stage.interactive = true;
        let touchToStart = this._Menu.touchToStart;
        touchToStart.anchor.set(0.5);
        touchToStart.position.set(568, 500);
        this._app.stage.addChild(touchToStart);

        this._interestedEvents.forEach(e => {
            this._app.view.addEventListener(e, this._afterTouch);
        });
    };

    fastForward(forwardJson) {
        this._tm.fastForward = forwardJson.forward;
        if (forwardJson.forward) {
            this._tm.stopTrack = forwardJson.target;
        }
        else {
            this._tm.stopTrack = -1;
        }
        this._removeTouchToStart();
        this._tm.loadAssetsByTrack();
    }

    _removeTouchToStart() {
        this._app.stage.interactive = false;
        this._app.stage.removeChild(this._Menu.touchToStart);
        this._interestedEvents.forEach(e => {
            this._app.view.removeEventListener(e, this._afterTouch);
        });
        this._interestedEvents.forEach(e => {
            this._app.stage.on(e, this._nextTrack);
        });
    }

    _afterTouch = async () => {
        let { autoBtn, switchLangBtn } = this._Menu;

        this._removeTouchToStart();
        
        const progressText = new PIXI.Text('0 %', {
            fill: "#FFF",
            fontSize : 50,
        });
        progressText.anchor.set(1);
        progressText.position.set(1136-30, 640-30);
        this._app.stage.addChild(progressText);
        let loadProgressHandler = (loader, resource) => {
            progressText.text = `${Math.floor(loader.progress)} %`;
            if(loader.progress === 100){
                this._app.stage.removeChild(progressText);
            }
        }
        this._tm.loadAssetsByTrack(loadProgressHandler);

        //auto Btn
        autoBtn.anchor.set(0.5);
        autoBtn.position.set(1075, 50);
        autoBtn.interactive = true;
        this._app.stage.addChild(autoBtn);

        this._interestedEvents.forEach(e => { // autoplay is initialized to false
            autoBtn.on(e, () => {
                this._tm.toggleAutoplay();
                this._toggleAutoplay();
            });
        });

        //Trans
        if (this._isTranslate) {
            switchLangBtn.anchor.set(0.5);
            switchLangBtn.position.set(1075, 130);
            switchLangBtn.interactive = true;
            this._app.stage.addChild(switchLangBtn);

            this._interestedEvents.forEach(e => { // autoplay is initialized to false
                switchLangBtn.on(e, () => {
                    this._tm.toggleLangDisplay();
                    this._toggleLangDisplay();
                });
            });
        }
    };

    _toggleAutoplay() {
        let { autoBtn } = this._Menu;
        let { autoOn, autoOff } = this._autoBtn_texture;

        if (this._tm.autoplay) { // toggle on
            // console.log(this._tm._trackPromise)
            this._tm._trackPromise?.then((bool) => {
                if (bool) {
                    this._tm._renderTrack();
                }
            })

            autoBtn.texture = autoOn;
            this._app.stage.interactive = false;
        }
        else { // toggle off

            autoBtn.texture = autoOff;
            this._app.stage.interactive = true;
        }
    }

    _toggleLangDisplay() {
        let { switchLangBtn } = this._Menu;
        let next = this._tm._translateLang;
        switchLangBtn.texture = this._switchLangBtn_texture[next];
    }

    _nextTrack = (ev) => {
        if (ev.target !== this._app.stage) { return; }
        if (this._tm.autoplay) { return; }
        // if (this._tm._animationPromise) { return; } //正在動畫中
        if (this._tm._textTypingEffect) {
            clearInterval(this._tm._textTypingEffect);
        }

        this._tm._renderTrack();
    };

    helloBanner() {
        const log = [
            `\n\n %c  %c   ShinyColors Event Viewer   %c  %c  https://github.com/ShinyColorsDB/ShinyColorsDB-EventViewer  %c \n\n`,
            'background: #28de10; padding:5px 0;',
            'color: #28de10; background: #030307; padding:5px 0;',
            'background: #28de10; padding:5px 0;',
            'background: #5eff84; padding:5px 0;',
            'background: #28de10; padding:5px 0;',
        ];

        console.log(...log);
    }
}

//------------Main-----------------

async function init(){
    // get props from url
    let eventId = getQueryVariable("eventId");
    let eventType = getQueryVariable("eventType", "produce_events");
    let isIframeMode = getQueryVariable("iframeMode", null) === "1";
    let isTranslate = getQueryVariable("isTranslate", null) === '1';
    
    //
    let jsonPath;

    //create PIXI app and event player
    const app = EventHelper.createApp();
    const advPlayer = new EventPlayer(app);
    await advPlayer.LoadFont(usedFont); //load JP Font
    await advPlayer.LoadFont(zhcnFont); //load ZH_cn Font (for Translate)
        
    // Iframe Handler
    async function eventHandler(e) {
        if (!e.data.messageType || !e.origin) {
            console.log("Invalid message");
            return;
        }
        switch (e.data.messageType) {
            case "iframeJson":
                console.log("Received iframeJson");
                advPlayer.loadTrackScript(e.data.iframeJson);

                if (e.data.csvText) {
                    const translateJson = EventHelper.getTranslateByCSVText(e.data.csvText);
                    if (translateJson) {
                        advPlayer.loadranslateScript(translateJson);
                    }
                }
                
                advPlayer.start();
                break;
            case "fastForward":
                console.log("Received fastForward");
                advPlayer.reset();
                advPlayer.fastForward(e.data.fastForward);
                break;
        }
    }

    // Iframe Mode
    if (isIframeMode) {
        window.addEventListener('message', eventHandler, false);
        window.parent.postMessage({
            eventViewerIframeLoaded: true
        }, "*");
    }
    else {
        //load Event Track Script and [Optional]Translate Script
        if (eventId) {
            jsonPath = `${eventType}/${eventId}.json`;
        }
        else {
            jsonPath = prompt("input json path: ", "produce_events/202100711.json");
            eventId = jsonPath.split("/")[1].split(".")[0];
            eventType = jsonPath.split("/")[0];
            window.location.search = `eventType=${eventType}&eventId=${eventId}`;
        }
    
        const trackScript = await EventHelper.getTrack(jsonPath);
        advPlayer.loadTrackScript(trackScript);
    
        if (isTranslate) {
            const translateJson = await EventHelper.getTranslateByLabel(jsonPath);
            advPlayer.loadranslateScript(translateJson);
        }
    
        advPlayer.start();
    }

}