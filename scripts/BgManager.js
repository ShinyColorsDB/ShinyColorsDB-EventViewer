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

    processBgByInput(bg, bgEffect, bgEffectTime, isFastForward) {
        if (isFastForward) {
            this._insertNewBg(bg, 1, true);
        }
        else if (bg && bgEffect) {
            this._changeBgByEffect(bg, bgEffect, bgEffectTime);
        }
        else if (bg && !bgEffect) {
            this._insertNewBg(bg, 1, true);
        }
    }

    _insertNewBg(bgName, alphaValue, removeOld = false) {
        if (!this._bgMap.has(bgName)) {
            this._bgMap.set(bgName, new PIXI.Sprite(this._loader.resources[`bg${bgName}`].texture));
        }
        this._bgMap.get(bgName).alpha = alphaValue;

        if (removeOld && this._container.children.length != 0) {
            this._container.removeChildAt(0);
        }

        let order = this._container.children.length;
        this._container.addChildAt(this._bgMap.get(bgName), order);
    }

    _changeBgByEffect(bgName, effectName, bgEffectTime) {
        switch (effectName) {
            case "fade":
                this._insertNewBg(bgName, 0);
                let origBg, newBg;
                if (this._container.children.length == 1) {
                    newBg = this._container.getChildAt(0);
                }
                else {
                    origBg = this._container.getChildAt(0);
                    newBg = this._container.getChildAt(1);
                }

                if (this._container.children.length != 1) {
                    Utilities.fadingEffect(origBg, { alpha: 0, time: bgEffectTime ? bgEffectTime / 1000 : 1, ease: 'none', type: "to" });
                    setTimeout(() => {
                        if (this._container.children.length) {
                            this._container.removeChildAt(0);
                        }
                    }, bgEffectTime ? bgEffectTime : 1000);
                }
                Utilities.fadingEffect(newBg, { alpha: 1, time: bgEffectTime ? bgEffectTime : 1, ease: 'none', type: "to" });

                break;
            case "mask":
                break;
        }
    }
}
