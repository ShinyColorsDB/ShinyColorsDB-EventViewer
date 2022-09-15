class SpineManager {
    constructor() {
        this._container = new PIXI.Container();
        this._loader = PIXI.Loader.shared;
        this._spineMap = new Map();
        this._lastUsedSpine = null;
        this.LOOP_EVENT_NAME = "loop_start";
        this.RELAY_EVENT_NAME = 'relay';
        this.LIP_EVENT_NAME = 'lip';
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
            this._spineMap.get(charLabel).alpha = 1;
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
            this._container.setChildIndex(thisSpine, this._container.children.length <= charPosition.order ? this._container.children.length - 1 : charPosition.order);
        }

        if (charScale) {
            thisSpine.scale = charScale;
        }

        if (charEffect) {
            Utilities.fadingEffect(thisSpine, charEffect);
        }

        this._setCharacterAnimation(charAnim1, charAnim1Loop, 0, thisSpine);
        this._setCharacterAnimation(charAnim2, charAnim2Loop, 1, thisSpine);
        this._setCharacterAnimation(charAnim3, charAnim3Loop, 2, thisSpine);
        this._setCharacterAnimation(charAnim4, charAnim4Loop, 3, thisSpine);
        this._setCharacterAnimation(charAnim5, charAnim5Loop, 4, thisSpine);
        this._setCharacterAnimation(charLipAnim, true, 5, thisSpine, true);

        thisSpine.skeleton.setToSetupPose();
        thisSpine.update(0);
        thisSpine.autoUpdate = true;

    }

    stopLipAnimation(charLabel) {
        if (!this._spineMap.has(charLabel)) { return; }
        //this._spineMap.get(charLabel).state.tracks[5].time = 0;
        this._spineMap.get(charLabel).state.clearTrack(5);
    }

    _setCharacterAnimation(charAnim, charAnimLoop, trackNo, thisSpine, lipDebug = false) {
        if (!charAnim) { return; }
        let trackEntry = undefined, relayAnim = undefined;

        const animation = this._getAnimation(charAnim, thisSpine);

        const eventTimeline = animation.timelines.find(timeline => timeline.events);

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

        const before = thisSpine.state.getCurrent(trackNo);
        const beforeAnim = before ? before.animation.name : null;

        if (beforeAnim) {
            const beforeEventTimeline = this._getAnimation(beforeAnim, thisSpine).timelines.find(timeline => timeline.events);
            if (beforeEventTimeline) {
                const relayAnimEvent = beforeEventTimeline.events.find((event) => event.data.name === this.RELAY_EVENT_NAME);
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

        const listener = {
            complete: () => {
                const currentAnim = thisSpine.state.getCurrent(trackNo);
                const currentAnimName = currentAnim ? currentAnim.animation.name : null;
                if ((!loopStartTime || charAnim !== currentAnimName) && !lipDebug) {
                    return;
                }
                let trackEntry = thisSpine.state.setAnimation(trackNo, charAnim);
                trackEntry.listener = listener;
                trackEntry.time = loopStartTime;
                /*
                if (!lipDebug) {
                    let trackEntry = thisSpine.state.setAnimation(trackNo, charAnim);
                    trackEntry.listener = listener;
                    trackEntry.time = loopStartTime;
                }
                else {
                    console.log(thisSpine);
                    thisSpine.state.setAnimation(trackNo, charAnim, true);
                }
                */
            }
        };

        trackEntry.listener = listener;
        return trackEntry;

        //thisSpine.state.setAnimation(trackNo, charAnim, charAnimLoop === false ? charAnimLoop : true);
    }

    _getAnimation(charAnim, thisSpine) {
        const animation = thisSpine.spineData.animations.find((a) => a.name === charAnim);
        if (!animation) {
            throw new Error(`${charAnim} is not found in spineData`);
        }
        return animation;
    }
}
