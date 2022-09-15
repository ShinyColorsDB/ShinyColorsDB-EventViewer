class BgManager {
    constructor() {
        this._container = new PIXI.Container();
        this._bgMap = new Map();
        this._loader = PIXI.Loader.shared;
    }

    get stageObj() {
        return this._container;
    }

    reset() {
        this._container.removeChildren(0, this._container.children.length);
        this._bgMap.clear();
    }

    processBgByInput(bg, bgEffect, bgEffectTime) {
        if (bg && bgEffect) {
            this._changeBgByEffect(bg, bgEffect, bgEffectTime);
        }
        else if (bg && !bgEffect) {
            this._changeBg(bg, 0, 1);
        }
    }

    _changeBg(bgName, order, alphaValue) {
        if (!this._bgMap.has(bgName)) {
            this._bgMap.set(bgName, new PIXI.Sprite(this._loader.resources[`bg${bgName}`].texture));
        }
        this._bgMap.get(bgName).alpha = alphaValue;

        if (this._container.children.length != 0 && order == 0) {
            this._container.removeChildAt(order);
        }
        this._container.addChildAt(this._bgMap.get(bgName), order);
    }

    _changeBgByEffect(bgName, effectName, bgEffectTime) {
        switch (effectName) {
            case "fade":
                this._changeBg(bgName, 1, 0);
                let origBg = this._container.getChildAt(0), newBg = this._container.getChildAt(1);
                let k = setInterval(() => {
                    origBg.alpha -= 0.01;
                    newBg.alpha += 0.01;
                }, 10);
                setTimeout(() => {
                    clearInterval(k);
                    origBg.alpha = 0;
                    newBg.alpha = 1;
                }, bgEffectTime ? bgEffectTime : 1000);
                this._container.removeChildAt(0);

                break;
            case "mask":
                break;
        }
    }
}
