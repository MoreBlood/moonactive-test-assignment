import gsap, { Power2 } from "gsap";
import { Application, Container, Graphics, Rectangle } from "../pixi";
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
    this.center.pivot.x = 200;
    this.center.pivot.y = 100;

    this.center.getLocalBounds = function getLocalBounds() {
      const bounds = new Rectangle();
      bounds.width = 400;
      bounds.height = 200;

      return bounds;
    };

    this.addChild(this.background);
    this.addChild(this.center);
    this.center.addChild(this.closeButton);

    this.closeButton.position.x = this.center.width / 2;
    this.closeButton.alpha = 0;
    this.closeButton.interactive = false;

    if (!this.isExtended) {
      this.resize(app.renderer.width, app.screen.height);
    }

    app.renderer.addListener("resize", this.resize.bind(this));

    this.closeButton.on("clicked", this.hide.bind(this));
  }

  get isExtended() {
    // when class is extended, we don't need to call some logic, for example resize
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
    graphics.clear();
    graphics.beginFill(color);
    graphics.drawRoundedRect(0, 0, width, height, 0);
    graphics.endFill();

    return graphics;
  }

  redraw(width: number, height: number) {
    this.background = BaseModal.createFill(width, height, this.background, 0x000000);
  }

  resize(width: number, height: number) {
    this.center.position.x = width / 2;
    this.center.position.y = height / 2;

    let scale = 0;

    const bounds = this.center.getLocalBounds();

    if (height > width) {
      scale = width / (bounds.width + bounds.width * 0.5);
    } else {
      scale = height / bounds.height;
    }

    this.closeButton.buttonText.scaleText(scale);

    this.redraw(width, height);

    this.center.scale.set(scale, scale);

    return scale;
  }
}
