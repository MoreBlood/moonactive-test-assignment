import {
  Application,
  Container,
  IDestroyOptions,
  Texture,
  TilingSprite,
  filters,
  Loader,
  Sprite,
  DisplayObject,
  Renderer,
  Point,
} from "pixi.js";
import { getRandomInt } from "../helpers/random";
import { ProgressBar } from "./progressBar";
import { Tile, TileType } from "./tile";

function broofa() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class GameField extends Container {
  // private tiles: Sprite;
  // private background: Sprite;
  initialWidth = 0;
  initialHeight = 0;

  public progressBar: ProgressBar;

  gameField: { id: string; tile: TileType }[][] = [];

  private tilesMap = new Map<string, { tile: Tile; row: number; column: number }>();

  constructor(
    private readonly app: Pick<Application, "renderer" | "screen">,
    private readonly fieldWidth = 4,
    private readonly fieldHeight = 4,
  ) {
    super();

    const tiles = Object.keys(TileType);

    this.sortableChildren = true;

    let bottom = 0;

    for (let i = 0; i < fieldHeight; i += 1) {
      for (let u = 0; u < fieldWidth; u += 1) {
        const type = tiles[getRandomInt(0, tiles.length - 1)] as TileType;

        if (!this.gameField[i]) {
          this.gameField[i] = [];
        }

        this.gameField[i][u] = { id: broofa(), tile: type };
      }
    }

    console.log(this.gameField);

    for (let i = 0; i < fieldHeight; i += 1) {
      for (let u = 0; u < fieldWidth; u += 1) {
        const tile = new Tile(this.gameField[i][u].tile, this.gameField[i][u].id, this.gameField);
        tile.position.x = u * tile.width + tile.width * 0.1 * u;
        tile.position.y = i * tile.height + tile.height * 0.1 * i;

        tile.startPosition = new Point(tile.position.x, tile.position.y);

        this.tilesMap.set(this.gameField[i][u].id, { tile, row: i, column: u });

        bottom = tile.position.y + tile.height + tile.height / 4;

        this.addChild(tile);

        tile.on("swap", this.swap);
        tile.on("swap-complete", this.swapComplete);
        tile.on("swap-cancel", this.swapCancel);
      }
    }

    this.progressBar = new ProgressBar(5 * 1000, 2.5 * 1000);

    this.progressBar.position.y = bottom;

    this.addChild(this.progressBar);

    this.resize(app.renderer.width, app.screen.height);

    app.renderer.addListener("resize", this.resize);
  }

  swap = (initiatorId: string, opponentId: string, x: number, y: number) => {
    const opponent = this.tilesMap.get(opponentId);
    const initiator = this.tilesMap.get(initiatorId);

    if (opponent?.tile && opponent.tile?.startPosition) {
      opponent.tile.x = opponent.tile.startPosition.x + x;
      opponent.tile.y = opponent.tile.startPosition.y + y;
    }
  };
  swapComplete = (initiatorId: string, opponentId: string, x: number, y: number) => {
    const opponent = this.tilesMap.get(opponentId);
    const initiator = this.tilesMap.get(initiatorId);

    //swap in original array
    if (opponent && initiator) {
      const opponentGameFieldElement = this.gameField[opponent.row][opponent.column];
      const initiatorGameFieldElement = this.gameField[initiator.row][initiator.column];

      this.gameField[opponent.row][opponent.column] = initiatorGameFieldElement;
      this.gameField[initiator.row][initiator.column] = opponentGameFieldElement;

      const tempOponnentRow = opponent.row;
      const tempOponnentColumn = opponent.column;

      opponent.row = initiator.row;
      opponent.column = initiator.column;

      initiator.row = tempOponnentRow;
      initiator.column = tempOponnentColumn;
    }

    if (opponent && initiator?.tile?.startPosition) {
      opponent.tile.x = initiator.tile.startPosition.x;
      opponent.tile.y = initiator.tile.startPosition.y;
    }

    if (initiator && opponent?.tile?.startPosition) {
      initiator.tile.x = opponent.tile.startPosition.x;
      initiator.tile.y = opponent.tile.startPosition.y;
    }

    if (opponent && initiator) {
      const temp = opponent.tile.startPosition;

      opponent.tile.startPosition = initiator.tile.startPosition;
      initiator.tile.startPosition = temp;
    }
  };

  swapCancel = (initiatorId: string, opponentId: string) => {
    const opponent = this.tilesMap.get(opponentId);
    const initiator = this.tilesMap.get(initiatorId);

    if (opponent?.tile?.startPosition) {
      opponent.tile.x = opponent.tile.startPosition.x;
      opponent.tile.y = opponent.tile.startPosition.y;
    }

    if (initiator?.tile?.startPosition) {
      initiator.tile.x = initiator.tile.startPosition.x;
      initiator.tile.y = initiator.tile.startPosition.y;
    }
  };

  destroy(options?: boolean | IDestroyOptions | undefined): void {
    super.destroy(options);

    this.app.renderer.removeListener("resize", this.resize);
  }

  resize = (width: number, height: number) => {
    if (this.initialWidth === 0) {
      this.initialWidth = this.width;

      this.progressBar.resize(this.initialWidth);
    }

    if (this.initialHeight === 0) {
      this.initialHeight = this.height;
    }

    let scale = 0;

    if (height > width) {
      scale = width / (this.initialWidth + this.initialWidth * 0.2);
    } else {
      scale = height / (this.initialHeight + this.initialHeight * 0.2);
    }

    this.scale.set(scale, scale);

    this.position.x = width / 2 - this.width / 2;
    this.position.y = height / 2 - this.height / 2;
  };
}
