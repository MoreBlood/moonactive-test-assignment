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
import gsap from "gsap";
import { Tile, TileDirections, TileType } from "./tile";
import sleep from "../helpers/tweenedSleep";
import { ScoreBar } from "./score";
import { AbstractScoreBar } from "./abstract/abstractScoresBar";
import { AbstractProgressBar } from "./abstract/abstractProgressBar";

function broofa() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export type GameLine = ({ id: string; tile: TileType; position: Point } | undefined)[];

export class GameField extends Container {
  // private tiles: Sprite;
  // private background: Sprite;
  initialWidth = 0;
  initialHeight = 0;

  inProgress = false;

  public progressBar: AbstractProgressBar;

  public score: AbstractScoreBar;

  gameField: GameLine[] = [];

  layout: Point[][] = [];

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

    const dummyTile = new Tile(TileType.tileGreen, "id", this.gameField as any); // FIX
    this.score = new ScoreBar(0);

    for (let i = 0; i < fieldHeight; i += 1) {
      for (let u = 0; u < fieldWidth; u += 1) {
        const type = tiles[getRandomInt(0, tiles.length - 1)] as TileType;

        if (!this.gameField[i]) {
          this.gameField[i] = [];
          this.layout[i] = [];
        }

        const point = new Point();

        point.x = u * dummyTile.width + dummyTile.width * 0.1 * u;
        point.y = this.score.height + i * dummyTile.height + dummyTile.height * 0.1 * i;

        this.layout[i][u] = point;

        this.gameField[i][u] = { id: broofa(), tile: type, position: point };
      }
    }

    // console.log(this.gameField);

    for (let i = 0; i < fieldHeight; i += 1) {
      for (let u = 0; u < fieldWidth; u += 1) {
        const el = this.gameField[i][u]!;

        const tile = new Tile(el.tile, el.id, this.gameField as any); // FIX
        tile.position.x = el.position.x;
        tile.position.y = el.position.y;

        tile.startPosition = new Point(tile.position.x, tile.position.y);

        this.tilesMap.set(this.gameField[i][u]!.id, { tile, row: i, column: u });

        bottom = tile.position.y + tile.height + tile.height / 4;

        this.addChild(tile);

        tile.on("swap", this.swap);
        tile.on("swap-complete", this.swapComplete);
        tile.on("swap-cancel", this.swapCancel);
      }
    }

    this.progressBar = new ProgressBar(10 * 1000, 10 * 1000);
    const progressBar = this.progressBar;

    this.progressBar.position.y = bottom;
    // this.score.position.y = this.progressBar.height + bottom;

    this.addChild(this.progressBar);
    this.addChild(this.score);

    this.resize(app.renderer.width, app.screen.height);

    this.prerun();

    gsap.to(
      {},
      {
        onUpdate() {
          progressBar.setValue((1 - this.progress()) * progressBar.max);
        },
        duration: 10,
      },
    );

