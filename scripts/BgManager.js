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

                Utilities.fadingEffect(origBg, { alpha: 0, time: bgEffectTime ? bgEffectTime : 1000, easing: 'none', type: "to" });
                Utilities.fadingEffect(newBg, { alpha: 1, time: bgEffectTime ? bgEffectTime : 1000, easing: 'none', type: "to" });

                setTimeout(() => {
                    this._container.removeChildAt(0);
                }, bgEffectTime ? bgEffectTime : 1000);

                break;
            case "mask":
                break;
        }
    }
}
