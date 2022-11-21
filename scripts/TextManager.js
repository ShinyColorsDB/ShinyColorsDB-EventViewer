class TextManager {
    constructor() {
        this._container = new PIXI.Container();
        this._loader = PIXI.Loader.shared;
        this._txtFrameMap = new Map();
    }

    get stageObj() {
        return this._container;
    }

    reset() {
        this._container.removeChildren(0, this._container.children.length);
        this._txtFrameMap.clear();
    }

    processTextFrameByInput(textFrame, speaker, text) {
        if (!textFrame || (textFrame == "off" && !this._container.children.length)) { return; }

        if (this._container.children.length) {
            this._container.removeChildren(0, this._container.children.length);
            if (textFrame == "off") { return; }
        }

        if (!this._txtFrameMap.has(textFrame)) {
            this._txtFrameMap.set(textFrame, new PIXI.Sprite(this._loader.resources[`textFrame${textFrame}`].texture));
        }

        let thisTextFrame = this._txtFrameMap.get(textFrame);
        thisTextFrame.position.set(100, 450);
        this._container.addChildAt(thisTextFrame, 0);

        if (speaker !== "off") {
            let speakerObj = new PIXI.Text(speaker, {
                fontFamily: 'Meiryo',
                fontSize: 24,
                fill: 0x000000,
                align: 'center'
            });
            this._container.addChildAt(speakerObj, 1);
            speakerObj.position.set(260, 470);
        }

        const textStyle = new PIXI.TextStyle({
            align: "left",
            fontFamily: "Meiryo",
            fontSize: 24
        });
        let textObj = new PIXI.Text(text, textStyle);
        this._container.addChildAt(textObj, 2);
        textObj.position.set(240, 510);
    }

    endNotification() {
        let owariObj = new PIXI.Text("End", {
            fontFamily: 'Meiryo',
            fontSize: 40,
            fill: 0xffffff,
            align: 'left'
        });
        this._container.addChildAt(owariObj, 0);
        owariObj.anchor.set(0.5);
        owariObj.position.set(568, 320);
    }
}
