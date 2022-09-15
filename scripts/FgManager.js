class FgManager {
    constructor() {
        this._container = new PIXI.Container();
        this._fgMap = new Map();
        this._loader = PIXI.Loader.shared;
        this._currentFg = null;
    }

    get stageObj() {
        return this._container;
    }

    reset() {
        this._container.removeChildren(0, this._container.children.length);
        this._fgMap.clear();
    }

    processFgByInput(fg, fgEffect, fgEffectTime) {
        if (fg == "off") {
            if (this._container.children.length) {
                this._container.removeChildren(0, this._container.children.length);
            }
        }
        else if (fg == "fade_out") {
            this._fadeOutFg();
        }
        else if (fg && fgEffect) {
            this._changeFgByEffect(fg, fgEffect, fgEffectTime);
        }
        else if (fg && !fgEffect) {
            this._changeFg(fg, 0, 1);
        }
    }

    _changeFg(fgName, order, alphaValue) {
        if (!this._fgMap.has(fgName)) {
            this._fgMap.set(fgName, new PIXI.Sprite(this._loader.resources[`fg${fgName}`].texture));
        }
        this._currentFg = this._fgMap.get(fgName);
        this._currentFg.alpha = alphaValue;

        if (this._container.children.length != 0 && order == 0) {
            this._container.removeChildAt(order);
        }

        this._container.addChildAt(this._fgMap.get(fgName), order > this._container.children.length ? this._container.children.length : order);
    }

    _changeFgByEffect(fgName, fgEffect, fgEffectTime) {
        switch (fgEffect) {
            case "fade":
                this._changeFg(fgName, 1, 0);
                let newOrder = this._container.children.length == 1 ? 0 : 1;
                let origFg = this._container.getChildAt(0), newFg = this._container.getChildAt(newOrder);
                let k = setInterval(() => {
                    if (newOrder) {
                        origFg.alpha -= 0.01;
                    }
                    newFg.alpha += 0.01;
                }, 10);
                setTimeout(() => {
                    clearInterval(k);
                    if (newOrder) {
                        origFg.alpha = 0;
                    }
                    newFg.alpha = 1;
                }, fgEffectTime ? fgEffectTime : 1000);
                this._container.removeChildAt(0);

                break;
            case "mask":
                break;
        }
    }

    _fadeOutFg() {
        Utilities.fadingEffect(this._currentFg, { alpha: 0, time: 1000, type: 'to' });
    }
}
