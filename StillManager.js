class StillManager {
    constructor() {
        this._container = new PIXI.Container();
        this._stMap = new Map();
        this._loader = PIXI.Loader.shared;
    }

    get stageObj() {
        return this._container;
    }

    reset() {
        this._container.removeChildren(0, this._container.children.length);
        this._stMap.clear();
    }

    processStillByInput(still, stillType, stillId, stillCtrl) {
        if (stillType && stillId) {
            this._changeStillByType(stillType, stillId);
        }

        if (still) {
            this._changeStill(still);
        }

        if (stillCtrl) {
            this._control(stillCtrl);
        }
    }

    _changeStill(stillName) {
        if (!stillName) { return; }
        if (stillName == "off") {
            this._control(stillName);
            return;
        }

        this._removeStill();

        if (!this._stMap.has(stillName)) {
            this._stMap.set(stillName, new PIXI.Sprite(this._loader.resources[`still${stillName}`].texture));
        }

        const thisStill = this._stMap.get(stillName);

        this._container.addChild(thisStill);
    }

    _changeStillByType(stillType, stillId) {
        if (!stillType || !stillId) { return; }

        this._removeStill();

        if (!this._stMap.has(`${stillType}${stillId}`)) {
            this._stMap.set(`${stillType}${stillId}`, new PIXI.Sprite(this._loader.resources[`still${stillType}${stillId}`].texture));
        }

        const thisStill = this._stMap.get(`${stillType}${stillId}`);

        this._container.addChild(thisStill);
    }

    _control(stillCtrl) {
        if (!stillCtrl) { return; }

        switch (stillCtrl) {
            case "off":
                this._removeStill();
                break;
            case "on":
                break;
        }
    }

    _removeStill() {
        if (this._container.children.length) {
            this._container.removeChildAt(0);
        }
    }
}