    app.renderer.addListener("resize", this.resize);
  }

  swap = (initiatorId: string, opponentId: string, x: number, y: number) => {
    const opponent = this.tilesMap.get(opponentId);
    const initiator = this.tilesMap.get(initiatorId);

    if (opponent?.tile && opponent.tile?.startPosition) {
      // opponent.tile.x = opponent.tile.startPosition.x + x;
      // opponent.tile.y = opponent.tile.startPosition.y + y;

      gsap.killTweensOf(opponent.tile);

      gsap.to(opponent.tile, {
        x: opponent.tile.startPosition.x + x,
        y: opponent.tile.startPosition.y + y,
        duration: 0.1,
      });
    }
  };

  swapComplete = (initiatorId: string, opponentId: string) => {
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
      // opponent.tile.x = initiator.tile.startPosition.x;
      // opponent.tile.y = initiator.tile.startPosition.y;

      gsap.killTweensOf(opponent.tile);

      gsap.to(opponent.tile, { x: initiator.tile.startPosition.x, y: initiator.tile.startPosition.y, duration: 0.25 });
    }

    if (initiator && opponent?.tile?.startPosition) {
      // initiator.tile.x = opponent.tile.startPosition.x;
      // initiator.tile.y = opponent.tile.startPosition.y;

      gsap.killTweensOf(initiator.tile);
      gsap.to(initiator.tile, { x: opponent.tile.startPosition.x, y: opponent.tile.startPosition.y, duration: 0.25 });
    }

    if (opponent && initiator) {
      const temp = opponent.tile.startPosition;

      opponent.tile.startPosition = initiator.tile.startPosition;
      initiator.tile.startPosition = temp;
    }

    this.gameCycle();
  };

  fallDown = (initiatorId: string, prerun = false) => {
    const initiator = this.tilesMap.get(initiatorId);

    if (!initiator) {
      return false;
    }

    if (initiator.row >= this.gameField.length - 1) {
      return false;
    }

    const possibleBottomTile = initiator.tile.getNeighbourTileBy(TileDirections.down, initiator.column, initiator.row);

    if (possibleBottomTile) {
      return false;
    }

    const emptyPosition = this.layout[initiator.row + 1][initiator.column];

    this.gameField[initiator.row + 1][initiator.column] = this.gameField[initiator.row][initiator.column];

    this.gameField[initiator.row][initiator.column] = undefined;

    initiator.row += 1;
    initiator.tile.startPosition = emptyPosition;

    gsap.killTweensOf(initiator.tile, "x,y");

    gsap.to(initiator.tile.position, { x: emptyPosition.x, y: emptyPosition.y, duration: prerun ? 0 : 0.25 });

    if (initiator.row + 1 < this.gameField.length && !this.gameField[initiator.row + 1][initiator.column]) {
      this.fallDown(initiatorId, prerun);
    }

    return true;
  };

  swapCancel = (initiatorId: string, opponentId: string) => {
    const opponent = this.tilesMap.get(opponentId);
    const initiator = this.tilesMap.get(initiatorId);

    if (opponent?.tile?.startPosition) {
      // opponent.tile.x = opponent.tile.startPosition.x;
      // opponent.tile.y = opponent.tile.startPosition.y;

      gsap.to(opponent.tile, { x: opponent.tile.startPosition.x, y: opponent.tile.startPosition.y, duration: 0.25 });
    }

    if (initiator?.tile?.startPosition) {
      // initiator.tile.x = initiator.tile.startPosition.x;
      // initiator.tile.y = initiator.tile.startPosition.y;

      gsap.to(initiator.tile, { x: initiator.tile.startPosition.x, y: initiator.tile.startPosition.y, duration: 0.25 });
    }
  };

  private spawnNew(row: number, column: number, prerun = false) {
    const tiles = Object.keys(TileType);

    const type = tiles[getRandomInt(0, tiles.length - 1)] as TileType;

    const el = this.layout[row][column];

    const id = broofa();

    const tile = new Tile(type, id, this.gameField as any); // FIX
    tile.position.x = el.x;
    tile.position.y = el.y;

    tile.startPosition = new Point(tile.position.x, tile.position.y);

    this.gameField[row][column] = { tile: type, id, position: el };

    this.tilesMap.set(id, { tile, row, column });

    this.addChild(tile);

    tile.on("swap", this.swap);
    tile.on("swap-complete", this.swapComplete);
    tile.on("swap-cancel", this.swapCancel);

    gsap.from(tile, { alpha: 0, duration: prerun ? 0 : 0.25 });
    gsap.from(tile.position, { y: `-=${tile.height}`, duration: prerun ? 0 : 0.25 });

    return tile;
  }

  private checkLines() {
    const destroyGroups: GameLine[] = [];

    destroyGroups.push(...this._checkLines("h"));
    destroyGroups.push(...this._checkLines("v"));

    const flat: GameLine = [];

    destroyGroups.forEach((candidate) => {
      candidate.forEach((el) => {
        flat.push(el);
      });
    });

    return { destroyGroups, flat };
  }

  private async spawnToEmpty(prerun = false) {
    let spawning = false;
    for (let i = 0; i < this.fieldHeight; i += 1) {
      for (let u = 0; u < this.fieldWidth; u += 1) {
        const current = this.gameField[i][u];

        if (!current) {
          this.spawnNew(i, u, true);
          spawning = true;
        }
      }
    }

    if (spawning && !prerun) {
      await sleep(0.25);
    }

    return spawning;
  }

  private _checkLines(mode: "h" | "v") {
    // horizontaly
    const destroyGroups: GameLine[] = [];

    const height = mode === "h" ? this.gameField.length : this.gameField[0].length;
    const width = mode === "h" ? this.gameField[0].length : this.gameField.length;

    for (let i = 0; i < height; i += 1) {
      let candidate: GameLine = [];

      for (let u = 0; u < width; u += 1) {
        const current = mode === "h" ? this.gameField[i][u] : this.gameField[u][i];
        const prevCandidate = candidate[candidate.length - 1];

        if (current) {
          if (candidate.length === 0) {
            candidate = [current];
            continue;
          }

          if (prevCandidate?.tile === current.tile) {
            candidate.push(current);
          } else {
            if (candidate.length > 2) {
              destroyGroups.push([...candidate]);
            } else {
              candidate = [current];
            }
          }
        }

        if (u === width - 1 || !current) {
          if (candidate.length > 2) {
            destroyGroups.push([...candidate]);
          }
          candidate = [];
        }

        // if (current && prev?.tile !== current?.tile) {
        //   if (candidate.length > 2) {
        //     destroyGroups.push([...candidate]);
        //   }

        //   candidate = [current];

        //   continue;
        // }

        // if (current && candidate.length === 0) {
        //   candidate.push(current);

        //   continue;
        // }

        // if (current && candidate.length > 0 && prev?.tile === current?.tile) {
        //   candidate.push(current);

        //   continue;
        // }

        // if (!current) {
        //   candidate = [];
        // }
      }
    }

    return destroyGroups;
  }

  async gravity(prerun = false) {
    let gravityWorking = false;

    for (let i = this.gameField.length - 1; i >= 0; i -= 1) {
      for (let u = this.gameField[0].length - 1; u >= 0; u -= 1) {
        const current = this.gameField[i][u];

        if (current) {
          const tile = this.tilesMap.get(current.id);

          if (tile) {
            const canFall = this.fallDown(current.id, prerun);

            if (canFall && !gravityWorking) {
              gravityWorking = true;
            }
          }
        }
      }
    }

    if (gravityWorking && !prerun) {
      await sleep(0.25);
    }

    return gravityWorking;
  }

  private async destroyLines(destroyGroups: GameLine[], prerun = false) {
    if (destroyGroups.length === 0) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      destroyGroups.forEach((candidate) => {
        candidate.forEach((el) => {
          if (!el) return;

          const tile = this.tilesMap.get(el.id);

          if (!tile?.tile) return;

          if (prerun) {
            tile.tile.destroy();
          } else {
            gsap.to(tile.tile, {
              alpha: 0,
              duration: 0.5,
              onComplete: () => {
                tile.tile.destroy();

                this.score.addValue(1);

                resolve();
              },
            });
          }

          this.gameField[tile.row][tile.column] = undefined;
          this.tilesMap.delete(el.id);
        });
      });

      if (prerun) {
        resolve();
      }
    });
  }

  async gameCycle() {
    const { destroyGroups, flat } = this.checkLines();

    this.tilesMap.forEach((tile) => {
      tile.tile.inProgress = true;
    });

    await this.destroyLines(destroyGroups);

    const gravityWorking = await this.gravity();

    if (gravityWorking) {
      await this.gameCycle();

      return;
    }

    const spawnWorking = await this.spawnToEmpty();

    if (spawnWorking) {
      await this.gameCycle();
    }

    this.tilesMap.forEach((tile) => {
      tile.tile.inProgress = false;
    });

    // if empty
  }

  async prerun() {
    const { destroyGroups, flat } = this.checkLines();

    await this.destroyLines(destroyGroups, true);

    const gravityWorking = await this.gravity(true);

    if (gravityWorking) {
      await this.prerun();

      return;
    }

    const spawnWorking = await this.spawnToEmpty(true);

    if (spawnWorking) {
      await this.prerun();
    } else {
      this.gameCycle();
    }

    // if empty
  }

  destroy(options?: boolean | IDestroyOptions | undefined): void {
    super.destroy(options);

    this.app.renderer.removeListener("resize", this.resize);
  }

  resize = (width: number, height: number) => {
    if (this.initialWidth === 0) {
      this.initialWidth = this.width;

      this.progressBar.resize(this.initialWidth);
      this.score.resize(this.initialWidth);
    }

    if (this.initialHeight === 0) {
      this.initialHeight = this.height;
    }

    let scale = 0;

    if (height > width) {
      scale = width / (this.initialWidth + this.initialWidth * 0.2);
    } else {
      scale = height / (this.initialHeight + this.initialHeight * 0.1);
    }

    this.scale.set(scale, scale);

    this.position.x = width / 2 - this.width / 2;
    this.position.y = height / 2 - this.height / 2;
  };
}
