import {
  Container,
  IDestroyOptions,
  Sprite,
  Point,
  InteractionData,
  Assets,
  Emitter,
  Texture,
  Application,
  Renderer,
  Ticker,
  upgradeConfig,
  Rectangle,
} from "../pixi";
import { TileType } from "./tile";

export class Effects extends Sprite {
  emitters: { [key in TileType]: Emitter } = {} as any;

  constructor(private readonly app: Pick<Application, "renderer" | "screen">) {
    super();

    (Object.keys(TileType) as TileType[]).forEach((type) => this.generateEmitter(type));

    app.renderer.addListener("resize", this.resize);
  }

  private generateEmitter(type: TileType) {
    const color: { [key in TileType]: number } = {
      tileGreen: 0x98cb4a,
      tileOrange: 0xe86a17,
      tilePink: 0xff99cc,
      tileRed: 0xc83f3e,
      tileYellow: 0xfed732,
    };

    const emitter = new Emitter(
      // The PIXI.Container to put the emitter in
      // if using blend modes, it's important to put this
      // on top of a bitmap, and not use the root stage Container
      this,
      // Emitter configuration, edit this to change the look
      // of the emitter
      upgradeConfig(
        {
          alpha: {
            start: 0.8,
            end: 0.1,
          },
          scale: {
            start: 0.3,
            end: 0,
            minimumScaleMultiplier: 1,
          },
          color: {
            start: color[type].toString(16).replace("0x", "#"),
            end: color[type].toString(16).replace("0x", "#"),
          },
          speed: {
            start: 300,
            end: 0,
            minimumSpeedMultiplier: 1,
          },
          acceleration: {
            x: 0,
            y: 0,
          },
          maxSpeed: 0,
          startRotation: {
            min: 0,
            max: 360,
          },
          noRotation: false,
          rotationSpeed: {
            min: 0,
            max: 10,
          },
          lifetime: {
            min: 0.2,
            max: 0.5,
          },
          blendMode: "normal",
          frequency: 0.008,
          emitterLifetime: 0.31,
          particlesPerWave: 10,
          maxParticles: 1000,
          pos: {
            x: 0,
            y: 0,
          },
          addAtBack: false,
          spawnType: "circle",
          spawnCircle: {
            x: 0,
            y: 0,
            r: 10,
          },
        },
        Assets.get(type),
      ),
    );

    emitter.emit = false;
    emitter.autoUpdate = true;

    this.emitters[type] = emitter;
  }

  private resize = (width: number, height: number) => {
    // this will position it in center and scale verticaly to fit viewport
    this.getLocalBounds = function getLocalBounds() {
      const bounds = new Rectangle();
      bounds.width = width;
      bounds.height = height;

      return bounds;
    };
    // this.hitArea = new Rectangle(0, 0, width, height);
  };
}
