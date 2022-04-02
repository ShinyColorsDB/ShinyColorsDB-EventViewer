class SelectManager {
    constructor() {
        this._container = new PIXI.Container();
        this._loader = PIXI.Loader.shared;
        this._stMap = new Map();
    }

    get stageObj() { return this._container; }

    reset() {
        this._stMap.clear();
    }

    processSelectByInput(selectDesc, nextLabel, onClick) {
        if (!selectDesc) { return; }
        
        if (!this._stMap.has(`selectFrame${nextLabel}`)) {
            this._stMap.set(`selectFrame${nextLabel}`, new PIXI.Sprite(this._loader.resources[`selectFrame${nextLabel}`].texture));
        }

        let thisSelectFrame = this._stMap.get(`selectFrame${nextLabel}`);
        thisSelectFrame.interactive = true;

        thisSelectFrame.on('pointerdown', function() {
			onClick(nextLabel);
            if (this._container.children.length) {
                this._container.removeChildren(0, this._container.children.length);
            }
        });

        let textObj = new PIXI.Text(selectDesc, {fontFamily: 'primula-HummingStd-E', fontSize: 24, fill: 0x000000, align: 'center'});
        this._container.addChildAt(textObj, 2);
        textObj.position.x = 240;
        textObj.position.y = 505;

    }
}