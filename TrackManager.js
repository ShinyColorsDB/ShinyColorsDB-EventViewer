class TrackManager {
    constructor(app) {
        this._tracks = [];
        this._current = 0;
        this._nextLabel = null;
        this._stopTrackIndex = -1;
        this._app = app;
        this._loader = PIXI.Loader.shared;
        this._bgManager = new BgManager();
        this._fgManager = new FgManager();
        this._spineManager = new SpineManager();
        this._textManager = new TextManager();
        this._selectManager = new SelectManager();
        this._soundManager = new SoundManager();
        this._effectManager = new EffectManager();
        this._timeoutToClear = null;

        PIXI.sound.volumeAll = 0.1;
        //console.log(`trackManager is ready.`);
    }

    set setTrack(tracks) {
        this._tracks = tracks;
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

    addToStage() {
        this._app.stage.addChild(this._bgManager.stageObj, this._fgManager.stageObj, this._spineManager.stageObj, this._effectManager.stageObj, this._textManager.stageObj, this._selectManager.stageObj);
    }

    loadCurrentTrackAssets() {
        console.log(this._current, this.currentTrack);
        if (this.currentTrack.label == "end") {
            this.endOfEvent();
            return;
        }
        const { select, nextLabel, textFrame, bg, fg, se, voice, bgm, movie, charId, charType, charLabel } = this.currentTrack;

        if (textFrame && textFrame != "off" && !this._loader.resources[textFrame]) {
            this._loader.add(textFrame, `${assetUrlPath}/images/event/text_frame/${textFrame}.png`);
        }
        if (bg && !this._loader.resources[bg]) {
            this._loader.add(bg, `${assetUrlPath}/images/event/bg/${bg}.jpg`);
        }
        if (fg && !this._loader.resources[fg] && fg != "off") {
            this._loader.add(fg, `${assetUrlPath}/images/event/fg/${fg}.png`);
        }
        if (se && !this._loader.resources[se]) {
            this._loader.add(se, `${assetUrlPath}/sounds/se/event/${se}.m4a`);
        }
        if (voice && !this._loader.resources[voice]) {
            this._loader.add(voice, `${assetUrlPath}/sounds/voice/events/${voice}.m4a`);
        }
        if (bgm && !this._loader.resources[bgm] && bgm != "fade_out") {
            this._loader.add(bgm, `${assetUrlPath}/sounds/bgm/${bgm}.m4a`);
        }
        if (movie && !this._loader.resources[movie]) {
            this._loader.add(movie, `${assetUrlPath}/movies/idols/card/${movie}.mp4`);
        }
        if (charLabel && !this._loader.resources[charLabel]) {
            this._loader.add(charLabel, `${assetUrlPath}/spine/${charType}/stand/${charId}/data.json`);
        }
        if (select && !this._loader.resources[select]) {
            this._loader.add(`selectFrame${nextLabel}`, `${assetUrlPath}/images/event/select_frame/00${nextLabel}.png`);
        }
        this._loader.load(() => {
            this._renderTrack();
        });
    }

    _renderTrack() {
        const { speaker, text, textCtrl, textWait, textFrame,
            bg, bgEffect, bgEffectTime, fg, fgEffect, fgEffectTime, bgm, se, voice, voiceKeep, lip, select, nextLabel, charStill, stillCtrl, still, movie,
            charSpine, charLabel, charPosition, charScale, charAnim1, charAnim2, charAnim3, charAnim4, charAnim5,
            charAnim1Loop, charAnim2Loop, charAnim3Loop, charAnim4Loop, charAnim5Loop, charLipAnim, charEffect,
            effectLabel, effectTarget, effectValue, waitType, waitTime } = this.currentTrack;

        if (nextLabel == "end") { this._jumpTo(nextLabel); return; }

        this._bgManager.processBgByInput(bg, bgEffect, bgEffectTime);
        this._fgManager.processFgByInput(fg, fgEffect, fgEffectTime);
        this._textManager.processTextFrameByInput(textFrame, speaker, text);
        this._spineManager.processSpineByInput(charLabel, charPosition, charScale, charAnim1, charAnim2, charAnim3, charAnim4, charAnim5,
            charAnim1Loop, charAnim2Loop, charAnim3Loop, charAnim4Loop, charAnim5Loop, charLipAnim, charEffect)
        this._selectManager.processSelectByInput(select, nextLabel, this._jumpTo.bind(this), this._afterSelection.bind(this));

        this._soundManager.processSoundByInput(bgm, se, voice, charLabel, this._spineManager.stopLipAnimation.bind(this._spineManager));
        this._effectManager.processEffectByInput(effectLabel, effectTarget, effectValue);

        this.forward();

        if (select && !textCtrl) {
            this._app.stage.interactive = false;
            this.loadCurrentTrackAssets();
        }
        else if (select && textCtrl) {

        }
        else if (text) {

        }
        else if (waitType == "time") { // should be modified, add touch event to progress, not always timeout
            this._timeoutToClear = setTimeout(() => {
                this.loadCurrentTrackAssets();
            }, waitTime);
        }
        else {
            this.loadCurrentTrackAssets();
        }

    }

    endOfEvent() {
        this._soundManager.reset();
        this._bgManager.reset();
        this._spineManager.reset();
        this._textManager.reset();
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

    _afterSelection() {
        this._app.stage.interactive = true;
        this.loadCurrentTrackAssets();
    }
}