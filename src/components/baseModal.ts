import gsap, { Power2, Power3, Power4 } from "gsap";
import { Application, Container, Graphics, Rectangle } from "pixi.js";
import { AbstractButton } from "./abstract/abstractButton";
import { AbstractModal } from "./abstract/abstractModal";
import { Button } from "./button";

export class BaseModal extends Container implements AbstractModal {
  public closeButton: AbstractButton;

  private background: Graphics;

  public center: Container;

  constructor(private readonly app: Pick<Application, "renderer" | "screen">, public closeText: string) {
    super();

    this.closeButton = new Button(closeText);

    this.background = new Graphics();
    this.background.alpha = 0;
    this.center = new Container();

    this.addChild(this.background);

    this.addChild(this.center);

    this.center.addChild(this.closeButton);

    this.center.getLocalBounds = function getLocalBounds() {
      const bounds = new Rectangle();
      bounds.width = 400;
      bounds.height = 200;

      return bounds;
    };

    this.center.pivot.x = 200;
    this.center.pivot.y = 100;

    this.closeButton.position.x = this.center.width / 2;

    if (!this.isExtended) {
      this.resize(app.renderer.width, app.screen.height);
    }

    app.renderer.addListener("resize", this.resize.bind(this));

    this.closeButton.alpha = 0;
    this.closeButton.interactive = false;

    this.closeButton.on("clicked", this.hide.bind(this));
  }

  get isExtended() {
    return Object.getPrototypeOf(this) !== BaseModal.prototype;
  }

  show(): void {
    this.closeButton.interactive = false;
    this.background.interactive = true;

    gsap.fromTo(this.background, { alpha: 0 }, { alpha: 0.5, ease: Power2.easeInOut });

    gsap.fromTo(
      this.closeButton.scale,
      { x: 0.25, y: 0.25 },
      { x: 1, y: 1, duration: 0.5, ease: Power2.easeInOut, delay: 0.4 },
    );
    gsap.fromTo(this.closeButton, { alpha: 0 }, { alpha: 1, duration: 0.5, ease: Power2.easeInOut, delay: 0.4 });

    gsap.delayedCall(0.9, () => {
      this.closeButton.interactive = true;
    });
  }

  hide() {
    this.closeButton.interactive = false;
    this.background.interactive = true;

    gsap.to(this.background, { alpha: 0, delay: 0.4, ease: Power2.easeInOut });

    gsap.killTweensOf(this.closeButton);

    gsap.to(this.closeButton.scale, { x: 0.25, y: 0.25, duration: 0.3, ease: Power2.easeInOut });
    gsap.to(this.closeButton, { alpha: 0, duration: 0.3, ease: Power2.easeInOut });

    gsap.delayedCall(1, () => {
      this.background.interactive = false;
      this.emit("hidden");
    });
  }

  static createFill(width: number, height: number, graphics: Graphics, color?: number): Graphics {
    // const graphics = new Graphics(geometry);

    graphics.clear();
    graphics.beginFill(color);
    graphics.drawRoundedRect(0, 0, width, height, 0);
    graphics.endFill();

    return graphics;
  }

  redraw(width: number, height: number) {
    // this.background.alpha = 0.5;
    this.background = BaseModal.createFill(width, height, this.background, 0x000000);
  }

  resize(width: number, height: number) {
    // const scale = width / (this.width * 2);

    // this.scale.set(scale, scale);

    this.center.position.x = width / 2;
    this.center.position.y = height / 2;

    // this.redraw(width, height);

    let scale = 0;

    const bounds = this.center.getLocalBounds();

    // console.log(bounds);

    if (height > width) {
      scale = width / (bounds.width + bounds.width * 0.5);
    } else {
      scale = height / bounds.height;
    }

    this.closeButton.buttonText.scale.set(1 / scale);
    this.closeButton.buttonText.style.fontSize = 50 * scale;

    this.redraw(width, height);

    this.center.scale.set(scale, scale);

    return scale;
  }
}
