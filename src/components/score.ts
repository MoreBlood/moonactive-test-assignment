import { Container, Graphics, TextStyle } from "../pixi";
import { AbstractScoreBar } from "./abstract/abstractScoresBar";
import { ScalableText } from "./scalableText";

export class ScoreBar extends Container implements AbstractScoreBar {
  private total: ScalableText;

  private score: ScalableText;

  private background: Graphics;

  private arrow: Graphics;

  constructor(public current: number = 0, text: string) {
    super();

    const totalStyle = new TextStyle({
      fill: "#ffffff",
      fontFamily: "Chango-Regular",
      lineJoin: "round",
      miterLimit: 2,
      fontSize: 15,
      stroke: "#1ea7e1",
      strokeThickness: 2,
    });

    const scoreStyle = new TextStyle({
      fill: "#1ea7e1",
      fontFamily: "Chango-Regular",
      lineJoin: "round",
      miterLimit: 2,
      align: "center",
      fontSize: 10,
    });

    this.total = new ScalableText(text, totalStyle);
    this.score = new ScalableText(` ${this.current} `, scoreStyle);

    this.background = new Graphics();
    this.arrow = new Graphics();

    this.addChild(this.total);
    this.addChild(this.background);
    this.addChild(this.arrow);
    this.addChild(this.score);
  }

  static createRoundedRectangle(width: number, height: number, graphics: Graphics, color?: number): Graphics {
    graphics.clear();
    graphics.beginFill(color);
    graphics.lineStyle(1, 0xdddddd, 1, 1);
    graphics.drawRoundedRect(0, 0, width, height, 2);
    graphics.endFill();

    return graphics;
  }

  static createArrow(width: number, height: number, graphics: Graphics, color?: number): Graphics {
    const shape = [
      { x: 0, y: 0 },
      { x: width * 0.75, y: 0 },
      { x: width, y: height * 0.5 },
      { x: width * 0.75, y: height },
      { x: 0, y: height },
    ];

    graphics.clear();
    graphics.beginFill(color);
    graphics.lineStyle(2, 0x999999, 1, 1);
    graphics.drawPolygon(shape);
    graphics.lineStyle(1, 0xffffff, 1, 1);
    graphics.drawPolygon(shape);
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

    this.arrow.position.x = 1;
    this.arrow.position.y = this.score.position.y + 5;

    this.background = ScoreBar.createRoundedRectangle(rectWidth, rectHeight + 1, this.background, 0xffffff);
    this.arrow = ScoreBar.createArrow(7, 4, this.arrow, 0xeeeeee);
  }

  public resize(width: number) {
    this.total.position.x = 12;

    this.score.position.x = this.total.width + 5 + this.total.position.x;
    this.score.position.y = this.total.height / 2 - this.score.height / 2;

    const scale = (width / this.width) * 0.45;

    this.scale.set(scale);
    this.total.scaleText(scale);
    this.score.scaleText(scale);

    this.redraw();
  }
}
