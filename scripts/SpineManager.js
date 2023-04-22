class SpineManager {
    constructor() {
        this._container = new PIXI.Container();
        this._loader = PIXI.Loader.shared;
        this._spineMap = new Map();
        this._keepsLipAnimation = false;
        this._replacingLipTrack = null;
        this._timeoutToClear = null;
        this.LOOP_EVENT_NAME = "loop_start";
        this.RELAY_EVENT_NAME = 'relay';
        this.LIP_EVENT_NAME = 'lip';
        this.ANIMATION_MIX = 0.3;

        this.spineAlias = {
            stand_fix: 'stand',
            stand_costume_fix: 'stand_costume',

            stand_flex: 'stand',
            stand_costume_flex: 'stand_costume',

            stand: 'stand',
            stand_costume: 'stand_costume',

            stand_jersey: 'stand_jersey',
        };

        this._currSpine = {};
    }

    get stageObj() {
        return this._container;
    }

    reset() {
        this._container.removeChildren(0, this._container.children.length);
        this._spineMap.clear();
        this._currSpine = {};
    }

    processSpineByInput(charLabel, charId, charCategory, charPosition, charScale, charAnim1, charAnim2, charAnim3, charAnim4, charAnim5,
        charAnim1Loop, charAnim2Loop, charAnim3Loop, charAnim4Loop, charAnim5Loop, charLipAnim, lipAnimDuration, charEffect, isFastForward) {
        if (!charLabel) { return; }
        if (charId) {
            this._currSpine[charLabel] = {
                currCharId: charId,
                currCharCategory: this.spineAlias[charCategory] ?? 'stand'
            };
        }
        let { currCharId, currCharCategory } = this._currSpine[charLabel];
        let char_uid = `${charLabel}_${currCharId}_${currCharCategory}`;
        if (!this._spineMap.has(char_uid)) {
            this._spineMap.set(char_uid, new PIXI.spine.Spine(this._loader.resources[char_uid].spineData));
            this._spineMap.get(char_uid).alpha = 1;
            this._container.addChild(this._spineMap.get(char_uid));
        }

        charAnim1Loop = charAnim1Loop === undefined ? true : charAnim1Loop;
        charAnim2Loop = charAnim2Loop === undefined ? true : charAnim2Loop;
        charAnim3Loop = charAnim3Loop === undefined ? true : charAnim3Loop;
        charAnim4Loop = charAnim4Loop === undefined ? true : charAnim4Loop;
        charAnim5Loop = charAnim5Loop === undefined ? true : charAnim5Loop;
        charLipAnim = charLipAnim === undefined ? false : charLipAnim;

        let thisSpine = this._spineMap.get(char_uid);

        try {
            thisSpine.skeleton.setSkinByName('normal');
        }
        catch {
            thisSpine.skeleton.setSkinByName('default');
        }

        if (charPosition) {
            thisSpine.position.set(charPosition.x, charPosition.y);
            this._container.setChildIndex(thisSpine, this._container.children.length <= charPosition.order ? this._container.children.length - 1 : charPosition.order);
        }

        if (charScale) {
            thisSpine.scale = charScale;
        }

        if (charEffect) {
            if (charEffect.type == "from") { thisSpine.alpha = 1; }
            if (charEffect?.x) { charEffect.x += thisSpine.x; }
            if (charEffect?.y) { charEffect.y += thisSpine.y; }
            if (isFastForward) { charEffect.time = 50; }
            Utilities.fadingEffect(thisSpine, charEffect);
        }

        if (charAnim1) {
            this._setCharacterAnimation(charAnim1, charAnim1Loop, 0, thisSpine);
        }

        if (charAnim2) {
            this._setCharacterAnimation(charAnim2, charAnim2Loop, 1, thisSpine);
        }

        if (charAnim3) {
            this._setCharacterAnimation(charAnim3, charAnim3Loop, 2, thisSpine);
        }

        if (charAnim4) {
            this._setCharacterAnimation(charAnim4, charAnim4Loop, 3, thisSpine);
        }

        if (charAnim5) {
            this._setCharacterAnimation(charAnim5, charAnim5Loop, 4, thisSpine);
        }

        if (charLipAnim && !isFastForward) {
            const trackEntry = this._setCharacterAnimation(charLipAnim, true, 5, thisSpine);
            if (lipAnimDuration) {
                this._timeoutToClear = setTimeout(() => {
                    if (trackEntry.trackIndex === 5) {
                        trackEntry.time = 0;
                        trackEntry.timeScale = 0;
                    }
                    if (this._replacingLipTrack && this._replacingLipTrack.trackIndex === TRACK_INDEXES.LIP_ANIM) {
                        this._replacingLipTrack.time = 0;
                        this._replacingLipTrack.timeScale = 0;
                    }

                    this._keepsLipAnimation = false;
                }, lipAnimDuration * 1000);
            }

            const isReplacingLipAnimation = !lipAnimDuration && this._keepsLipAnimation;
            if (isReplacingLipAnimation) {
                this._replacingLipTrack = trackEntry;
            }
            else {
                this._lipTrack = trackEntry;
            }
        }

        thisSpine.skeleton.setToSetupPose();
        thisSpine.update(0);
        thisSpine.autoUpdate = true;
    }

    stopLipAnimation(charLabel) {
        if (!this._currSpine[charLabel]) { return; }
        let { currCharId, currCharCategory } = this._currSpine[charLabel];
        let char_uid = `${charLabel}_${currCharId}_${currCharCategory}`;
        if (!this._spineMap.has(char_uid) || !this._spineMap.get(char_uid).state.tracks[5]) { return; }
        if (this._lipTrack && this._lipTrack.trackIndex === 5) {
            this._lipTrack.time = 0;
            this._lipTrack.timeScale = 0;
        }

        if (this._replacingLipTrack && this._replacingLipTrack.trackIndex === 5) {
            this._replacingLipTrack.time = 0;
            this._replacingLipTrack.timeScale = 0;
        }
    }

    _setCharacterAnimation(charAnim, charAnimLoop, trackNo, thisSpine) {
        if (!charAnim || !this._getAnimation(charAnim, thisSpine)) { return; }
        let trackEntry = undefined, relayAnim = undefined;

        const animation = this._getAnimation(charAnim, thisSpine);

        const eventTimeline = animation.timelines.find(function (timeline) {
            return timeline.events;
        });

        let loopStartTime = null, _this = this;
        if (eventTimeline) {
            eventTimeline.events.forEach(function (event) {
                switch (event.data.name) {
                    case _this.LOOP_EVENT_NAME:
                        loopStartTime = event.time;
                        break;
                    case _this.LIP_EVENT_NAME:
                        _this._lipAnim = event.stringValue;
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
            const beforeEventTimeline = this._getAnimation(beforeAnim, thisSpine).timelines.find(function (timeline) {
                return timeline.events;
            });
            if (beforeEventTimeline) {
                const relayAnimEvent = beforeEventTimeline.events.find(function (event) {
                    return event.data.name === _this.RELAY_EVENT_NAME;
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

        const listener = {
            complete: function complete() {
                const currentAnim = thisSpine.state.getCurrent(trackNo);
                const currentAnimName = currentAnim ? currentAnim.animation.name : null;
                if ((!loopStartTime || charAnim !== currentAnimName)) {
                    return;
                }
                let trackEntry = thisSpine.state.setAnimation(trackNo, charAnim);
                trackEntry.listener = listener;
                trackEntry.time = loopStartTime;
            }
        };

        trackEntry.listener = listener;
        return trackEntry;
    }

    _getAnimation(charAnim, thisSpine) {
        const animation = thisSpine.spineData.animations.find((a) => a.name === charAnim);
        if (!animation) {
            console.error(`${charAnim} is not found in spineData`);
        }
        return animation;
    }
}
