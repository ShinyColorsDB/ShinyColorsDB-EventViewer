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
        this._container.removeChildren(0, this._container.children.length);
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
        const localBound = thisSelectContainer.getLocalBounds();
        thisSelectContainer.pivot.set(localBound.width / 2, localBound.height / 2);

        thisSelectContainer.on('click', () => {
            this._disableInteractive();

            TweenMax.to(thisSelectContainer, 0.3, { pixi: { scaleX: 1.1, scaleY: 1.1 } });

            setTimeout(() => {

                onClick(nextLabel);
                afterSelection();

                this._fadeOutOption();
            }, 1000);

        }, { once: true });

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
                thisSelectContainer.position.set(568, 125);
                break;
            case "2":
                thisSelectContainer.position.set(200, 240);
                break;
            case "3":
                thisSelectContainer.position.set(936, 240);
                break;
        }

        const tl = new TimelineMax({ repeat: -1, yoyo: true, repeatDelay: 0 });
        const yLocation = thisSelectContainer.y;
        tl.to(thisSelectContainer, 1, { pixi: { y: yLocation - 10 }, ease: Power1.easeInOut });
        tl.to(thisSelectContainer, 1, { pixi: { y: yLocation }, ease: Power1.easeInOut });

    }

    _disableInteractive() {
        this._stMap.forEach(st => {
            st.interactive = false;
        });
    }

    _fadeOutOption() {
        this._stMap.forEach(st => {
            TweenMax.to(st, 1, { alpha: 0 , ease: Power3.easeOut });
        });
        setTimeout(() => {
            this._container.removeChildren(0, this._container.children.length);
        }, 500);
    }
}
