import { Container, Graphics, GraphicsGeometry } from "../pixi";
import { AbstractProgressBar } from "./abstract/abstractProgressBar";

export class ProgressBar extends Container implements AbstractProgressBar {
  current = 0;

  private background: Graphics;

  private progress: Graphics;

  constructor(public max: number, private _current: number | null) {
    super();

    this.current = _current === null ? this.max : _current;

    this.background = new Graphics();
    this.progress = new Graphics();

    this.addChild(this.background);
    this.addChild(this.progress);
  }

  static createRoundedRectangle(width: number, geometry?: GraphicsGeometry, color?: number): Graphics {
    const rect = new Graphics(geometry);

    rect.clear();
    rect.beginFill(color);

    rect.drawRoundedRect(0, 0, width, 30, 15);
    rect.endFill();

    return rect;
  }

  public setValue(value: number): void {
    this.current = value;
    this.resize(this.width);
  }

  public resize(width: number) {
    this.background = ProgressBar.createRoundedRectangle(width, this.background.geometry, 0xffffff);

    this.progress = ProgressBar.createRoundedRectangle(
      width * (this.current / this.max),
      this.progress.geometry,
      0x80be1f,
    );
  }
}
