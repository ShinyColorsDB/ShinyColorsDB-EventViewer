'use strict';

function init() {
    let app = new PIXI.Application({
        width: 1136,
        height: 640
    });

    document.body.appendChild(app.view);

    const tm = new TrackManager(app);
    tm.addToStage();

    app.loader.add("eventJson", `${assetUrl}/json/produce_events/300101101.json`).load(
        (loader, resources) => {
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