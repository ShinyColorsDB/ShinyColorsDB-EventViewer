'use strict';
class FgManager {
    constructor() {
        this._container = new PIXI.Container();
        this._fgMap = new Map();
        this._loader = PIXI.Loader.shared;
    }

    get stageObj() { return this._container; }

    reset() {
        this._container.removeChildren(0, this._container.children.length);
        this._fgMap.clear();
    }

    processFgByInput(fg, fgEffect) {
        if (fg && fgEffect) {
            this._changeFgByEffect(fg, fgEffect);
        }
        else if (fg && !fgEffect) {
            this._changeFg(fg);
        }
    }

    _changeFg(fgName) {
        if (!this._fgMap.has(fgName)) {
            this._fgMap.set(fgName, new PIXI.Sprite(this._loader.resources[fgName].texture));
        }

        this._container.addChildAt(this._fgMap.get(fgName), 0);
    }

    _changeFgByEffect(fgName, fgEffect) {

    }
}