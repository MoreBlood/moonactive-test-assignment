import { TextStyle, Text, ITextStyle } from "pixi.js";

export class ScalableText extends Text {
  private originalStyle: Partial<ITextStyle>;

  _scale = 1;

  constructor(text: string, style: Partial<ITextStyle>) {
    super(text, new TextStyle(style));

    this.originalStyle = { ...style };
  }

  chnageStyle(style: Partial<ITextStyle>) {
    this.originalStyle = { ...this.originalStyle, ...style };

    this.scaleText(this._scale);
  }

  scaleText(scale: number) {
    const propetries = Object.keys(this.originalStyle) as unknown as (keyof ITextStyle)[];

    this._scale = scale;

    this.scale.set(1 / scale);

    propetries.forEach((prop) => {
      const value = this.originalStyle[prop];

      if (typeof value === "number") {
        (this.style as any)[prop] = value * scale;
      } else {
        (this.style as any)[prop] = value;
      }
    });
  }
}
