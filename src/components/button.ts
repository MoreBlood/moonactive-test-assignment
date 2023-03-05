import gsap from "gsap";
import { Container, Graphics, GraphicsGeometry, TextStyle } from "../pixi";
import { AbstractButton } from "./abstract/abstractButton";
import { ScalableText } from "./scalableText";

export class Button extends Container implements AbstractButton {
  public buttonText: ScalableText;

  private background: Graphics;

  private isOver = false;

  constructor(public text: string) {
    super();

    const buttonStyle = new TextStyle({
      fill: "#ffffff",
      fontFamily: "Chango-Regular",
      lineJoin: "round",
      miterLimit: 2,
      fontSize: 50,
      stroke: "#1ea7e1",
    });

    const PADDING = 10;

    this.buttonText = new ScalableText(text, buttonStyle);
    this.buttonText.position.x = PADDING * 4;
    this.buttonText.position.y = PADDING / 2;

    this.background = new Graphics();

    this.redraw(this.buttonText.width + PADDING * 8, this.buttonText.height + PADDING);

    this.addChild(this.background);
    this.addChild(this.buttonText);
    this.interactive = true;

    this.pivot.x = this.width / 2;
    this.pivot.y = this.height / 2;
    this.cursor = "pointer";

    this.on("pointerdown", this.onClick);
    this.on("pointerup", this.up);
    this.on("pointerout", this.out);
  }

  static createRoundedRectangle(width: number, height: number, geometry?: GraphicsGeometry, color?: number): Graphics {
    const graphics = new Graphics(geometry);

    graphics.clear();

    graphics.lineStyle(4, 0x47832c, 1, 1);
    graphics.beginFill(0x47832c);
    graphics.drawRoundedRect(4, 8, width, height, 10);
    graphics.beginFill(color);
    graphics.lineStyle(4, 0x5fb13a, 1, 1);
    graphics.drawRoundedRect(4, 0, width, height, 10);
    graphics.endFill();

    return graphics;
  }

  onClick = (): void => {
    this.isOver = true;
    gsap.to(this.scale, { x: 0.95, y: 0.95, duration: 0.2 });
  };

  over = (): void => {
    this.isOver = true;
    gsap.to(this.scale, { x: 1.05, y: 1.05, duration: 0.2 });
  };

  up = (): void => {
    if (this.isOver) {
      this.emit("clicked");
    }
  };

  out = (): void => {
    this.isOver = false;
    gsap.killTweensOf(this.scale);
    gsap.to(this.scale, { x: 1, y: 1, duration: 0.2 });
  };

  redraw(width: number, height: number) {
    this.background = Button.createRoundedRectangle(width, height, this.background.geometry, 0x81da59);
  }
}
