import { GameLine } from "../model/GameModel";
import { TileDirections } from "../model/TileModel";
import sleep from "../helpers/tweenedSleep";
import { GameModel } from "../model/GameModel";
import { EventEmitter } from "../pixi";
import { Settings } from "../config";

export enum GameServiceEvents {
  "tile-destroyed" = "tile-destroyed",
  "tile-spawned" = "tile-spawned",
  "tile-gravity" = "tile-gravity",
}

export class GameService extends EventEmitter {
  constructor(private gameModel: GameModel) {
    super();
  }

  private get fieldHeight() {
    return this.gameModel.fieldHeight;
  }

  private get fieldWidth() {
    return this.gameModel.fieldWidth;
  }

  private get gameField() {
    return this.gameModel.gameField;
  }

  private get tilesMap() {
    return this.gameModel.tilesMap;
  }

  private get inArow() {
    return this.gameModel.inArow;
  }

  /**
   * Spawns new tiles to empty space
   *
   * @public
   * @async
   * @param {boolean} [prerun=false] if true, runs without animation and delays
   */
  public async spawnToEmpty(prerun = false) {
    let spawning = false;

    for (let i = 0; i < this.fieldHeight; i += 1) {
      for (let u = 0; u < this.fieldWidth; u += 1) {
        const current = this.gameField[i][u];

        if (!current) {
          const tileModel = this.gameModel.spawnNew(i, u);

          this.emit(GameServiceEvents["tile-spawned"], tileModel.id, prerun);

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
   * Repeatably shifts tiles down if possible
   *
   * @async
   * @param {boolean} [prerun=false] if true, runs without animation and delays
   */
  public async gravity(prerun = false) {
    let gravityWorking = false;

    for (let i = this.gameField.length - 1; i >= 0; i -= 1) {
      for (let u = this.gameField[0].length - 1; u >= 0; u -= 1) {
        const current = this.gameField[i][u];

        if (current) {
          const canFall = this.fallDown(current.id, prerun);

          if (canFall && !gravityWorking) {
            gravityWorking = true;
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
   * @public
   * @async
   * @param {GameLine[]} destroyGroups what to destroy
   * @param {boolean} [prerun=false] if true, runs without animation and delays
   */
  public async destroyLines(destroyGroups: GameLine[], prerun = false) {
    if (destroyGroups.length === 0) {
      return;
    }

    destroyGroups.forEach((candidate) => {
      candidate.forEach((tileModel) => {
        if (!tileModel) return;

        if (tileModel.row === -1 || tileModel.column === -1) {
          // already destroyed by crossing
          return;
        }

        this.gameField[tileModel.row][tileModel.column] = undefined;
        this.tilesMap.delete(tileModel.id);
        this.emit(GameServiceEvents["tile-destroyed"], tileModel.id, prerun);
      });
    });

    if (!prerun) {
      await sleep(Settings.animations.destroy);
    }
  }

  /**
   * When user passes threshold
   * Swaps elements with animation and mutates gamefield
   *
   * @param {string} initiatorId from tile
   * @param {string} opponentId to tile
   */
  public swap = (initiatorId: string, opponentId: string) => {
    const opponent = this.tilesMap.get(opponentId);
    const initiator = this.tilesMap.get(initiatorId);

    //swap in original array
    if (opponent && initiator) {
      const { row: rowO, column: columnO } = opponent;
      const { row: rowI, column: columnI } = initiator;

      this.gameField[rowI][columnI] = opponent;
      this.gameField[rowO][columnO] = initiator;
    }

    // swap in view
    // run game cycle
  };

  /**
   * Moves constantly tile down
   *
   * @param {string} initiatorId from tile
   * @param {boolean} [prerun=false] if true, runs without animation and delays
   * @returns {boolean} if move down is possible
   */
  private fallDown = (initiatorId: string, prerun = false) => {
    const initiator = this.tilesMap.get(initiatorId);

    if (!initiator) {
      return false;
    }

    if (initiator.row >= this.gameField.length - 1) {
      return false;
    }

    const possibleBottomTile = initiator.getNeighbourTileBy(TileDirections.down);

    if (possibleBottomTile) {
      return false;
    }

    const { row, column } = initiator;

    this.gameField[row + 1][column] = initiator;

    this.gameField[row][column] = undefined;

    if (initiator.row + 1 < this.gameField.length && !this.gameField[initiator.row + 1][initiator.column]) {
      this.fallDown(initiatorId, prerun);
    } else {
      this.emit(GameServiceEvents["tile-gravity"], initiatorId, prerun);
    }

    return true;
  };

  /**
   * Checks lines horizontaly **and** verticaly
   *
   * @public
   */
  public checkLines() {
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

          if (prevCandidate?.type === current.type) {
            candidate.push(current);
          } else {
            // breaking chain
            if (candidate.length > this.inArow - 1) {
              destroyGroups.push([...candidate]);
              candidate = [];
            } else {
              candidate = [current];
            }

            continue;
          }
        }

        // last check
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
}
