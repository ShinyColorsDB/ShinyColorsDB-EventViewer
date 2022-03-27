class SpineManager {
    constructor() {
        this._container = new PIXI.Container();
        this._loader = PIXI.Loader.shared;
        this._spineMap = new Map();
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
        }

        let thisSpine = this._spineMap.get(charLabel);
        console.log(thisSpine);

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

        if (charAnim1 || charAnim2 || charAnim3 || charAnim4 || charAnim5 || charLipAnim) {
            this._setSpineTrack(charAnim1, charAnim1Loop, 0, thisSpine);
            this._setSpineTrack(charAnim2, charAnim2Loop, 1, thisSpine);
            this._setSpineTrack(charAnim3, charAnim3Loop, 2, thisSpine);
            this._setSpineTrack(charAnim4, charAnim4Loop, 3, thisSpine);
            this._setSpineTrack(charAnim5, charAnim5Loop, 4, thisSpine);
            this._setSpineTrack(charLipAnim, false, 5, thisSpine);
        }

        thisSpine.skeleton.setToSetupPose();
        thisSpine.update(0);
        thisSpine.autoUpdate = true;


    }

    _setSpineTrack(charAnim, charAnimLoop, trackNo, thisSpine) {
        if (!charAnim) {
            thisSpine.state.clearTrack(trackNo);
            return;
        }

        thisSpine.state.setAnimation(trackNo, charAnim, charAnimLoop);
    }
}