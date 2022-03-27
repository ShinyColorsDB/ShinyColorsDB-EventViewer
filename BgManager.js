'use strict';
class BgManager {
    constructor() {
        this._container = new PIXI.Container();
        this._bgMap = new Map();
        this._loader = PIXI.Loader.shared;
    }

    get stageObj() { return this._container; }

    processBgByInput(bg, bgEffect) {
        if (bg && bgEffect) {
            this._changeBgByEffect(bg, bgEffect);
        }
        else if (bg && !bgEffect) {
            this._changeBg(bg);
        }
    }

    _changeBg(bgName, bgData = null) {
        if (!this._bgMap.has(bgName)) {
            this._bgMap.set(bgName, new PIXI.Sprite(this._loader.resources[bgName].texture));
        }

        this._container.addChildAt(this._bgMap.get(bgName), 0);
    }

    _changeBgByEffect(bgName, effectName) {

    }
}