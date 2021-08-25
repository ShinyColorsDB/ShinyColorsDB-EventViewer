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

const backgroundPath = "T:/files/assets/images/event/bg/";
let currentSection = 0;
let ratio = 1.775;
let renderer = PIXI.autoDetectRenderer(1920, 975, null);
let app, cw, ch;

function Init() {
    app = new PIXI.Application({
        resizeTo: window
    });
    document.body.appendChild(app.view);
    setTimeout(drawCanvas, 0);
}

function drawCanvas() {
    let ebj = eventObj[currentSection];
    if (currentSection < eventObj.length) {
        if (ebj?.bg) {
            //img.src = backgroundPath + ebj.bg + ".jpg";
            //img.src = ""
            let sprite = PIXI.Sprite.from("https://static.shinycolors.moe/pictures/bigPic/a63f595d-4d32-4365-a9db-e824bfca494a.jpg", {width: cw, height: ch});
            console.log(sprite);
            sprite.position.x = 0;
            sprite.position.y = 0;

            app.stage.addChild(sprite);
        }
        if (ebj?.waitTime) {
            setTimeout(drawCanvas, ebj.waitTime);
        }
        else {
            setTimeout(drawCanvas, 1);
        }
        currentSection++;
    }
    else {
        return;
    }
}
