class TextManager {
    constructor() {
        this._container = new PIXI.Container();
        this._loader = PIXI.Loader.shared;
        this._txtFrameMap = new Map();
        this._thisWaitTime = 0;
        this._typingEffect = null;
        this._languageType = 0
    }

    set languageType(type){
        this._languageType = type
    }

    get stageObj() {
        return this._container;
    }

    get textWaitTime() {
        return this._thisWaitTime;
    }

    get typingEffect() {
        return this._typingEffect;
    }

    reset() {
        this._container.removeChildren(0, this._container.children.length);
        this._txtFrameMap.clear();
        this._endNotification();
    }

    processTextFrameByInput(textFrame, speaker, text, trans) {
        this._thisWaitTime = 0;
        // let managerSound = this._loader.resources['managerSound'].sound;

        if (!textFrame || (textFrame == "off" && !this._container.children.length)) { return; }

        if (this._container.children.length) {
            this._container.removeChildren(0, this._container.children.length);
            if (textFrame == "off") { return; }
        }

        this._thisWaitTime = text.length * 300 + 500;

        if (!this._txtFrameMap.has(textFrame)) {
            this._txtFrameMap.set(textFrame, new PIXI.Sprite(this._loader.resources[`textFrame${textFrame}`].texture));
        }

        let thisTextFrame = this._txtFrameMap.get(textFrame);
        thisTextFrame.position.set(100, 450);
        this._container.addChildAt(thisTextFrame, 0);

        let noSpeaker = true;
        if (speaker !== "off") {
            noSpeaker = false;
            let speakerObj = new PIXI.Text(speaker, {
                fontFamily: usedFont,
                fontSize: 24,
                fill: 0x000000,
                align: 'center',
                padding: 3
            });
            this._container.addChildAt(speakerObj, 1);
            speakerObj.position.set(260, 468);
        }

        if(trans){
            let translate = trans.shift();
            if(translate['trans'] != ''){
                text = this._languageType === 1 ? translate['trans'] : text;
            }
        }

        let family = trans && this._languageType === 1 ? zhcnFont : usedFont;
        const textStyle = new PIXI.TextStyle({
            align: "left",
            fontFamily: family,
            fontSize: 24,
            padding: 3
        });

        let textObj = new PIXI.Text('', textStyle);
        this._container.addChildAt(textObj, noSpeaker ? 1 : 2);
        textObj.position.set(240, 510);

        let word_index = 0;
        if (this._typingEffect != null) {
            clearInterval(this._typingEffect);
        }
        this._typingEffect = setInterval(() => {
            if (word_index === text.length) {
                clearInterval(this._typingEffect);
                // managerSound.stop()
                this._typingEffect = null;
            }

            // if(!noSpeaker && speaker == 'プロデューサー'){
            //     managerSound.play()
            // }
            textObj.text += text.charAt(word_index);
            word_index += 1;
        }, 65);

    }

    _endNotification() {
        let owariObj = new PIXI.Text("End", {
            fontFamily: usedFont,
            fontSize: 40,
            fill: 0xffffff,
            align: 'center'
        });
        this._container.addChildAt(owariObj, 0);
        owariObj.anchor.set(0.5);
        owariObj.position.set(568, 320);
    }
}
