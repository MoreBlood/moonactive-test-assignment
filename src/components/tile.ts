import {
  Application,
  Container,
  IDestroyOptions,
  Texture,
  TilingSprite,
  filters,
  Loader,
  Sprite,
  Point,
  InteractivePointerEvent,
  InteractionData,
} from "pixi.js";

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

export class Tile extends Container {
  private tile: Sprite;
  private background: Sprite;

  private dragging = false;
  private draggingPosition: Point | null = null;
  private parentStartPosition: Point | null = null;

  public startPosition: Point | null = null;
  private prevZIndex = 0;

  private threshold = 30;

  private simpleDirection: "v" | "h" | null = null;
  private direction: TileDirections | null = null;

  constructor(
    readonly type: TileType,
    private readonly id: string,
    private readonly gameField: { id: string; tile: TileType }[][],
  ) {
    super();

    const tileTexture = Loader.shared.resources[type]?.texture;
    const backgroundTexture = Loader.shared.resources["BackTile"]?.texture;

    if (!tileTexture) {
      throw new Error("tile not found");
    }

    if (!backgroundTexture) {
      throw new Error("background texture not found");
    }

    this.tile = Sprite.from(tileTexture, tileTexture);

    this.background = Sprite.from(backgroundTexture, backgroundTexture);

    this.background.scale.set(0.8, 0.8);

    this.tile.position.x = (this.background.texture.width * this.background.scale.x) / 2 - this.tile.texture.width / 2;
    this.tile.position.y =
      (this.background.texture.height * this.background.scale.x) / 2 - this.tile.texture.height / 2;

    // this.tile.anchor.x = 0.5;
    // this.tile.anchor.y = 0.5;

    // this.pivot.x = this.background.texture.width / 2;
    // this.pivot.y = this.background.texture.height / 2;

    this.interactive = true;

    this.addChild(this.background);
    this.addChild(this.tile);

    this.on("pointerdown", this.down);
    this.on("pointermove", this.move);
    this.on("pointerup", this.out);
    this.on("pointerout", this.out);
  }

  get posibleDirections() {
    let row = 0;
    let column = 0;
    let res: TileDirections[] = [];

    for (let i = 0; i < this.gameField.length; i += 1) {
      for (let u = 0; u < this.gameField[0].length; u += 1) {
        if (this.gameField[i][u].id === this.id) {
          row = i;
          column = u;
          break;
        }
      }
    }

    if (row !== 0) {
      res.push(TileDirections.up);
    }
    if (row !== this.gameField.length - 1) {
      res.push(TileDirections.down);
    }
    if (column !== 0) {
      res.push(TileDirections.left);
    }
    if (column !== this.gameField[0].length - 1) {
      res.push(TileDirections.right);
    }

    res = res.filter((dir) => this.getNeighbourTileBy(dir, column, row).tile !== this.type);

    return { directions: res, column, row };
  }

  getNeighbourTileBy(direction: TileDirections, column: number, row: number): { id: string; tile: TileType } {
    switch (direction) {
      case TileDirections.up:
        return this.gameField[row - 1][column];
      case TileDirections.right:
        return this.gameField[row][column + 1];
      case TileDirections.down:
        return this.gameField[row + 1][column];
      case TileDirections.left:
        return this.gameField[row][column - 1];
    }
  }

  down = (e: Event & { data: InteractionData }) => {
    const parentPosition: Point = e.data.getLocalPosition(this.parent);

    const localPosition: Point = e.data.getLocalPosition(this);

    this.draggingPosition = localPosition;
    this.parentStartPosition = parentPosition;

    this.position.x = parentPosition.x - localPosition.x;
    this.position.y = parentPosition.y - localPosition.y;
    this.dragging = true;
    this.prevZIndex = this.zIndex;
    this.zIndex = 1000;

    // this.scale.set(1.2);
  };

  move = (e: Event & { data: InteractionData }) => {
    if (this.dragging && this.draggingPosition && this.parentStartPosition) {
      const parentPosition: Point = e.data.getLocalPosition(this.parent);

      const xMovement = this.parentStartPosition.x - parentPosition.x;
      const yMovement = this.parentStartPosition.y - parentPosition.y;

      const { directions } = this.posibleDirections;

      if (this.simpleDirection === "h") {
        if (directions.includes(TileDirections.left) && xMovement > 0) {
          this.direction = TileDirections.left;
        } else if (directions.includes(TileDirections.right) && xMovement < 0) {
          this.direction = TileDirections.right;
        } else {
          return;
        }
      }
      if (this.simpleDirection === "v") {
        if (directions.includes(TileDirections.up) && yMovement > 0) {
          this.direction = TileDirections.up;
        } else if (directions.includes(TileDirections.down) && yMovement < 0) {
          this.direction = TileDirections.down;
        } else {
          return;
        }
      }

      this.position.x = parentPosition.x - this.draggingPosition.x;
      this.position.y = parentPosition.y - this.draggingPosition.y;

      const thresholdPassedX = Math.abs(xMovement) > this.threshold;
      const thresholdPassedY = Math.abs(yMovement) > this.threshold;

      if ((thresholdPassedX && !this.simpleDirection) || this.simpleDirection === "h") {
        this.simpleDirection = "h";
        this.position.y = this.parentStartPosition.y - this.draggingPosition.y;
      } else if ((thresholdPassedY && !this.simpleDirection) || this.simpleDirection === "v") {
        this.simpleDirection = "v";
        this.position.x = this.parentStartPosition.x - this.draggingPosition.x;
      }

      if (this.direction) {
        const { column, row } = this.posibleDirections;

        if (this.simpleDirection === "h") {
          if (Math.abs(xMovement) > this.width * 0.5) {
            this.emit("swap-complete", this.id, this.getNeighbourTileBy(this.direction, column, row).id, xMovement, 0);
            this.out();
            return;
          }

          this.emit("swap", this.id, this.getNeighbourTileBy(this.direction, column, row).id, xMovement, 0);
        } else if (this.simpleDirection === "v") {
          if (Math.abs(yMovement) > this.height * 0.5) {
            this.emit("swap-complete", this.id, this.getNeighbourTileBy(this.direction, column, row).id, xMovement, 0);
            this.out();
            return;
          }

          this.emit("swap", this.id, this.getNeighbourTileBy(this.direction, column, row).id, 0, yMovement);
        }
      }
    }
  };

  out = (e?: Event & { data: InteractionData }) => {
    if (this.dragging && this.draggingPosition && this.parentStartPosition) {
      if (e) {
        this.position.x = this.parentStartPosition.x - this.draggingPosition.x;
        this.position.y = this.parentStartPosition.y - this.draggingPosition.y;

        if (this.direction) {
          const { column, row } = this.posibleDirections;

          this.emit("swap-cancel", this.id, this.getNeighbourTileBy(this.direction, column, row).id);
        }
      }

      this.dragging = false;
      this.draggingPosition = null;
      this.parentStartPosition = null;
      this.simpleDirection = null;
      this.zIndex = this.prevZIndex;
      this.direction = null;
      this.scale.set(1);
    }
  };
}
