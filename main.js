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

    app.loader.add("eventJson", `${assetUrl}/json/produce_events/${eventId}.json`).load(
        (loader, resources) => {
            if (resources.eventJson.error) { alert("No such event."); return; }
            document.body.addEventListener('click', (e) => {
                tm.loadCurrentTrackAssets();

                app.stage.interactive = true;
                app.stage.on('click', (ev) => {
                    console.log(ev);
                    if (tm._timeoutToClear) {
                        clearTimeout(tm._timeoutToClear);
                    }

                    tm.loadCurrentTrackAssets();
                });

            }, { once: true });

            tm.setTrack = resources.eventJson.data;
        }
    );
}
// fuck google chrome no music before user click,