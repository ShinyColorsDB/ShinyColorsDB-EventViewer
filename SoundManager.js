class SoundManager {
    constructor() {
        this._loader = PIXI.Loader.shared;
        this._currentBgm = null;
        this._currentVoice = null;
        this._onVoiceEnd = null;
    }
	

    processSoundByInput(bgm, se, voice, charLabel, onVoiceEnd) {
        if (bgm) {
            this._playBgm(bgm);
        }

        if (se) {
            this._playSe(se);
        }

        if (voice) {
            this._playVoice(voice, charLabel, onVoiceEnd);
        }
    }

    _playBgm(bgmName) {        
        if (this._currentBgm) { this._currentBgm.stop(); }

        this._currentBgm = this._loader.resources[bgmName].sound;
        this._currentBgm.autoPlay = true;
        this._currentBgm.play({
            loop: true,
            singleInstance: true
        });
    }

    _playSe(seName) {
        this._loader.resources[seName].sound.play({
            loop: false
        });
    }

    _playVoice(voiceName, charLabel, onVoiceEnd) {
        if (this._currentVoice) { 
            this._currentVoice.stop(); 
            this._onVoiceEnd();
        }

        this._currentVoice = this._loader.resources[voiceName].sound.play({
            loop: false
        });
        this._onVoiceEnd = () => {
            onVoiceEnd(charLabel);
        };
        this._currentVoice.on('end', () => {
            this._onVoiceEnd();
        });
    }
}