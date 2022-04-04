class SelectManager {
    constructor() {
        this._container = new PIXI.Container();
        this._loader = PIXI.Loader.shared;
        this._stMap = new Map();
    }

    get stageObj() { 
        return this._container; 
    }

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

        thisSelectContainer.on('click', () => {
			onClick(nextLabel);
            afterSelection();
            this._stMap.forEach(st => {
                if (st.children.length) {
                    st.removeChildren(0, st.children.length);
                }
            });
            this._container.removeChildren(0, this._container.children.length);
        });

        let textObj = new PIXI.Text(selectDesc, {
            fontFamily: 'Meiryo', 
            fontSize: 24, 
            fill: 0x000000, 
            align: 'center'
        });
        thisSelectContainer.addChild(textObj);
        this._container.addChild(thisSelectContainer);

        // for selectFrame size is 318x172
        textObj.anchor.set(0.5);
        textObj.position.set(159, 86);

        switch (nextLabel) {
            case "1":
                thisSelectContainer.position.set(400, 40);
                break;
            case "2":
                thisSelectContainer.position.set(60, 150);
                break;
            case "3":
                thisSelectContainer.position.set(750, 150);
                break;
        }

    }
}