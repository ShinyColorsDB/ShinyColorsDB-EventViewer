class SoundManager {
    constructor() {
        this._loader = PIXI.Loader.shared;
        this._currentBgm = null;
        this._currentVoice = null;
        this._currentSe = null;
        this._onVoiceEnd = null;
        this._voiceDuration = 0;

        PIXI.sound.volumeAll = 0.1;
    }

    get voiceDuration() {
        return this._voiceDuration;
    }

    reset() {
        if (this._currentVoice) {
            this._currentVoice.stop();
            this._currentVoice = null;
        }
        if (this._currentBgm) {
            this._currentBgm.stop();
            this._currentBgm = null;
        }
        if (this._currentSe) {
            this._currentSe.stop();
            this._currentSe = null;
        }
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
        if (bgmName == "fade_out") {
            TweenMax.to(this._currentBgm, 0, { volume: 0 });
            return;
        }
        if (this._currentBgm) { this._currentBgm.stop(); }
        if (bgmName == "off") { return; }

        this._currentBgm = this._loader.resources[`bgm${bgmName}`].sound;
        this._currentBgm.autoPlay = true;
        this._currentBgm.play({
            loop: true,
            singleInstance: true
        });
        this._currentBgm.volume = 0.3;
    }

    _playSe(seName) {
        this._currentSe = this._loader.resources[`se${seName}`].sound.play({
            loop: false
        });
    }

    _playVoice(voiceName, charLabel, onVoiceEnd) {
        this._voiceDuration = 0;
        if (this._currentVoice) {
            this._currentVoice.stop();
            this._onVoiceEnd();
        }

        this._currentVoice = this._loader.resources[`voice${voiceName}`].sound.play({
            loop: false
        });

        this._voiceDuration = (this._currentVoice._duration) * 1000 + 1000;

        this._onVoiceEnd = () => {
            onVoiceEnd(charLabel);
        };
        this._currentVoice.on('end', () => {
            this._onVoiceEnd();
        });
    }
}
