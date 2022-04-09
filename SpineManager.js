class SpineManager {
    constructor() {
        this._container = new PIXI.Container();
        this._loader = PIXI.Loader.shared;
        this._spineMap = new Map();
        this._lastUsedSpine = null;
        this.LOOP_EVENT_NAME = "loop_start";
        this.RELAY_EVENT_NAME = 'relay';
        this.ANIMATION_MIX = 0.3;

        this.spineAlias = {
            stand_fix: 'stand',
            stand_costume_fix: 'stand_costume',

            stand_flex: 'stand',
            stand_costume_flex: 'stand_costume'
        };
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
            thisSpine.position.set(charPosition.x, charPosition.y);
            this._container.addChild(thisSpine);
            this._container.setChildIndex(thisSpine, this._container.children.length < charPosition.order ? charPosition.order : this._container.children.length - 1);
        }

        if (charScale) {
            thisSpine.scale = charScale;
        }

        if (charEffect) {
            switch (charEffect.type) {
                case "from":
                    thisSpine.alpha = charEffect.alpha;
                    let fromInterval = setInterval(() => {
                        thisSpine.alpha = ((thisSpine.alpha * 100) + ((1 / (charEffect.time / 10)) * 100)) / 100;
                    }, 10);
                    setTimeout(() => {
                        clearInterval(fromInterval);
                        thisSpine.alpha = 1;
                    }, charEffect.time);
                    break;
                case "to":
                    let toInterval = setInterval(() => {
                        thisSpine.alpha = ((thisSpine.alpha * 100) - ((1 / (charEffect.time / 10)) * 100)) / 100;
                    }, 10);
                    setTimeout(() => {
                        clearInterval(toInterval);
                        thisSpine.alpha = charEffect.alpha;
                    }, charEffect.time);
                    break;
            }
        }

        this._setCharacterAnimation(charAnim1, charAnim1Loop, 0, thisSpine);
        this._setCharacterAnimation(charAnim2, charAnim2Loop, 1, thisSpine);
        this._setCharacterAnimation(charAnim3, charAnim3Loop, 2, thisSpine);
        this._setCharacterAnimation(charAnim4, charAnim4Loop, 3, thisSpine);
        this._setCharacterAnimation(charAnim5, charAnim5Loop, 4, thisSpine);
        this._setCharacterAnimation(charLipAnim, true, 5, thisSpine);

        thisSpine.skeleton.setToSetupPose();
        thisSpine.update(0);
        thisSpine.autoUpdate = true;

    }

    stopLipAnimation(charLabel) {
        if (!this._spineMap.has(charLabel)) { return; }
        this._spineMap.get(charLabel).state.tracks[5].loop = false;
    }

    _setCharacterAnimation(charAnim, charAnimLoop, trackNo, thisSpine) {
        if (!charAnim) { return; }
        let trackEntry = undefined, relayAnim = undefined;

        let animation = this._getAnimation(charAnim, thisSpine);

        let eventTimeline = animation.timelines.find(function (timeline) {
            return timeline.events;
        });

        let loopStartTime = null;
        if (eventTimeline) {
            eventTimeline.events.forEach((event) => {
                switch (event.data.name) {
                    case this.LOOP_EVENT_NAME:
                        loopStartTime = event.time;
                        break;
                    case this.LIP_EVENT_NAME:
                        this._lipAnim = event.stringValue;
                        break;
                    default:
                        break;
                }
            });
        }

        if (loopStartTime) {
            charAnimLoop = false;
        }

        let before = thisSpine.state.getCurrent(trackNo);
        let beforeAnim = before ? before.animation.name : null;

        if (beforeAnim) {
            let beforeEventTimeline = this._getAnimation(beforeAnim, thisSpine).timelines.find(function (timeline) {
                return timeline.events;
            });
            if (beforeEventTimeline) {
                let relayAnimEvent = beforeEventTimeline.events.find((event) => {
                    return event.data.name === this.RELAY_EVENT_NAME;
                });
                if (relayAnimEvent) {
                    relayAnim = relayAnimEvent.stringValue;
                }
            }
        }

        if (relayAnim) {
            if (beforeAnim) {
                thisSpine.stateData.setMix(beforeAnim, relayAnim, this.ANIMATION_MIX);
            }
            thisSpine.stateData.setMix(relayAnim, charAnim, this.ANIMATION_MIX);
            thisSpine.state.setAnimation(trackNo, relayAnim, false);
            trackEntry = thisSpine.state.addAnimation(trackNo, charAnim, charAnimLoop);
        } else {
            if (beforeAnim) {
                thisSpine.stateData.setMix(beforeAnim, charAnim, this.ANIMATION_MIX);
            }
            trackEntry = thisSpine.state.setAnimation(trackNo, charAnim, charAnimLoop);
        }

        let listener = {
            complete: function () {
                let currentAnim = thisSpine.state.getCurrent(trackNo);
                let currentAnimName = currentAnim ? currentAnim.animation.name : null;
                if (!loopStartTime || charAnim !== currentAnimName) {
                    return;
                }
                let trackEntry = thisSpine.state.setAnimation(trackNo, charAnim);
                trackEntry.listener = listener;
                trackEntry.time = loopStartTime;
            }
        };

        trackEntry.listener = listener;
        return trackEntry;

        //thisSpine.state.setAnimation(trackNo, charAnim, charAnimLoop === false ? charAnimLoop : true);
    }

    _getAnimation(charAnim, thisSpine) {
        let animation = thisSpine.spineData.animations.find((a) => {
            return a.name === charAnim;
        });

        if (!animation) {
            throw new Error(`${charAnim} is not found in spineData`);
        }

        return animation;
    }
}