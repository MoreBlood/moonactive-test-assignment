import gsap, { Power2 } from "gsap";
import { Application, Graphics, TextStyle, Text, Rectangle } from "pixi.js";
import { BaseModal } from "./baseModal";

export class PackshotModal extends BaseModal {
  private modalText: Text;

  private textBackground1: Graphics;
  private textBackground2: Graphics;
  private textBackground3: Graphics;

  private isFail = false;

  constructor(
    app: Pick<Application, "renderer" | "screen">,
    public text: string,
    public failText: string,
    public closeText: string,
  ) {
    super(app, closeText);

    const textStyle = new TextStyle({
      align: "center",
      fill: "#fff",
      fontFamily: "Chango-Regular",
      fontSize: 60,
      lineJoin: "round",
      miterLimit: 2,
      wordWrapWidth: 400,
      lineHeight: 50,
      stroke: "#6750d8",
      whiteSpace: "normal",
      strokeThickness: 15,
      wordWrap: true,
    });

    this.modalText = new Text(text, textStyle);

    this.textBackground1 = new Graphics();
    this.textBackground2 = new Graphics();
    this.textBackground3 = new Graphics();

    this.center.addChild(this.textBackground1);
    this.center.addChild(this.textBackground2);
    this.center.addChild(this.textBackground3);

    this.center.addChild(this.modalText);

    this.center.sortableChildren = true;
    this.closeButton.zIndex = 5;

    this.modalText.position.x = this.center.width / 2;
    this.modalText.position.y = this.center.height / 2;
    this.modalText.anchor.x = 0.5;
    this.modalText.anchor.y = 0.5;

    this.closeButton.visible = false;

    this.center.getLocalBounds = function getLocalBounds() {
      const bounds = new Rectangle();
      bounds.width = 400;
      bounds.height = 800;

      return bounds;
    };

    this.textBackground1.alpha = 0;
    this.textBackground2.alpha = 0;
    this.textBackground3.alpha = 0;

    this.modalText.alpha = 0;

    this.resize(app.renderer.width, app.screen.height);
  }

  createBackground(width: number, graphics: Graphics, color?: number): Graphics {
    graphics.clear();
    graphics.beginFill(color);
    graphics.drawCircle(0, 0, width);

    graphics.endFill();

    return graphics;
  }

  changeType(isFail: boolean) {
    this.isFail = isFail;

    if (this.isFail) {
      this.modalText.style.stroke = "#ab1e1e";
      this.modalText.text = this.failText;
      this.closeButton.visible = true;
    } else {
      this.modalText.style.stroke = "#6750d8";
      this.modalText.text = this.text;
      this.closeButton.visible = false;
    }

    this.redrawBackgrounds();
  }

  show(): void {
    super.show();

    gsap.fromTo(
      [this.textBackground1.scale, this.textBackground2.scale, this.textBackground3.scale],
      { x: 0.25, y: 0.25 },
      { x: 1, y: 1, stagger: 0.1, duration: 0.5, ease: Power2.easeInOut },
    );

    gsap.fromTo(
      [this.textBackground1, this.textBackground2, this.textBackground3, this.modalText],
      { alpha: 0 },
      { alpha: 1, stagger: 0.1, duration: 0.5, ease: Power2.easeInOut },
    );
  }

  hide() {
    super.hide();

    gsap.to([this.textBackground3.scale, this.textBackground2.scale, this.textBackground1.scale], {
      x: 0.25,
      y: 0.25,
      stagger: 0.1,
      duration: 0.5,
      ease: Power2.easeInOut,
    });

    gsap.to([this.modalText, this.textBackground3, this.textBackground2, this.textBackground1], {
      alpha: 0,
      stagger: 0.1,
      duration: 0.5,
      ease: Power2.easeInOut,
    });
  }

  override redraw(width: number, height: number) {
    super.redraw(width, height);

    this.redrawBackgrounds();
  }

  redrawBackgrounds() {
    const colorsSuccess: number[] = [0x5fb13a, 0x88e060, 0x73cd4b];
    const colorsFail: number[] = [0xcd5d12, 0xfa8132, 0xe86a17];

    [this.textBackground1, this.textBackground2, this.textBackground3].forEach((back, i) => {
      back.position.x = 400 / 2;
      back.position.y = 200 / 2;

      back = this.createBackground(200 - i * 20, back, this.isFail ? colorsFail[i] : colorsSuccess[i]);
    });
  }

  resize(width: number, height: number) {
    const scale = super.resize(width, height);

    this.modalText.scale.set(1 / scale);
    this.modalText.style.wordWrapWidth = 400 * scale;
    this.modalText.style.lineHeight = 50 * scale;
    this.modalText.style.fontSize = 60 * scale;
    this.modalText.style.strokeThickness = 15 * scale;

    this.closeButton.position.y = this.textBackground1.height;

    if (height < width) {
      this.center.position.y = height / 2 - height * 0.1;
    } else {
      this.center.position.y = height / 2;
    }

    return scale;
  }
}
