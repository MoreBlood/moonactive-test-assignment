import gsap, { Power2 } from "gsap";
import { Application, Graphics, TextStyle, Text } from "pixi.js";
import { BaseModal } from "./baseModal";

export class Modal extends BaseModal {
  private modalText: Text;

  private textBackground: Graphics;

  constructor(app: Pick<Application, "renderer" | "screen">, public text: string, public closeText: string) {
    super(app, closeText);

    const textStyle = new TextStyle({
      align: "center",
      fill: "#687164",
      fontFamily: "Chango-Regular",
      fontSize: 26,
      lineJoin: "round",
      miterLimit: 2,
      wordWrapWidth: 500,
      stroke: "#1ea7e1",
      whiteSpace: "normal",
      wordWrap: true,
    });

    this.modalText = new Text(text, textStyle);

    this.textBackground = new Graphics();

    this.center.addChild(this.textBackground);
    this.center.addChild(this.modalText);

    this.center.sortableChildren = true;
    this.closeButton.zIndex = 5;

    this.modalText.position.x = this.center.width / 2;
    this.modalText.anchor.x = 0.5;
    this.modalText.anchor.y = 0.5;

    this.resize(app.renderer.width, app.screen.height);
  }

  static createBackground(width: number, height: number, graphics: Graphics, color?: number): Graphics {
    graphics.clear();
    graphics.beginFill(color);

    graphics.lineStyle(4, 0xd5d5d5, 1, 1);
    graphics.drawRoundedRect(0, 0, width, height, 10);
    graphics.lineStyle(1, 0xe2e3e4, 1, 1);
    graphics.beginFill(0xeeeeee);
    graphics.drawRoundedRect(10, height / 2, width - 20, height / 2 - 10, 3);

    graphics.endFill();

    return graphics;
  }

  show(): void {
    super.show();

    gsap.from([this.textBackground.position, this.modalText.position], {
      y: `+=${100}`,
      duration: 0.5,
      ease: Power2.easeInOut,
    });
    gsap.from([this.textBackground, this.modalText], { alpha: 0, duration: 0.5, ease: Power2.easeInOut });
  }

  hide() {
    super.hide();

    gsap.to([this.textBackground.position, this.modalText.position], {
      ease: Power2.easeInOut,
      y: `-=${50}`,
      duration: 0.5,
      delay: 0.1,
    });
    gsap.to([this.textBackground, this.modalText], { alpha: 0, ease: Power2.easeInOut, duration: 0.5, delay: 0.1 });
  }

  redraw(width: number, height: number) {
    super.redraw(width, height);

    this.textBackground.position.x = 400 / 2;

    this.textBackground.pivot.x = (this.modalText.width + 30) / 2;
    this.textBackground.pivot.y = (this.modalText.height + 60) / 2;

    this.textBackground = Modal.createBackground(
      this.modalText.width + 30,
      this.modalText.height + 60,
      this.textBackground,
      0xffffff,
    );
  }

  resize(width: number, height: number) {
    const scale = super.resize(width, height);

    this.modalText.scale.set(1 / scale);
    this.modalText.style.wordWrapWidth = 500 * scale;
    this.modalText.style.fontSize = 26 * scale;

    this.closeButton.position.y = this.textBackground.height / 2 + 30;

    return scale;
  }
}
