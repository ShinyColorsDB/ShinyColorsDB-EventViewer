'use strict';

function init() {
    const app = new PIXI.Application({
        width: 1136,
        height: 640
    });

    document.body.appendChild(app.view);

    const tm = new TrackManager(app);
    tm.addToStage();

    const eventId = window.location.search.match(/eventId\=(.*)/)?.length > 1 ? window.location.search.match(/eventId\=(.*)/)[1] : null;

    if (!eventId) {
        alert('Please specify EventId.');
        return;
    }

    app.loader
        .add("eventJson", `${assetUrl}/json/produce_events/${eventId}.json`)
        .add("touchToStart", "./touchToStart.png")
        .load(
            (loader, resources) => {
                if (resources.eventJson.error) { alert("No such event."); return; }
                const touchToStart = new PIXI.Sprite(resources.touchToStart.texture);
                app.stage.addChild(touchToStart);
                touchToStart.anchor.set(0.5);
                touchToStart.position.set(568, 500);

                const afterTouch = function () {
                    app.stage.interactive = true;
                    app.stage.removeChild(touchToStart);

                    tm.loadAssetsByTrack();

                    app.view.removeEventListener('click', afterTouch);
                    app.view.removeEventListener('touchstart', afterTouch);

                    app.stage.on('click', nextTrack);
                    app.stage.on('touchstart', nextTrack);

                }

                const nextTrack = function (e) {
                    if (tm._timeoutToClear) {
                        clearTimeout(tm._timeoutToClear);
                    }
                    tm._renderTrack();
                }

                app.view.addEventListener('click', afterTouch);
                app.view.addEventListener('touchstart', afterTouch);

                tm.setTrack = resources.eventJson.data;
            }
        );
}
// fuck google chrome no music before user click,