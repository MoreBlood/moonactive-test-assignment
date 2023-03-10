import { Assets, Point, Sprite } from "../pixi";
import { Container } from "../pixi";
import { TileModel } from "../model/TileModel";
import gsap from "gsap";

export enum TileViewEvents {
  tileDestroyed = "tileDestroyed",
}

export class TileView extends Container {
  private tile: Sprite;

  private background: Sprite;

  constructor(public tileModel: TileModel) {
    super();

    const tileTexture = Assets.cache.get(this.tileModel.type);
    const backgroundTexture = Assets.cache.get("BackTile");

    if (!tileTexture) {
      throw new Error("tile not found");
    }

    if (!backgroundTexture) {
      throw new Error("background texture not found");
    }

    this.tile = Sprite.from(tileTexture, tileTexture);

    this.background = Sprite.from(backgroundTexture, backgroundTexture);

    this.background.scale.set(0.8, 0.8);

    this.tile.position.x = (this.background.texture.width * this.background.scale.x) / 2 - this.tile.texture.width / 2;
    this.tile.position.y =
      (this.background.texture.height * this.background.scale.x) / 2 - this.tile.texture.height / 2;

    this.interactive = true;

    this.addChild(this.background);
    this.addChild(this.tile);
  }

  public destroyTile() {
    gsap.to(this, {
      alpha: 0,
      duration: 0.5,
      onComplete: () => {
        const bounds = this.getBounds();

        this.emit(
          TileViewEvents.tileDestroyed,
          this.toGlobal(new Point()).x + bounds.width / 2,
          this.toGlobal(new Point()).y + bounds.height / 2,
        );

        this.destroy();
      },
    });
  }
}
