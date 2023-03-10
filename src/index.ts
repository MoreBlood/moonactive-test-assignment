import { Application, Assets, LoadAsset } from "./pixi";
import { HorizontalyTiledBackground } from "./components/background";
import FontFaceObserver from "fontfaceobserver";
import { Modal } from "./components/modal";
import { PackshotModal } from "./components/packshotModal";
import { Layout } from "./components/layout";
import BackTile from "../assets/tiles/BackTile.png";
import tileBlue from "../assets/tiles/tileBlue.png";
import tileGreen from "../assets/tiles/tileGreen.png";
import tileOrange from "../assets/tiles/tileOrange.png";
import tilePink from "../assets/tiles/tilePink.png";
import tileRed from "../assets/tiles/tileRed.png";
import tileYellow from "../assets/tiles/tileYellow.png";
import forest from "../assets/bg/forest.jpg";
import { Effects } from "./components/effects";
import { TileType } from "./components/tile";
import { Settings } from "./config";

// TODO
// [x] scalable text
// container with custom bounds class

declare const VERSION: string;

const gameWidth = window.innerWidth;
const gameHeight = window.innerHeight;

export class Game extends Application {
  static assets = { BackTile, tileBlue, tileGreen, tileOrange, tilePink, tileRed, tileYellow, forest };

  constructor() {
    super({
      width: gameWidth,
      height: gameHeight,
      backgroundColor: 0xd3d3d3,
      antialias: true,
      autoDensity: true,
      powerPreference: "high-performance",
    });

    this.init();
  }

  async loadFonts() {
    const observer = new FontFaceObserver("Chango-Regular");

    await observer.load();
  }

  async loadGameAssets(): Promise<void> {
    const keys = Object.keys(Game.assets) as (keyof typeof Game.assets)[];

    await Assets.load(keys.map((key): LoadAsset => ({ alias: [key], src: Game.assets[key] })));
  }

  resizeCanvas(): void {
    const resize = () => {
      this.renderer.resize(window.innerWidth, window.innerHeight);
      this.renderer.emit("resize", window.innerWidth, window.innerHeight);
    };

    resize();

    window.addEventListener("resize", resize);
  }

  async init() {
    await this.loadGameAssets();
    await this.loadFonts();

    document.body.appendChild(this.view);

    const forestTexture = Assets.cache.get("forest");

    const effects = new Effects(this);

    const bg = new HorizontalyTiledBackground(this, forestTexture);
    this.stage.addChild(bg);

    // layout has gamefiled, total score and progress bar
    const layout = new Layout(this);
    const packshot = new PackshotModal(
      this,
      Settings.text.packshotTitle,
      Settings.text.packshotFailTitle,
      Settings.text.packshotButton,
    );
    const modal = new Modal(this, Settings.text.introTitle, Settings.text.introButton);

    this.stage.addChild(layout);
    this.stage.addChild(modal);
    this.stage.addChild(packshot);
    this.stage.addChild(effects);

    layout.gameField.on("scored", (score: number, type: TileType, x: number, y: number) => {
      const emitter = effects.emitters[type];

      const local = effects.toLocal({ x, y });

      emitter.spawnPos.x = local.x;
      emitter.spawnPos.y = local.y;

      emitter.emitNow();
    });

    modal.show();

    // on time limit
    layout.on("end-time", () => {
      if (layout.score.current >= Settings.gamefield.needToScore) {
        packshot.changeType(false);
      } else {
        packshot.changeType(true);
      }

      packshot.show();
    });

    // on intro modal hidden
    modal.on("hidden", () => {
      layout.start();
    });

    // on restart
    packshot.on("hidden", () => {
      layout.restart();
    });

    this.resizeCanvas();

    this.stage.interactive = true;
  }
}

new Game();
