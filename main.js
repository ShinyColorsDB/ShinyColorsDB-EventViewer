'use strict';
let ratio = 1.775;

function init() {
    let app = new PIXI.Application({
        width: 1136,
        height: 640
    });

    document.body.appendChild(app.view);

    const tm = new TrackManager(app);
    tm.addToStage();

    app.loader.add("eventJson", `${assetUrlPath}/json/produce_events/300101101.json`).load(
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
                
            }, {once: true});

            tm.setTrack = resources.eventJson.data;
        }
    );
}
// fuck google chrome no music before user click,

//
/*
function draw(loader, resources) {
    let spr = new PIXI.Sprite(resources[eventObj[currentSection].bg].texture);
    spr.x = cw / 2;
    spr.y = ch / 2;

    resizeByRatio(spr);

    spr.anchor.x = 0.5;
    spr.anchor.y = 0.5;
    app.stage.addChild(spr);

}

function resizeByRatio(spr) {
    let ratioW = cw / spr.width, ratioH = ch / spr.height;
    //console.log(ratioW, ratioH);
    if (ratioW > ratioH) {
        spr.scale.x = ratioH;
        spr.scale.y = ratioH;
    }
    else {
        spr.scale.x = ratioW;
        spr.scale.y = ratioW;
    }
}
*/

