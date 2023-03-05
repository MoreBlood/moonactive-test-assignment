import { Application, Loader, Assets, LoadAsset } from "./pixi";
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

// TODO
// [x] scalable text
// container with custom bounds class

declare const VERSION: string;

const gameWidth = window.innerWidth;
const gameHeight = window.innerHeight;

const assets = { BackTile, tileBlue, tileGreen, tileOrange, tilePink, tileRed, tileYellow, forest };

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

  if (forestTexture) {
    const bg = new HorizontalyTiledBackground(app, forestTexture);
    app.stage.addChild(bg);
  }

  const layout = new Layout(app);
  const packshot = new PackshotModal(app, "NICE\nWORK", "FAIL!", "TRY AGAIN");
  const modal = new Modal(app, "MERGE ALL SIMILAR ITEMS BEFORE TIME RUNS OUT ", "START");

  modal.show();

  layout.on("end-time", () => {
    if (layout.score.current > 0) {
      packshot.changeType(false);
    } else {
      packshot.changeType(true);
    }
    packshot.show();
  });

  app.stage.addChild(layout);
  app.stage.addChild(modal);
  app.stage.addChild(packshot);

  modal.on("hidden", () => {
    layout.start();
  });

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
  await Assets.load(Object.keys(assets).map((key): LoadAsset => ({ alias: [key], src: (assets as any)[key] })));
}

function resizeCanvas(): void {
  const resize = () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.renderer.emit("resize", window.innerWidth, window.innerHeight);
  };

  resize();

  window.addEventListener("resize", resize);
}
