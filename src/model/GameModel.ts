import { getRandomInt } from "../helpers/random";
import { broofa } from "../helpers/uuidv4";
import { TileModel, TileType } from "./TileModel";

export type GameLine = (TileModel | undefined)[];

export class GameModel {
  gameField: GameLine[] = [];

  tilesMap = new Map<string, TileModel>();

  constructor(readonly fieldWidth = 4, readonly fieldHeight = 4, readonly inArow = 3) {
    this.initGameField();
  }

  private initGameField() {
    for (let i = 0; i < this.fieldHeight; i += 1) {
      for (let u = 0; u < this.fieldWidth; u += 1) {
        if (!this.gameField[i]) {
          this.gameField[i] = [];
        }

        this.spawnNew(i, u);
      }
    }
  }

  /**
   * Spanws new tile and attaches listeners
   *
   * @private
   * @param {number} row
   * @param {number} column
   * @param {boolean} [prerun=false] if true, runs without animation and delays
   */
  public spawnNew(row: number, column: number) {
    const tiles = Object.keys(TileType);

    const type = tiles[getRandomInt(0, tiles.length - 1)] as TileType;

    const id = broofa();

    const tile = new TileModel(type, id, this.gameField);

    this.gameField[row][column] = tile;

    this.tilesMap.set(id, tile);

    return tile;
  }
}
