class MovieManager {
    constructor() {
        this._container = new PIXI.Container();
        this._loader = PIXI.Loader.shared;
    }

    get stageObj() {
        return this._container;
    }

    processMovieByInput(movie, onMovieEnded) {
        if (!movie) { return; }

        this._onMovieEnded = onMovieEnded;
        this._playMovie(movie);
    }

    _playMovie(movie) {
        let texture = PIXI.Texture.from(this._loader.resources[`movie${movie}`].data);
        let movieSprite = new PIXI.Sprite(texture);

        this._container.addChild(movieSprite);

        const controller = movieSprite.texture.baseTexture.resource.source;

        controller.addEventListener("ended", () => {
            Utilities.fadingEffect(movieSprite, {
                type: "to", alpha: 0, time: 1000, ease: "easeOutQuart"
            });

            setTimeout(() => {
                this._container.removeChild(movieSprite);
                this._onMovieEnded();

            }, 1500);
        });
    }
}
