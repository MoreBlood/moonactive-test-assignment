import { colorNumberToHex } from "../helpers/colorNumberToString";
import { Sprite, Assets, Emitter, upgradeConfig, Application } from "../pixi";
import { TileType } from "../model/TileModel";

export class Effects extends Sprite {
  emitters: { [key in TileType]: Emitter } = {} as any;

  constructor(app: Pick<Application, "renderer" | "screen">) {
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
            start: 0.1,
            end: 0,
            minimumScaleMultiplier: 1,
          },
          color: {
            start: colorNumberToHex(color[type]),
            end: colorNumberToHex(color[type]),
          },
          speed: {
            start: 200,
            end: 50,
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
            max: 0.6,
          },
          blendMode: "normal",
          frequency: 0.008,
          emitterLifetime: 0.31,
          particlesPerWave: 50,
          maxParticles: 1000,
          pos: {
            x: 0,
            y: 0,
          },
          addAtBack: false,
          spawnType: "rect",
          spawnRect: {
            x: -25,
            y: -25,
            w: 50,
            h: 50,
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
    let scale = 0;

    if (height > width) {
      scale = width / 400;
    } else {
      scale = height / 400;
    }

    this.scale.set(scale);
  };
}
