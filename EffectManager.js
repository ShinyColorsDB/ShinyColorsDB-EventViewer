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
                    thisEffect.alpha = 0;
                    this._container.addChild(thisEffect);
                    break;

            }
            this._effectMap.set(effectLabel, thisEffect);
        }

        let thisEffect = this._effectMap.get(effectLabel);
        let passedTime = 0;

        switch (effectValue.type) {
            case "from":
                thisEffect.alpha = effectValue.alpha;
                let thisFromInterval = setInterval(() => {
                    passedTime += 10;
                    thisEffect.alpha = this._effectEasing(effectValue.easing, passedTime / effectValue.time);
                }, 10);
                setTimeout(() => {
                    clearInterval(thisFromInterval);
                    thisEffect.alpha = 1;
                }, effectValue.time);
                break;
            case "to":
                thisEffect.alpha = 1;
                let thisToInterval = setInterval(() => {
                    passedTime += 10;
                    thisEffect.alpha = 1 - this._effectEasing(effectValue.easing, passedTime / effectValue.time);
                }, 10);
                setTimeout(() => {
                    clearInterval(thisToInterval);
                    thisEffect.alpha = effectValue.alpha;
                }, effectValue.time);
                break;
        }
    }

    _effectEasing(easing, passedTime) {
        switch (easing) {
            case "easeOutQuart":
                return 1 - Math.pow(1 - passedTime, 4);

            case "easeInQuart":
                return Math.pow(passedTime, 4);
                
        }
    }
}