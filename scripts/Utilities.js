class Utilities {
    /**
     * @param {PIXIObject} pixiObj
     * @param {{type: fromTo,alpha: targetValue, time: effectLastingTime, ease: easingType}} effectValue
    **/
    static fadingEffect(pixiObj, effectValue) {

        const thisEffect = this._getFromTo(effectValue.type);
        delete effectValue.type;

        if (effectValue?.time) {
            effectValue.duration = effectValue.time / 1000;
            delete effectValue.time
        }
        if (!effectValue?.ease) {
            effectValue.ease = "easeInOutQuad";
        }
        else {
            effectValue.ease = this._getEasing(effectValue.ease);
        }
        thisEffect(pixiObj, effectValue);
    }

    static _getFromTo(fromto) {
        switch (fromto) {
            case "from":
                return TweenMax.from;
            case "to":
                return TweenMax.to;
        }
    }

    static _getEasing(easing) {
        switch (easing) {
            case "easeInOutQuad":
                return Quad.easeInOut;
            case "easeInQuad":
                return Quad.easeIn;
            case "easeOutQuad":
                return Quad.easeOut;
            case "none":
                return Power0.easeNone;
            default:
                return Quad.easeInOut;
        }
    }
}
