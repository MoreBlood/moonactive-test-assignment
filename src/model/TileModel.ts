import { GameLine } from "./GameModel";

export enum TileType {
  tileGreen = "tileGreen",
  tileOrange = "tileOrange",
  tilePink = "tilePink",
  tileRed = "tileRed",
  tileYellow = "tileYellow",
}

export enum TileDirections {
  up = "up",
  right = "right",
  down = "down",
  left = "left",
}

export class TileModel {
  constructor(readonly type: TileType, readonly id: string, private readonly gameField: GameLine[]) {}

  public get row() {
    let row = -1;

    for (let i = 0; i < this.gameField.length; i += 1) {
      for (let u = 0; u < this.gameField[0].length; u += 1) {
        if (this.gameField[i][u]?.id === this.id) {
          row = i;
          break;
        }
      }
    }

    return row;
  }

  public get column() {
    let column = -1;

    for (let i = 0; i < this.gameField.length; i += 1) {
      for (let u = 0; u < this.gameField[0].length; u += 1) {
        if (this.gameField[i][u]?.id === this.id) {
          column = u;
          break;
        }
      }
    }

    return column;
  }

  get posibleDirections() {
    let res: TileDirections[] = [];

    if (this.row !== 0) {
      res.push(TileDirections.up);
    }

    if (this.row !== this.gameField.length - 1) {
      res.push(TileDirections.down);
    }

    if (this.column !== 0) {
      res.push(TileDirections.left);
    }

    if (this.column !== this.gameField[0].length - 1) {
      res.push(TileDirections.right);
    }

    res = res.filter((dir) => {
      const neighbour = this.getNeighbourTileBy(dir);

      return neighbour && neighbour.type !== this.type;
    });

    return { directions: res };
  }

  public getNeighbourTileBy(direction: TileDirections) {
    switch (direction) {
      case TileDirections.up:
        return this.gameField[this.row - 1]?.[this.column];
      case TileDirections.right:
        return this.gameField[this.row]?.[this.column + 1];
      case TileDirections.down:
        return this.gameField[this.row + 1]?.[this.column];
      case TileDirections.left:
        return this.gameField[this.row]?.[this.column - 1];
    }
  }
}
