import "./style.css";
import { Application, Loader } from "pixi.js";
import { HorizontalyTiledBackground } from "./components/background";
import FontFaceObserver from "fontfaceobserver";
import { Modal } from "./components/modal";
import { PackshotModal } from "./components/packshotModal";
import { Layout } from "./components/layout";

// TODO
// [x] scalable text
// container with custom bounds class

declare const VERSION: string;

const gameWidth = window.innerWidth;
const gameHeight = window.innerHeight;

const assets: { [key: string]: string[] } = {
  tiles: [
    "BackTile.png",
    "tileBlue.png",
    "tileGreen.png",
    "tileOrange.png",
    "tilePink.png",
    "tileRed.png",
    "tileYellow.png",
  ],
  bg: ["forest.jpg"],
};

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

  const forestTexture = Loader.shared.resources["forest"].texture;

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
  return new Promise((res, rej) => {
    const loader = Loader.shared;

    Object.keys(assets).forEach((group) => {
      const assetsGroup = assets[group];

      assetsGroup.forEach((asset) => {
        const [name] = asset.split(".");

        loader.add(name, `./assets/${group}/${asset}`);
      });
    });

    loader.onComplete.once(() => {
      res();
    });

    loader.onError.once(() => {
      rej();
    });

    loader.load();
  });
}

function resizeCanvas(): void {
  const resize = () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.renderer.emit("resize", window.innerWidth, window.innerHeight);
  };

  resize();

  window.addEventListener("resize", resize);
}
