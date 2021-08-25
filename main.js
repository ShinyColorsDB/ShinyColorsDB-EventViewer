const eventObj = [{
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

const backgroundPath = "T:/files/assets/images/event/bg/";
let currentSection = 0;
let ratio = 1.775;
//let renderer = PIXI.Application({ width: window.innerWidth, height: window.innerHeight });
let app, cw, ch;
let container, assetLoader;

function Init() {
    //container = new PIXI.Container();
    app = new PIXI.Application({
        width: window.innerWidth, 
        height: window.innerHeight
    });

    //container.x = app.screen.width / 2;
    //container.y = app.screen.height / 2;
    //app.stage.addChild(container);   
    document.body.appendChild(app.view);
    cw = window.innerWidth;
    ch = window.innerHeight;

    window.onresize = function (e) {
        cw = window.innerWidth;
        ch = window.innerHeight;

        app.renderer.resize(cw, ch);

        app.stage.x = app.renderer.width * 0.5;
        app.stage.y = app.renderer.height * 0.5;
    };
    //setTimeout(drawCanvas, 0);
    //drawCanvas();
    drawCanvas2();
}

function drawCanvas2() {
    let ebj = eventObj[0];
    //let loader = PIXI.Loader.shared;
    //loader.onComplete.add(draw);
    app.loader.add("mumi", "https://i.imgur.com/etjtA3w.png",{ crossOrigin: true }).load(draw);
    
}

function drawCanvas() {
    let ebj = eventObj[currentSection];

    if (currentSection < eventObj.length) {
        if (ebj?.bg) {
            /*
            PIXI.loader
                .add("mumi", "https://pbs.twimg.com/media/E9Nv9U5UUAMrJif?format=jpg&name=4096x4096")
                .load(draw);
            */
            //let sprite = PIXI.Sprite.from("https://i.imgur.com/etjtA3w.png");
            app.loader.add("mumi", "https://i.imgur.com/etjtA3w.png",{ crossOrigin: true }).load(draw);

            console.log(sprite, sprite.width, cw);
            sprite.anchor.set(0.5);
            //sprite.scale.x = sprite.width / cw;
            //sprite.scale.y = sprite.height / ch;
            //console.log(sprite.scale.x);
            app.stage.addChild(sprite);
        }
        //return;
        if (ebj?.waitTime) {
            //setTimeout(drawCanvas, ebj.waitTime);
        } else {
            //setTimeout(drawCanvas, 1);
        }
        currentSection++;
    } else {
        return;
    }
}

function draw(loader, resources) {
    //console.log(loader, resources);

    console.log(resources['mumi']);
    let spr = new PIXI.Sprite(resources['mumi'].texture);
    spr.x = cw / 2;
    spr.y = ch / 2;

    // Rotate around the center
    spr.anchor.x = 0.5;
    spr.anchor.y = 0.5;
    app.stage.addChild(spr);
}