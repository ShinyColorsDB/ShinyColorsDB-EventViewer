'use strict';

function init() {
    let app = new PIXI.Application({
        width: 1136,
        height: 640
    });

    document.body.appendChild(app.view);

    const tm = new TrackManager(app);
    tm.addToStage();

    const eventId = window.location.search.match(/eventId\=(.*)/)?.length > 1 ? window.location.search.match(/eventId\=(.*)/)[1] : null;

    if (!eventId || !eventId.match(/\d{9}/)) {
        alert('Url pattern is not correct.');
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

                    tm.loadCurrentTrackAssets();

                    app.view.removeEventListener('click', afterTouch);
                    app.view.removeEventListener('tap', afterTouch);

                    app.stage.on('click', nextTrack);
                    app.stage.on('tap', nextTrack);

                }

                const nextTrack = function (e) {
                    console.log(e);

                    if (tm._timeoutToClear) {
                        clearTimeout(tm._timeoutToClear);
                    }
                    tm.loadCurrentTrackAssets();
                }

                app.view.addEventListener('click', afterTouch);
                app.view.addEventListener('tap', afterTouch);
                
                tm.setTrack = resources.eventJson.data;
            }
        );
}
// fuck google chrome no music before user click,