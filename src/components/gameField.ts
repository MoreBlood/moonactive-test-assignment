import { Container, Point } from "../pixi";
import { getRandomInt } from "../helpers/random";
import gsap from "gsap";
import { Tile, TileDirections, TileType } from "./tile";
import sleep from "../helpers/tweenedSleep";
import { broofa } from "../helpers/uuidv4";

export type GameLine = ({ id: string; tile: TileType; position: Point } | undefined)[];

export class GameField extends Container {
  initialWidth = 0;

  initialHeight = 0;

  inProgress = false;

  gameField: GameLine[] = [];

  layout: Point[][] = [];

  private tilesMap = new Map<string, { tile: Tile; row: number; column: number }>();

  constructor(private readonly fieldWidth = 4, private readonly fieldHeight = 4, private inArow = 3) {
    super();

    const tiles = Object.keys(TileType);

    this.sortableChildren = true;

    const dummyTile = new Tile(TileType.tileGreen, "id", this.gameField);

    for (let i = 0; i < fieldHeight; i += 1) {
      for (let u = 0; u < fieldWidth; u += 1) {
        const type = tiles[getRandomInt(0, tiles.length - 1)] as TileType;

        if (!this.gameField[i]) {
          this.gameField[i] = [];
          this.layout[i] = [];
        }

        const point = new Point();

        point.x = u * dummyTile.width + dummyTile.width * 0.1 * u;
        point.y = i * dummyTile.height + dummyTile.height * 0.1 * i;

        this.layout[i][u] = point;

        this.gameField[i][u] = { id: broofa(), tile: type, position: point };
      }
    }

    for (let i = 0; i < fieldHeight; i += 1) {
      for (let u = 0; u < fieldWidth; u += 1) {
        const el = this.gameField[i][u]!;

        const tile = new Tile(el.tile, el.id, this.gameField);
        tile.position.x = el.position.x;
        tile.position.y = el.position.y;

        tile.startPosition = new Point(tile.position.x, tile.position.y);

        this.tilesMap.set(el.id, { tile, row: i, column: u });

        this.addChild(tile);

        tile.on("swap", this.swap);
        tile.on("swap-complete", this.swapComplete);
        tile.on("swap-cancel", this.swapCancel);
      }
    }

    this.prerun();
  }

  /**
   * Call this method when gamefield is out of focus
   */
  public releaseTiles() {
    this.tilesMap.forEach((el) => {
      el.tile.swapCancel();
      el.tile.out();
    });
  }

  private swap = (initiatorId: string, opponentId: string, x: number, y: number) => {
    const opponent = this.tilesMap.get(opponentId);

    if (opponent?.tile && opponent.tile?.startPosition) {
      gsap.killTweensOf(opponent.tile);

      gsap.to(opponent.tile, {
        x: opponent.tile.startPosition.x + x,
        y: opponent.tile.startPosition.y + y,
        duration: 0.1,
      });
    }
  };

  private swapComplete = (initiatorId: string, opponentId: string) => {
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
      gsap.killTweensOf(opponent.tile);
      gsap.to(opponent.tile, { x: initiator.tile.startPosition.x, y: initiator.tile.startPosition.y, duration: 0.25 });
    }

    if (initiator && opponent?.tile?.startPosition) {
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

  private fallDown = (initiatorId: string, prerun = false) => {
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

  private swapCancel = (initiatorId: string, opponentId: string) => {
    const opponent = this.tilesMap.get(opponentId);
    const initiator = this.tilesMap.get(initiatorId);

    if (opponent?.tile?.startPosition) {
      gsap.to(opponent.tile, { x: opponent.tile.startPosition.x, y: opponent.tile.startPosition.y, duration: 0.25 });
    }

    if (initiator?.tile?.startPosition) {
      gsap.to(initiator.tile, { x: initiator.tile.startPosition.x, y: initiator.tile.startPosition.y, duration: 0.25 });
    }
  };

  /**
   * Spanws new tile and attaches listeners
   *
   * @private
   * @param {number} row
   * @param {number} column
   * @param {boolean} [prerun=false] if true, runs without animation and delays
   */
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

  /**
   * Checks lines horizontaly **and** verticaly
   *
   * @private
   */
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

  /**
   * Spawns new tiles to empty space
   *
   * @private
   * @async
   * @param {boolean} [prerun=false] if true, runs without animation and delays
   */
  private async spawnToEmpty(prerun = false) {
    let spawning = false;

    for (let i = 0; i < this.fieldHeight; i += 1) {
      for (let u = 0; u < this.fieldWidth; u += 1) {
        const current = this.gameField[i][u];

        if (!current) {
          this.spawnNew(i, u, prerun);
          spawning = true;
        }
      }
    }

    if (spawning && !prerun) {
      await sleep(0.25);
    }

    return spawning;
  }

  /**
   * Checks for same tiles in gamefield for horizontaly **or** verticaly
   *
   * @private
   * @param {("h" | "v")} mode horizontaly **or** verticaly
   * @returns {{}}
   *
   * @example
   * // with inArow = 3
   * [q][w][e][e][e]
   * [q][w][e][e][e]
   * [e][w][t][r][q]
   * [q][q][e][r][e]
   * [q][r][e][e][q]
   *
   * will result to
   *
   * [q][-][-][-][-]
   * [q][-][-][-][-]
   * [e][-][t][r][q]
   * [q][w][e][r][e]
   * [q][w][e][e][q]
   *
   */
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
            if (candidate.length > this.inArow - 1) {
              destroyGroups.push([...candidate]);
            } else {
              candidate = [current];
            }
          }
        }

        if (u === width - 1 || !current) {
          if (candidate.length > this.inArow - 1) {
            destroyGroups.push([...candidate]);
          }

          candidate = [];
        }
      }
    }

    return destroyGroups;
  }

  /**
   * Repeatably shifts tiles down if possible
   *
   * @async
   * @param {boolean} [prerun=false] if true, runs without animation and delays
   */
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

  /**
   * Destroys tiles and notifies listeners
   *
   * @private
   * @async
   * @param {GameLine[]} destroyGroups what to destroy
   * @param {boolean} [prerun=false] if true, runs without animation and delays
   */
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

                this.emit("scored", 1);

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

  /**
   * Game cycle with animation
   * Constantly tries to find tiles to destroy, calss gravity and spawn new tiles
   *
   * @async
   */
  async gameCycle() {
    const { destroyGroups } = this.checkLines();

    this.emit("proccessing", false);

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

    this.emit("proccessing", true);

    this.tilesMap.forEach((tile) => {
      tile.tile.inProgress = false;
    });
  }

  /**
   * Without animation creates gamefield with no lines to be destroyed
   *
   * @async
   */
  async prerun() {
    const { destroyGroups } = this.checkLines();

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
  }
}
