import gsap from "gsap";
import { TileDirections, TileModel } from "../model/TileModel";
import { EventEmitter, InteractionData, Point } from "../pixi";
import { TileView, TileViewEvents } from "../view/TileView";

export enum TileControllerEvents {
  "swap-complete" = "swap-complete",
  swap = "swap",
  "swap-cancel" = "swap-cancel",
  tileDestroyed = "tileDestroyed",
}

export class TileController extends EventEmitter {
  private dragging = false;

  private draggingPosition: Point | null = null;

  private parentStartPosition: Point | null = null;

  private prevZIndex = 0;

  private threshold = 30; // TODO settings

  private simpleDirection: "v" | "h" | null = null;

  private direction: TileDirections | null = null;

  public inProgress = false;

  constructor(private tileModel: TileModel, private tileView: TileView, public startPosition: Point) {
    super();

    this.tileView.on("pointerdown", this.down);
    this.tileView.on("pointermove", this.move);
    this.tileView.on("pointerup", this.out);
    this.tileView.on("pointerout", this.out);
    this.tileView.on("pointerupoutside", this.out);
    this.tileView.on(TileViewEvents.tileDestroyed, this.onTileDestroyed);
  }

  shift = (x: number, y: number) => {
    if (this.startPosition) {
      gsap.killTweensOf(this.tileView.position);

      gsap.to(this.tileView.position, {
        x: this.startPosition.x + x,
        y: this.startPosition.y + y,
        duration: 0.1,
      });
    }
  };

  kill(prerun: boolean) {
    if (prerun) {
      this.tileView.destroy();
    } else {
      this.tileView.destroyTile();
    }
  }

  onTileDestroyed = (x: number, y: number) => {
    this.emit(TileControllerEvents.tileDestroyed, x, y);
  };

  translate(point: Point, prerun = false) {
    gsap.killTweensOf(this.tileView.position);
    gsap.to(this.tileView.position, { x: point.x, y: point.y, duration: prerun ? 0 : 0.25 });

    this.startPosition = point;
  }

  translateToStartPosition(prerun = false) {
    gsap.killTweensOf(this.tileView.position);
    gsap.to(this.tileView.position, {
      x: this.startPosition?.x,
      y: this.startPosition?.y,
      duration: prerun ? 0 : 0.25,
    });
  }

  spawnAnimation(prerun = false) {
    gsap.killTweensOf(this.tileView.position);
    gsap.from(this.tileView, { alpha: 0, duration: prerun ? 0 : 0.25 });
    gsap.from(this.tileView.position, { y: `-=${this.tileView.height}`, duration: prerun ? 0 : 0.25 });
  }

  down = (e: Event & { data: InteractionData }) => {
    if (this.inProgress) return;

    const parentPosition: Point = e.data.getLocalPosition(this.tileView.parent);

    const localPosition: Point = e.data.getLocalPosition(this.tileView);

    this.draggingPosition = localPosition;
    this.parentStartPosition = parentPosition;

    this.tileView.position.x = parentPosition.x - localPosition.x;
    this.tileView.position.y = parentPosition.y - localPosition.y;
    this.dragging = true;
    this.prevZIndex = this.tileView.zIndex;
    this.tileView.zIndex = 1000;
  };

  move = (e: Event & { data: InteractionData }) => {
    if (this.inProgress) return;

    if (this.dragging && this.draggingPosition && this.parentStartPosition) {
      const parentPosition: Point = e.data.getLocalPosition(this.tileView.parent);

      const xMovement = this.parentStartPosition.x - parentPosition.x;
      const yMovement = this.parentStartPosition.y - parentPosition.y;

      const { directions } = this.tileModel.posibleDirections;

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

      this.tileView.position.x = parentPosition.x - this.draggingPosition.x;
      this.tileView.position.y = parentPosition.y - this.draggingPosition.y;

      const thresholdPassedX = Math.abs(xMovement) > this.threshold;
      const thresholdPassedY = Math.abs(yMovement) > this.threshold;

      if ((thresholdPassedX && !this.simpleDirection) || this.simpleDirection === "h") {
        this.simpleDirection = "h";
        this.tileView.position.y = this.parentStartPosition.y - this.draggingPosition.y;
      } else if ((thresholdPassedY && !this.simpleDirection) || this.simpleDirection === "v") {
        this.simpleDirection = "v";
        this.tileView.position.x = this.parentStartPosition.x - this.draggingPosition.x;
      }

      if (this.direction) {
        const neighbour = this.tileModel.getNeighbourTileBy(this.direction);

        if (this.simpleDirection === "h" && neighbour) {
          if (Math.abs(xMovement) > this.tileView.width * 0.5) {
            this.emit(TileControllerEvents["swap-complete"], this.tileModel.id, neighbour.id, xMovement, 0);
            this.out();

            return;
          }

          this.emit("swap", this.tileModel.id, neighbour.id, xMovement, 0);
        } else if (this.simpleDirection === "v" && neighbour) {
          if (Math.abs(yMovement) > this.tileView.height * 0.5) {
            this.emit(TileControllerEvents["swap-complete"], this.tileModel.id, neighbour.id, xMovement, 0);
            this.out();

            return;
          }

          this.emit(TileControllerEvents.swap, this.tileModel.id, neighbour.id, 0, yMovement);
        }
      }
    }
  };

  swapCancel() {
    this.dragging = false;

    if (this.direction) {
      const neighbour = this.tileModel.getNeighbourTileBy(this.direction);

      if (neighbour && neighbour.type !== this.tileModel.type) {
        this.emit(TileControllerEvents["swap-cancel"], this.tileModel.id, neighbour.id);
      }
    }
  }

  out = (e?: Event & { data: InteractionData }) => {
    if (this.dragging && this.startPosition) {
      if (e && this.direction) {
        this.swapCancel();
      } else if (e) {
        this.tileView.position.x = this.startPosition.x;
        this.tileView.position.y = this.startPosition.y;
      }
    } else if (this.startPosition) {
      this.tileView.position.x = this.startPosition.x;
      this.tileView.position.y = this.startPosition.y;
    }

    this.reset();
  };

  reset() {
    this.dragging = false;
    this.draggingPosition = null;
    this.parentStartPosition = null;
    this.simpleDirection = null;
    this.tileView.zIndex = this.prevZIndex;
    this.direction = null;
  }
}
