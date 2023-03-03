import {
  Application,
  Container,
  IDestroyOptions,
  Texture,
  TilingSprite,
  filters,
  Loader,
  Sprite,
  RoundedRectangle,
  Graphics,
  GraphicsGeometry,
  TextStyle,
  Text,
} from "pixi.js";
import { AbstractScoreBar } from "./abstract/abstractScoresBar";

export class ScoreBar extends Container implements AbstractScoreBar {
  private total: Text;

  private score: Text;

  private background: Graphics;

  constructor(public current: number = 0) {
    super();

    const totalStyle = new TextStyle({
      fill: "#ffffff",
      fontFamily: "Chango-Regular",
      lineJoin: "round",
      miterLimit: 2,
      fontSize: 150,
      stroke: "#1ea7e1",
      strokeThickness: 20,
    });

    const scoreStyle = new TextStyle({
      fill: "#1ea7e1",
      fontFamily: "Chango-Regular",
      lineJoin: "round",
      miterLimit: 2,
      align: "center",
      fontSize: 100,
    });
    this.total = new Text("TOTAL", totalStyle);
    this.score = new Text(` ${this.current} `, scoreStyle);
    // this.score.anchor.x = 0.5;
    // this.score.anchor.y = 0.5;

    this.score.position.x = this.total.width + 100;
    this.score.position.y = this.total.height / 2 - this.score.height / 2;

    this.background = new Graphics();

    this.addChild(this.total);
    this.addChild(this.background);
    this.addChild(this.score);
  }

  static createRoundedRectangle(width: number, height: number, geometry?: GraphicsGeometry, color?: number): Graphics {
    const graphics = new Graphics(geometry);

    graphics.clear();
    graphics.beginFill(color);
    graphics.lineStyle(10, 0xdddddd, 1, 1);
    graphics.drawRoundedRect(0, 0, width, height, 25);
    graphics.endFill();

    return graphics;
  }

  setValue(value: number): void {
    this.score.text = ` ${this.current} `;
    this.current = value;
    this.redraw();
  }

  addValue(value: number): void {
    this.current += value;
    this.score.text = ` ${this.current} `;
    this.redraw();
  }

  redraw() {
    const rectWidth = this.score.width;
    const rectHeight = this.score.height;

    this.background.position.x = this.score.position.x;
    this.background.position.y = this.score.position.y;

    this.background = ScoreBar.createRoundedRectangle(rectWidth, rectHeight, this.background.geometry, 0xffffff);
  }

  public resize(width: number) {
    const scale = width / (this.width * 2);

    this.scale.set(scale, scale);

    this.redraw();
  }
}
