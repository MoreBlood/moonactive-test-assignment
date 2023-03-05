import { Application, Loader, Texture, AnimatedSprite, TilingSprite, Container } from "pixi.js";
import { getSpine } from "./spine-example";
import { HorizontalyTiledBackground } from "./components/background";
import "./style.css";
import { Tile, TileType } from "./components/tile";
import { getRandomInt } from "./helpers/random";
import { GameField } from "./components/gameField";
import FontFaceObserver from "fontfaceobserver";
import { Modal } from "./components/modal";
import { BaseModal } from "./components/baseModal";
import { PackshotModal } from "./components/packshotModal";
import gsap from "gsap";

// TODO
// [ ] scalable text
// container with custom bounds class

declare const VERSION: string;

// const gameWidth = window.innerWidth * 2;
// const gameHeight = window.innerHeight * 2;

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

console.log(`Welcome from pixi-typescript-boilerplate ${VERSION}`);

const app = new Application({
  // width: gameWidth,
  // height: gameHeight,
  // backgroundColor: 0xd3d3d3,
  antialias: true,
  autoDensity: true,
  // powerPreference: "high-performance",
});

window.onload = async (): Promise<void> => {
  await loadGameAssets();
  await loadFonts();

  document.body.appendChild(app.view);

  resizeCanvas();

  console.log(Loader.shared.resources["forest"]);

  const bg = new HorizontalyTiledBackground(app, Loader.shared.resources["forest"].texture!);

  app.stage.addChild(bg);

  const gameField = new GameField(app, 5, 5);

  app.stage.addChild(gameField);

  const packshot = new PackshotModal(app, "NICE\nWORK", "FAIL!", "TRY AGAIN");
  const modal = new Modal(app, "MERGE ALL SIMILAR ITEMS BEFORE TIME RUNS OUT ", "START");

  modal.on("hidden", () => {
    gameField.start();
  });

  gameField.on("end-time", () => {
    if (gameField.score.current > 0) {
      packshot.changeType(false);
    } else {
      packshot.changeType(true);
    }
    packshot.show();
  });

  packshot.on("hidden", () => {
    gameField.restart();
  });

  app.stage.addChild(modal);
  app.stage.addChild(packshot);
  modal.show();

  app.stage.interactive = true;
};

async function loadFonts() {
  const observer = new FontFaceObserver("Chango-Regular");

  await observer.load();
}

async function loadGameAssets(): Promise<void> {
  return new Promise((res, rej) => {
    const loader = Loader.shared;
    loader.add("rabbit", "./assets/simpleSpriteSheet.json");
    loader.add("pixie", "./assets/spine-assets/pixie.json");

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
    // app.stage.scale.x = window.innerWidth / gameWidth;
    // app.stage.scale.y = window.innerHeight / gameHeight;

    app.renderer.emit("resize", window.innerWidth, window.innerHeight);
  };

  resize();

  window.addEventListener("resize", resize);
}

function getBird(): AnimatedSprite {
  const bird = new AnimatedSprite([
    Texture.from("birdUp.png"),
    Texture.from("birdMiddle.png"),
    Texture.from("birdDown.png"),
  ]);

  bird.loop = true;
  bird.animationSpeed = 0.1;
  bird.play();
  bird.scale.set(3);

  return bird;
}
