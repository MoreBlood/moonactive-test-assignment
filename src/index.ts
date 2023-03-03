import { Application, Loader, Texture, AnimatedSprite, TilingSprite, Container } from "pixi.js";
import { getSpine } from "./spine-example";
import { HorizontalyTiledBackground } from "./components/background";
import "./style.css";
import { Tile, TileType } from "./components/tile";
import { getRandomInt } from "./helpers/random";
import { GameField } from "./components/gameField";

declare const VERSION: string;

const gameWidth = 800;
const gameHeight = 600;

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
  backgroundColor: 0xd3d3d3,
  width: gameWidth,
  height: gameHeight,
});

window.onload = async (): Promise<void> => {
  await loadGameAssets();

  document.body.appendChild(app.view);

  resizeCanvas();

  console.log(Loader.shared.resources["forest"]);

  const bg = new HorizontalyTiledBackground(app, Loader.shared.resources["forest"].texture!);

  app.stage.addChild(bg);

  const gameField = new GameField(app, 7, 7);

  app.stage.addChild(gameField);

  const birdFromSprite = getBird();
  birdFromSprite.anchor.set(0.5, 0.5);
  birdFromSprite.position.set(gameWidth / 2, 530);

  const spineExample = getSpine();
  spineExample.position.y = 580;

  // app.stage.addChild(birdFromSprite);
  // app.stage.addChild(spineExample);
  app.stage.interactive = true;
};

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
