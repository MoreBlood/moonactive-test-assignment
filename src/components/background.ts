import { Application, Container, IDestroyOptions, Texture, TilingSprite } from "../pixi";

export class HorizontalyTiledBackground extends Container {
  private backgroundTile: TilingSprite;

  constructor(private readonly app: Pick<Application, "renderer" | "screen">, readonly texture: Texture) {
    super();

    this.backgroundTile = TilingSprite.from(texture, texture);

    this.backgroundTile.anchor.x = 0.5;
    this.backgroundTile.anchor.y = 0.5;

    this.addChild(this.backgroundTile);
    this.resize(app.renderer.width, app.screen.height);

    // this.backgroundTile.filters = [new filters.BlurFilter(10)];

    app.renderer.addListener("resize", this.resize);
  }

  destroy(options?: boolean | IDestroyOptions | undefined): void {
    super.destroy(options);

    this.app.renderer.removeListener("resize", this.resize);
  }

  private resize = (width: number, height: number) => {
    // this will position it in center and scale verticaly to fit viewport
    this.backgroundTile.position.x = width / 2;
    this.backgroundTile.position.y = height / 2;

    const scale = height / this.texture.height;

    this.backgroundTile.tilePosition.x = width / 2 + (this.texture.width / 2) * scale;
    this.backgroundTile.tilePosition.y = height / 2 + (this.texture.height / 2) * scale;

    this.backgroundTile.width = width;
    this.backgroundTile.height = height;

    this.backgroundTile.tileScale.x = scale;
    this.backgroundTile.tileScale.y = scale;
  };
}
