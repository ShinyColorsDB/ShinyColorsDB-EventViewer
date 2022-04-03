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

    processSelectByInput(selectDesc, nextLabel, onClick, afterSelection) {
        if (!selectDesc) { return; }
        
        if (!this._stMap.has(`selectFrame${nextLabel}`)) {
            let thisSelectContainer = new PIXI.Container();
            thisSelectContainer.addChild(new PIXI.Sprite(this._loader.resources[`selectFrame${nextLabel}`].texture))
            this._stMap.set(`selectFrame${nextLabel}`, thisSelectContainer);
        }

        let thisSelectContainer = this._stMap.get(`selectFrame${nextLabel}`);
        thisSelectContainer.interactive = true;

        thisSelectContainer.on('pointerdown', () => {
			onClick(nextLabel);
            afterSelection();
            this._stMap.forEach(st => {
                if (st.children.length) {
                    st.removeChildren(0, st.children.length);
                }
            });
            this._container.removeChildren(0, this._container.children.length);
        });

        let textObj = new PIXI.Text(selectDesc, {fontFamily: 'primula-HummingStd-E', fontSize: 24, fill: 0x000000, align: 'center'});
        thisSelectContainer.addChild(textObj);
        textObj.anchor.set(0.5, 0.5);
        //console.log(textObj.position);
        //textObj.position.x = textObj.position.x - textObj.getLocalBounds().width / 2;
        //textObj.position.y = textObj.position.y - textObj.getLocalBounds().height / 2;
        this._container.addChild(thisSelectContainer);

        switch (nextLabel) {
            case "1":
                thisSelectContainer.position.x = 400;
                thisSelectContainer.position.y = 40;
                break;
            case "2":
                thisSelectContainer.position.x = 60;
                thisSelectContainer.position.y = 150;
                break;
            case "3":
                thisSelectContainer.position.x = 750;
                thisSelectContainer.position.y = 150;
                break;
        }

    }
}