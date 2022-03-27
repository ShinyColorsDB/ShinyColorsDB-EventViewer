'use strict';
class TextManager {
    constructor() {
        this._container = new PIXI.Container();
        this._loader = PIXI.Loader.shared;
        this._txtFrameMap = new Map();
    }

    get stageObj() {
        return this._container;
    }

    processTextFrameByInput(textFrame, speaker, text) {
        if (this._container.children.length) {
            this._container.removeChildren(0, this._container.children.length);
        }

        if (textFrame == "off" || !textFrame) { return; }

        if (!this._txtFrameMap.has(textFrame)) {
            this._txtFrameMap.set(textFrame, new PIXI.Sprite(this._loader.resources[textFrame].texture));
        }

        let thisTextFrame = this._txtFrameMap.get(textFrame);
        thisTextFrame.position.x = 100;
        thisTextFrame.position.y = 450;
        this._container.addChildAt(thisTextFrame, 0);

        let speakerObj = new PIXI.Text(speaker, {fontFamily: 'primula-HummingStd-E', fontSize: 24, fill: 0x000000, align: 'center'});
        this._container.addChildAt(speakerObj, 1);
        speakerObj.position.x = 260;
        speakerObj.position.y = 465;

        let textObj = new PIXI.Text(text, {fontFamily: 'primula-HummingStd-E', fontSize: 24, fill: 0x000000, align: 'center'});
        this._container.addChildAt(textObj, 2);
        textObj.position.x = 240;
        textObj.position.y = 505;
    }
}
