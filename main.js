'use strict';

class TrackManager {
    constructor(tracks, app, bgM, spnM, txtM) {
        this._tracks = tracks;
        this._current = 0;
        this._nextLabel = null;
        this._stopTrackIndex = -1;
        this._app = app;
        this._loader = PIXI.Loader.shared;
        this._bgManager = bgM;
        this._spineManager = spnM;
        this._textManager = txtM;
    }

    get currentTrack() {
        return this._tracks[this._current];
    }

    get nextTrack() {
        return this._tracks[this._current + 1];
    }

    get reachesStopTrack() {
        return this._stopTrackIndex !== -1 && this._current === this._stopTrackIndex;
    }

    set nextLabel(v) {
        this._nextLabel = v;
    }

    destroy() {
        this._tracks = [];
        this._current = 0;
        this._nextLabel = null;
        this._stopTrackIndex = -1;
    }

    forward() {
        if (this._nextLabel) {
            this._jumpTo(this._nextLabel);
        } else {
            this._current++;
        }
        return this.currentTrack;
    }

    setBeforeSelectTrackToStopTrack() {
        const index = this._tracks.findIndex(track => track.select);
        this._stopTrackIndex = (index !== -1 && index !== 0) ? index - 1 : index;
    }

    resetStopTrack() {
        this._stopTrackIndex = -1;
    }

    loadCurrentTrackAssets() {
        console.log(this._current);
        const { textFrame, bg, fg, se, voice, bgm, movie, charId, charType, charLabel } = this.currentTrack;

        if (textFrame && textFrame != "off" && !this._loader.resources[textFrame]) {
            this._loader.add(textFrame, `${assetUrlPath}/images/event/text_frame/${textFrame}.png`);
        }
        if (bg && !this._loader.resources[bg]) {
            this._loader.add(bg, `${assetUrlPath}/images/event/bg/${bg}.jpg`);
        }
        if (fg && !this._loader.resources[fg]) {
            this._loader.add(fg, `${assetUrlPath}/images/event/fg/${fg}.jpg`);
        }
        if (se && !this._loader.resources[se]) {
            this._loader.add(se, `${assetUrlPath}/sounds/se/event/${se}.m4a`);
        }
        if (voice && !this._loader.resources[voice]) {
            this._loader.add(voice, `${assetUrlPath}/sounds/voice/events/${voice}.m4a`);
        }
        if (bgm && !this._loader.resources[bgm]) {
            this._loader.add(bgm, `${assetUrlPath}/sounds/bgm/${bgm}.m4a`);
        }
        if (movie && !this._loader.resources[movie]) {
            this._loader.add(movie, `${assetUrlPath}/movies/idols/card/${movie}.mp4`);
        }
        if (charId ) {
            this._loader.add(charLabel, `${assetUrlPath}/spine/${charType}/${charId}/data.json`);
        }
        this._loader.load(() => {
            this.renderTrack();
        });
    }

    renderTrack() {
        const { speaker, text, textCtrl, textWait, textFrame,
            bg, bgEffect, fg, fgEffect, bgm, se, voice, voiceKeep, lip, select, nextLabel, charStill, stillCtrl, still, movie,
            charSpine, charLabel, charPosition, charScale, charAnim1, charAnim2, charAnim3, charAnim4, charAnim5,
            charAnim1Loop, charAnim2Loop, charAnim3Loop, charAnim4Loop, charAnim5Loop, charLipAnim, charEffect,
            effectLabel, effectTarget, effectValue, waitType, waitTime } = this.currentTrack;

        this._bgManager.processBgByInput(bg, bgEffect);
        this._textManager.processTextFrameByInput(textFrame, speaker, text);

        this.forward();

        setTimeout(() => {
            this.loadCurrentTrackAssets();
        } , 3000);
    }

    _jumpTo(nextLabel) {
        const length = this._tracks.length;
        for (let i = 0; i < length; i++) {
            if (this._tracks[i].label !== nextLabel) { continue; }
            this._current = i;
            this._nextLabel = null;
            return;
        }
        throw new Error(`label ${nextLabel} is not found.`);
    }
}

let ratio = 1.775;

function init() {
    let app = new PIXI.Application({
        width: 1136,
        height: 640
    });

    document.body.appendChild(app.view);

    let bgManager = new BgManager(app.loader); // used for background
    let spineManager = new SpineManager(app.loader); // used for spine rendering
    let textManager = new TextManager(app.loader); // used for text frame

    app.stage.addChild(bgManager.stageObj, spineManager.stageObj, textManager.stageObj);
    
    app.loader.add("eventJson", `${assetUrlPath}/json/produce_events/100100202.json`).load(
        (loader, resources) => {
            const tm = new TrackManager(resources.eventJson.data, app, bgManager, spineManager, textManager);
            console.log(tm);
            tm.loadCurrentTrackAssets();
        }
    );

}

function drawCanvas() {

}

function renderTrack(track) {
    const { speaker, text, textCtrl, textWait, textFrame,
        bg, bgEffect, fg, fgEffect, bgm, se, voice, voiceKeep, lip, select, nextLabel, charStill, stillCtrl, still, movie,
        charSpine, charLabel, charPosition, charScale, charAnim1, charAnim2, charAnim3, charAnim4, charAnim5,
        charAnim1Loop, charAnim2Loop, charAnim3Loop, charAnim4Loop, charAnim5Loop, charLipAnim, charEffect,
        effectLabel, effectTarget, effectValue, waitType, waitTime } = track;
}




































function draw(loader, resources) {
    let spr = new PIXI.Sprite(resources[eventObj[currentSection].bg].texture);
    spr.x = cw / 2;
    spr.y = ch / 2;

    resizeByRatio(spr);

    spr.anchor.x = 0.5;
    spr.anchor.y = 0.5;
    app.stage.addChild(spr);

}

function resizeByRatio(spr) {
    let ratioW = cw / spr.width, ratioH = ch / spr.height;
    //console.log(ratioW, ratioH);
    if (ratioW > ratioH) {
        spr.scale.x = ratioH;
        spr.scale.y = ratioH;
    }
    else {
        spr.scale.x = ratioW;
        spr.scale.y = ratioW;
    }
}


