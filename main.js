const eventObj = [
    {
        "textFrame": "off",
        "bg": "00266",
        "bgm": "037"
    },
    {
        "textFrame": "off",
        "waitType": "time",
        "waitTime": 3000
    },
    {
        "textFrame": "off",
        "bg": "00484",
        "bgEffect": "fade",
        "waitType": "time",
        "waitTime": 2500
    }
];

let test = [
    {name: "k4567", url: "https://i.imgur.com/qHSY3Pi.jpg"},
    {name: "k4568", url: "https://i.imgur.com/hoNafbQ.jpg"},
    {name: "k4569", url: "https://i.imgur.com/liTuL3U.jpg"},
]
const backgroundPath = "https://viewer.shinycolors.moe/images/event/bg/";
let currentSection = 0;
let ratio = 1.775;
let app, cw, ch;
let container, assetLoader;

function Init() {
    app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight
    });

    document.body.appendChild(app.view);
    cw = window.innerWidth;
    ch = window.innerHeight;
    console.log(cw, ch);
    window.onresize = function (e) {
        cw = window.innerWidth;
        ch = window.innerHeight;

        app.renderer.resize(cw, ch);

        app.stage.x = app.renderer.width * 0.5;
        app.stage.y = app.renderer.height * 0.5;
    };
    //setTimeout(drawCanvas, 0);
    app.loader.onComplete.add(() => {
        setTimeout(() => {
            for (let k = app.stage.children.length - 1; k >= 0; k--) {
                app.stage.removeChild(app.stage.children[k])
            }

            currentSection++;

            app.loader.reset();
            if (eventObj[currentSection]?.waitTime) {
                setTimeout(drawCanvas, eventObj[currentSection].waitTime);
            } else {
                setTimeout(drawCanvas, 1000);
            }
            
        }, 1000);
    });
    drawCanvas();
}

function drawCanvas() {
    console.log(currentSection);

    let ebj = eventObj[currentSection];

    if (currentSection < eventObj.length) {
        if (ebj?.bg) {
            app.loader.add(eventObj[currentSection].bg, backgroundPath + eventObj[currentSection].bg + ".jpg", { crossOrigin: true });
            app.loader.load(draw);

        }

        
    } else {
        return;
    }
}

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