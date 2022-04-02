class SpineManager {
    constructor() {
        this._container = new PIXI.Container();
        this._loader = PIXI.Loader.shared;
        this._spineMap = new Map();
        this._lastUsedSpine = null;
    }

    get stageObj() {
        return this._container;
    }

    reset() {
        this._container.removeChildren(0, this._container.children.length);
        this._spineMap.clear();
    }

    processSpineByInput(charLabel, charPosition, charScale, charAnim1, charAnim2, charAnim3, charAnim4, charAnim5,
        charAnim1Loop, charAnim2Loop, charAnim3Loop, charAnim4Loop, charAnim5Loop, charLipAnim, charEffect) {
        if (!charLabel) { return; }
        if (!this._spineMap.has(charLabel)) {
            this._spineMap.set(charLabel, new PIXI.spine.Spine(this._loader.resources[charLabel].spineData));
            this._spineMap.get(charLabel).alpha = 0;
        }

        let thisSpine = this._spineMap.get(charLabel);
        this._lastUsedSpine = thisSpine;

        try {
            thisSpine.skeleton.setSkinByName('normal');
        }
        catch {
            thisSpine.skeleton.setSkinByName('default');
        }

        if (charPosition) {
            thisSpine.position.x = charPosition.x;
            thisSpine.position.y = charPosition.y;
            this._container.addChildAt(thisSpine, charPosition.order);
        }

        if (charEffect) {
            switch (charEffect.type) {
                case "from":
                    thisSpine.alpha = charEffect.alpha;
                    let fromInterval = setInterval(() => {
                        thisSpine.alpha += 1 / (1000 / charEffect.time);
                    }, 1);
                    thisSpine.alpha = 1;
                    setTimeout(() => {
                        clearInterval(fromInterval);
                    }, charEffect.time);
                    break;
                case "to":
                    let delta = charEffect.alpha - thisSpine.alpha;
                    let toInterval = setInterval(() => {
                        thisSpine.alpha += delta / charEffect.time;
                    }, 1);
                    thisSpine.alpha = charEffect.alpha;
                    setTimeout(() => {
                        clearInterval(toInterval);
                    }, charEffect.time);
                    break;
            }
        }

        if (charAnim1 || charAnim2 || charAnim3 || charAnim4 || charAnim5 || charLipAnim) {
            this._setSpineTrack(charAnim1, charAnim1Loop, 0, thisSpine);
            this._setSpineTrack(charAnim2, charAnim2Loop, 1, thisSpine);
            this._setSpineTrack(charAnim3, charAnim3Loop, 2, thisSpine);
            this._setSpineTrack(charAnim4, charAnim4Loop, 3, thisSpine);
            this._setSpineTrack(charAnim5, charAnim5Loop, 4, thisSpine);
            this._setSpineTrack(charLipAnim, true, 5, thisSpine);
        }

        thisSpine.skeleton.setToSetupPose();
        thisSpine.update(0);
        thisSpine.autoUpdate = true;

    }

    stopLipAnimation(charLabel) {
        this._spineMap.get(charLabel).state.clearTrack(5);
    }

    _setSpineTrack(charAnim, charAnimLoop, trackNo, thisSpine) {
        if (!charAnim) {
            thisSpine.state.clearTrack(trackNo);
            return;
        }

        thisSpine.state.setAnimation(trackNo, charAnim, charAnimLoop);
    }

}