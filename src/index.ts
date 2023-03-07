import { Application, Loader, Assets, LoadAsset, InteractionData, upgradeConfig } from "./pixi";
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
import particle from "../assets/particle.png";
import { Effects } from "./components/effects";
import { TileType } from "./components/tile";

// TODO
// [x] scalable text
// container with custom bounds class

declare const VERSION: string;

const gameWidth = window.innerWidth;
const gameHeight = window.innerHeight;

const assets = { BackTile, tileBlue, tileGreen, tileOrange, tilePink, tileRed, tileYellow, forest, particle };

const app = new Application({
  width: gameWidth,
  height: gameHeight,
  backgroundColor: 0xd3d3d3,
  antialias: true,
  autoDensity: true,
  powerPreference: "high-performance",
});

window.onload = async (): Promise<void> => {
  await loadGameAssets();
  await loadFonts();

  document.body.appendChild(app.view);

  resizeCanvas();

  const forestTexture = Assets.cache.get("forest");

  const effects = new Effects(app);

  const bg = new HorizontalyTiledBackground(app, forestTexture);
  app.stage.addChild(bg);

  // layout has gamefiled, total score and progress bar
  const layout = new Layout(app);
  const packshot = new PackshotModal(app, "NICE\nWORK", "FAIL!", "TRY AGAIN");
  const modal = new Modal(app, "MERGE ALL SIMILAR ITEMS BEFORE TIME RUNS OUT ", "START");

  app.stage.addChild(layout);
  app.stage.addChild(modal);
  app.stage.addChild(packshot);
  app.stage.addChild(effects);

  bg.interactive = true;

  layout.gameField.on("scored", (score: number, type: TileType, x: number, y: number) => {
    effects.emitter.spawnPos.x = x;
    effects.emitter.spawnPos.y = y;

    // effects.emitter.init(
    //   upgradeConfig(
    //     {
    //       alpha: {
    //         start: 0.8,
    //         end: 0.1,
    //       },
    //       scale: {
    //         start: 0.1,
    //         end: 0,
    //         minimumScaleMultiplier: 1,
    //       },
    //       color: {
    //         start: "#fb1010",
    //         end: "#f5b830",
    //       },
    //       speed: {
    //         start: 200,
    //         end: 100,
    //         minimumSpeedMultiplier: 1,
    //       },
    //       acceleration: {
    //         x: 0,
    //         y: 0,
    //       },
    //       maxSpeed: 0,
    //       startRotation: {
    //         min: 0,
    //         max: 360,
    //       },
    //       noRotation: false,
    //       rotationSpeed: {
    //         min: 0,
    //         max: 0,
    //       },
    //       lifetime: {
    //         min: 0.5,
    //         max: 0.5,
    //       },
    //       blendMode: "normal",
    //       frequency: 0.008,
    //       emitterLifetime: 0.31,
    //       particlesPerWave: 10,
    //       maxParticles: 1000,
    //       pos: {
    //         x: 0,
    //         y: 0,
    //       },
    //       addAtBack: false,
    //       spawnType: "circle",
    //       spawnCircle: {
    //         x: 0,
    //         y: 0,
    //         r: 10,
    //       },
    //     },
    //     Assets.get(type),
    //   ),
    // );
    effects.emitter.emitNow();
  });

  modal.show();

  // on time limit
  layout.on("end-time", () => {
    if (layout.score.current > 0) {
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

  app.stage.interactive = true;
};

async function loadFonts() {
  const observer = new FontFaceObserver("Chango-Regular");

  await observer.load();
}

async function loadGameAssets(): Promise<void> {
  const keys = Object.keys(assets) as (keyof typeof assets)[];

  await Assets.load(keys.map((key): LoadAsset => ({ alias: [key], src: assets[key] })));
}

function resizeCanvas(): void {
  const resize = () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.renderer.emit("resize", window.innerWidth, window.innerHeight);
  };

  resize();

  window.addEventListener("resize", resize);
}
