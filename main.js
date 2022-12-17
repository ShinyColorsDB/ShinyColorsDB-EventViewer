'use strict';

function getQueryVariable(name, defRet = null) {
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    const result = window.location.search.substring(1).match(reg);
    if (result != null) {
        return decodeURI(result[2]);
    } else {
        return defRet;
    }
}

function init() {
    const app = new PIXI.Application({
        width: 1136,
        height: 640
    });

    document.body.appendChild(app.view);

    resize(app);
    window.onresize = () => {
        resize(app);
    }

    const tm = new TrackManager(app);
    tm.addToStage();

    let eventId = getQueryVariable("eventId", null);
    let eventType = getQueryVariable("eventType", "produce_events");

    let jsonPath;
    if (eventId) {
        jsonPath = `${eventType}/${eventId}.json`;
    } else {
        jsonPath = prompt("input json path: ", "produce_events/202100711.json")
        eventId = jsonPath.split("/")[1].split(".")[0]
        eventType = jsonPath.split("/")[0]
        window.location.search = `eventType=${eventType}&eventId=${eventId}`
    }

    app.loader
        .add("eventJson", `${assetUrl}/json/${jsonPath}`)
        .add("touchToStart", "./assets/touchToStart.png")
        .add("autoOn", "./assets/autoOn.png")
        .add("autoOff", "./assets/autoOff.png")
        .load(
            (loader, resources) => {
                if (resources.eventJson.error) { alert("No such event."); return; }
                const touchToStart = new PIXI.Sprite(resources.touchToStart.texture);
                const autoOn = new PIXI.Sprite(resources.autoOn.texture),
                    autoOff = new PIXI.Sprite(resources.autoOff.texture);
                app.stage.addChild(touchToStart);
                touchToStart.anchor.set(0.5);
                touchToStart.position.set(568, 500);

                const nextTrack = function (e) {
                    if (tm._timeoutToClear) {
                        clearTimeout(tm._timeoutToClear);
                    }
                    tm._renderTrack();
                }

                const afterTouch = function () {
                    app.stage.interactive = true;
                    app.stage.removeChild(touchToStart);

                    tm.loadAssetsByTrack();

                    app.view.removeEventListener('click', afterTouch);
                    app.view.removeEventListener('touchstart', afterTouch);

                    app.stage.on('click', nextTrack);
                    app.stage.on('touchstart', nextTrack);
                }

                app.view.addEventListener('click', afterTouch);
                app.view.addEventListener('touchstart', afterTouch);

                tm.setTrack = resources.eventJson.data;
            }
        );
}

function resize(theApp) {
    const height = document.documentElement.clientHeight,
        width = document.documentElement.clientWidth;

    const ratioX = width / 1136,
        ratioY = height / 640;

    let resizedX, resizedY;

    if (ratioX > ratioY) {
        resizedX = 1136 * ratioY;
        resizedY = 640 * ratioY;
    } else {
        resizedX = 1136 * ratioX;
        resizedY = 640 * ratioX;
    }

    theApp.view.style.width = resizedX + 'px';
    theApp.view.style.height = resizedY + 'px';

    console.log(ratioX, ratioY);

}
// fuck google chrome no music before user click,
