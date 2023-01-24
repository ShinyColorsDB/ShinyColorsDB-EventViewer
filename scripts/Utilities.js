class Utilities {
    /**
     * @param {PIXIObject} pixiObj
     * @param {{type: fromTo,alpha: targetValue, time: effectLastingTime, easing: easingType}} effectValue
    **/
    static fadingEffect(pixiObj, effectValue) {

        const thisEffect = this._getFromTo(effectValue.type);
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
            default:
                return Power0.easeNone;
        }
    }
}
