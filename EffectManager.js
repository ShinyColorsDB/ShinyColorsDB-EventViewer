class EffectManager {
    constructor() {
        this._container = new PIXI.Container();
        this._effectMap = new Map();
        this._loader = PIXI.Loader.shared;
    }

    get stageObj() { 
        return this._container; 
    }

    reset() {
        this._container.removeChildren(0, this._container.children.length);
        this._effectMap.clear();
    }

    processEffectByInput(effectLabel, effectTarget, effectValue) {
        if (!effectLabel) { return; }
        if (!this._effectMap.has(effectLabel)) {
            let thisEffect = null;
            switch (effectTarget.type) {
                case "rect":
                    thisEffect = new PIXI.Graphics();
                    thisEffect.beginFill(Number(`0x${effectTarget.color}`));
                    thisEffect.drawRect(0, 0, effectTarget.width, effectTarget.height);
                    thisEffect.endFill();
                    break;
                
            }
            this._effectMap.set(effectLabel, thisEffect);
        }

        let thisEffect = this._effectMap.get(effectLabel);
    }
}