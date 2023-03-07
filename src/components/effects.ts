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
  emitter: Emitter;

  constructor(private readonly app: Pick<Application, "renderer" | "screen">) {
    super();

    // Create a new emitter
    // note: if importing library like "import * as particles from '@pixi/particle-emitter'"
    // or "const particles = require('@pixi/particle-emitter')", the PIXI namespace will
    // not be modified, and may not exist - use "new particles.Emitter()", or whatever
    // your imported namespace is
    this.emitter = new Emitter(
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
            start: "#fb1010",
            end: "#f5b830",
          },
          speed: {
            start: 200,
            end: 100,
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
            max: 0,
          },
          lifetime: {
            min: 0.5,
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
        Object.keys(TileType).map((tile) => Assets.get(tile)),
      ),
    );

    // this.addChild(this.emitter);

    this.emitter.emit = false;
    this.emitter.autoUpdate = true;

    this.interactive = true;

    app.renderer.addListener("resize", this.resize);
  }

  private resize = (width: number, height: number) => {
    // this will position it in center and scale verticaly to fit viewport
    this.width = width;
    this.height = height;
    // this.hitArea = new Rectangle(0, 0, width, height);
  };
}
