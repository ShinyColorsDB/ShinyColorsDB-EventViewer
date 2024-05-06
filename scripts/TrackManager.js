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
        this._movieManager = new MovieManager();
        this._stillManager = new StillManager();
        this._timeoutToClear = null;
        this._textTypingEffect = null;
        this._autoPlayEnabled = true;
        this._stopped = false;
        //translate
        this._translateJson = null;
        this._translateLang = 0; // 0:jp 1:zh 2:jp+zh
        this._selecting = false;

        this._fastForwardMode = false;
    }

    set setTrack(tracks) {
        this._tracks = tracks;
    }

    set setTranslateJson(json) {
        this._translateJson = json;
        // this._translateTable = json['table']
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

    get autoplay() {
        return this._autoPlayEnabled;
    }

    set nextLabel(v) {
        this._nextLabel = v;
    }

    set fastForward(f) {
        this._fastForwardMode = f;
    }

    set stopTrack(s) {
        this._stopTrackIndex = s;
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
        this._app.stage.addChild(
            this._bgManager.stageObj,
            this._spineManager.stageObj,
            this._fgManager.stageObj,
            this._stillManager.stageObj,
            this._textManager.stageObj,
            this._selectManager.stageObj,
            this._effectManager.stageObj,
            this._movieManager.stageObj
        );
    }

    loadAssetsByTrack() {
        if (this.currentTrack?.label == "end") {
            this._current = 0;
            this._selectManager.frameReset();
            // this._loader.add("managerSound", './assets/002.m4a')
            this._loader.load(() => {
                this._renderTrack();
            });
            return;
        }
        const { speaker, text, select, nextLabel, textFrame, bg, fg, se, voice, bgm, movie,
            charId, charType, charLabel, charCategory,
            stillType, stillId, stillCtrl, still
        } = this.currentTrack;

        if (speaker && text && this._translateJson) {
            this.currentTrack.translated_text = this._translateJson.table.find((data) => data.name == speaker && data.text == text)['trans'];
        }
        if (textFrame && textFrame != "off" && !this._loader.resources[`textFrame${textFrame}`]) {
            this._loader.add(`textFrame${textFrame}`, `${assetUrl}/images/event/text_frame/${textFrame}.png`);
        }
        if (bg && !this._loader.resources[`bg${bg}`] && bg != "fade_out") {
            this._loader.add(`bg${bg}`, `${assetUrl}/images/event/bg/${bg}.jpg`);
        }
        if (fg && !this._loader.resources[`fg${fg}`] && fg != "off" && fg != "fade_out") {
            this._loader.add(`fg${fg}`, `${assetUrl}/images/event/fg/${fg}.png`);
        }
        if (se && !this._loader.resources[`se${se}`]) {
            this._loader.add(`se${se}`, `${assetUrl}/sounds/se/event/${se}.m4a`);
        }
        if (voice && !this._loader.resources[`voice${voice}`]) {
            this._loader.add(`voice${voice}`, `${assetUrl}/sounds/voice/events/${voice}.m4a`);
        }
        if (bgm && !this._loader.resources[`bgm${bgm}`] && bgm != "fade_out" && bgm != "off") {
            this._loader.add(`bgm${bgm}`, `${assetUrl}/sounds/bgm/${bgm}.m4a`);
        }
        if (movie && !this._loader.resources[`movie${movie}`]) {
            this._loader.add(`movie${movie}`, `${assetUrl}/movies/idols/card/${movie}.mp4`);
        }
        if (charLabel && charId) {
            const thisCharCategory = charCategory ? this._spineManager.spineAlias[charCategory] : "stand";
            if (!this._loader.resources[`${charLabel}_${charId}_${thisCharCategory}`]) {
                this._loader.add(`${charLabel}_${charId}_${thisCharCategory}`, `${assetUrl}/spine/${charType}/${thisCharCategory}/${charId}/data.json`);
            }
        }
        if (select && !this._loader.resources[`selectFrame${this._selectManager.neededFrame}`]) {
            this._loader.add(`selectFrame${this._selectManager.neededFrame}`, `${assetUrl}/images/event/select_frame/00${this._selectManager.neededFrame}.png`);
            if (this._translateJson) {
                this.currentTrack.translated_text = this._translateJson.table.find((data) => data.id == "select" && data.text == select)['trans'];
            }
            this._selectManager.frameForward();
        }
        if (still && !this._loader.resources[`still${still}`] && still != "off") {
            this._loader.add(`still${still}`, `${assetUrl}/images/event/still/${still}.jpg`);
        }
        if (stillType && stillId && !this._loader.resources[`still${stillType}${stillId}`]) {
            this._loader.add(`still${stillType}${stillId}`, `${assetUrl}/images/content/${stillType}/card/${stillId}.jpg`);
        }

        this.forward();
        this.loadAssetsByTrack();
    }

    _renderTrack() {
        if (this._stopped || this._selecting) { return; }
        console.log(`${this._current}/${this._tracks.length - 1}`, this.currentTrack);

        if (this.currentTrack.label == "end") {
            this.endOfEvent();
            return;
        }

        const { speaker, text, textCtrl, textWait, textFrame,
            bg, bgEffect, bgEffectTime, fg, fgEffect, fgEffectTime, bgm, se, voice, voiceKeep, lip, select, nextLabel, stillId, stillCtrl, still, stillType, movie,
            charSpine, charLabel, charId, charCategory, charPosition, charScale, charAnim1, charAnim2, charAnim3, charAnim4, charAnim5,
            charAnim1Loop, charAnim2Loop, charAnim3Loop, charAnim4Loop, charAnim5Loop, charLipAnim, lipAnimDuration, charEffect,
            effectLabel, effectTarget, effectValue, waitType, waitTime, translated_text } = this.currentTrack;

        this._bgManager.processBgByInput(bg, bgEffect, bgEffectTime, this._fastForwardMode);
        this._fgManager.processFgByInput(fg, fgEffect, fgEffectTime, this._fastForwardMode);
        this._movieManager.processMovieByInput(movie, this._renderTrack.bind(this), this._fastForwardMode);
        this._textManager.processTextFrameByInput(textFrame, speaker, text, translated_text, this._fastForwardMode);
        this._selectManager.processSelectByInput(select, nextLabel, this._jumpTo.bind(this), this._afterSelection.bind(this), translated_text, this._fastForwardMode);
        this._stillManager.processStillByInput(still, stillType, stillId, stillCtrl, this._fastForwardMode);
        this._soundManager.processSoundByInput(bgm, se, voice, charLabel, this._spineManager.stopLipAnimation.bind(this._spineManager), this._fastForwardMode);
        this._spineManager.processSpineByInput(charLabel, charId, charCategory, charPosition, charScale, charAnim1, charAnim2, charAnim3, charAnim4, charAnim5,
            charAnim1Loop, charAnim2Loop, charAnim3Loop, charAnim4Loop, charAnim5Loop, charLipAnim, lipAnimDuration, charEffect, this._fastForwardMode);
        this._effectManager.processEffectByInput(effectLabel, effectTarget, effectValue, this._fastForwardMode);

        if (nextLabel == "end") { // will be handled at forward();
            this._nextLabel = "end";
        }

        this.forward();

        if (this._current - 1 == this._stopTrackIndex) { // do nothing and wait
            return;
        }
        else if (select && !textCtrl) { // turn app.stage interactive off, in case selection is appeared on stage
            this._app.stage.interactive = false;
            this._renderTrack();
        }
        else if (select && textCtrl) { // do nothing, waiting for selection
            this._app.stage.interactive = false;
            this._selecting = true;
        }
        else if (text && this.autoplay && !waitType) {
            this._textTypingEffect = this._textManager.typingEffect;
            // this._loader.resources['managerSound'].sound.stop()
            if (voice) { // here to add autoplay for both text and voice condition
                const voiceTimeout = this._soundManager.voiceDuration;
                this._timeoutToClear = setTimeout(() => {
                    if (!this.autoplay) { return; }
                    clearTimeout(this._timeoutToClear);
                    this._timeoutToClear = null;
                    this._renderTrack();
                }, voiceTimeout);
            }
            else { // here to add autoplay for only text condition
                const textTimeout = this._textManager.textWaitTime;
                this._timeoutToClear = setTimeout(() => {
                    if (!this.autoplay) { return; }
                    clearTimeout(this._timeoutToClear);
                    this._timeoutToClear = null;
                    this._renderTrack();
                }, textTimeout);
            }
        }
        else if (text && !this.autoplay && !waitType) {
            return;
        }
        else if (movie) {
            if (this._fastForwardMode) {
                this._renderTrack();
                return;
            }
            else { return; }
        }
        else if (waitType == "time") { // should be modified, add touch event to progress, not always timeout
            if (this._fastForwardMode) {
                this._renderTrack();
            }
            else {
                this._timeoutToClear = setTimeout(() => {
                    clearTimeout(this._timeoutToClear);
                    this._timeoutToClear = null;
                    this._renderTrack();
                }, waitTime);
            }
        }
        else if (waitType == "effect") {
            if (this._fastForwardMode) {
                this._renderTrack();
            }
            else {
                this._timeoutToClear = setTimeout(() => {
                    clearTimeout(this._timeoutToClear);
                    this._timeoutToClear = null;
                    this._renderTrack();
                }, effectValue.time);
            }
        }
        else {
            this._renderTrack();
        }
    }

    endOfEvent(clear = true) {
        this._bgManager.reset(clear);
        this._fgManager.reset(clear);
        this._spineManager.reset(clear);
        this._textManager.reset(clear);
        this._selectManager.reset(clear);
        this._soundManager.reset();
        this._effectManager.reset(clear);
        this._movieManager.reset();
        this._stillManager.reset(clear);
        this._stopped = clear;
        this._current = 0;
        this._nextLabel = null;
        this._app.stage.interactive = true;
        this._selecting = false;
        this.resetStopTrack();
    }

    toggleAutoplay() {
        this._autoPlayEnabled = !this._autoPlayEnabled;
    }

    toggleLangDisplay() {
        this._translateLang = (this._translateLang + 1) % 2;
        this._textManager.toggleLanguage(this._translateLang);
        this._selectManager.toggleLanguage(this._translateLang);
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

    _jumpToFrame(frame) {
        this._current = frame;
    }

    _afterSelection() {
        this._app.stage.interactive = true;
        this._selecting = false;
        this._renderTrack();
    }
}
