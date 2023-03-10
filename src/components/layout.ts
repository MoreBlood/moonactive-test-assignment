import gsap from "gsap";
import { GameController, GameControllerEvents } from "../controller/GameController";
import { Application, Container } from "../pixi";
import { AbstractProgressBar } from "./abstract/abstractProgressBar";
import { AbstractScoreBar } from "./abstract/abstractScoresBar";
import { GameField } from "./gameField";
import { ProgressBar } from "./progressBar";
import { ScoreBar } from "./score";

export class Layout extends Container {
  initialWidth = 0;

  initialHeight = 0;

  public progressBar: AbstractProgressBar;

  public score: AbstractScoreBar;

  public gameField: GameController;

  private progressTween?: gsap.core.Tween;

  constructor(private readonly app: Pick<Application, "renderer" | "screen">) {
    super();

    this.sortableChildren = true;

    this.score = new ScoreBar(0);
    this.score.zIndex = 2;

    this.progressBar = new ProgressBar(10, 10);

    this.gameField = new GameController();
    this.gameField.prerun();

    this.addChild(this.score);
    this.addChild(this.gameField.gameView);
    this.addChild(this.progressBar);

    this.resize(app.renderer.width, app.renderer.height);

    this.gameField.on(GameControllerEvents.proccessing, (done) => this.updateInProgress(done));
    this.gameField.on("scored", (score) => this.scored(score));

    app.renderer.addListener("resize", this.resize);
  }

  private updateInProgress(done: false) {
    if (done) {
      this.progressTween?.resume();
    } else {
      this.progressTween?.pause();
    }
  }

  private scored(score: number) {
    this.score.addValue(score);
  }

  public async start() {
    const progressBar = this.progressBar;

    this.progressTween = gsap.to(
      {},
      {
        onUpdate() {
          progressBar.setValue((1 - this.progress()) * progressBar.max);
        },
        onComplete: () => {
          this.emit("end-time");
          this.gameField.releaseTiles();
        },
        duration: 10,
      },
    );
  }

  public async restart() {
    this.start();
  }

  resize = (width: number, height: number) => {
    if (this.initialWidth === 0) {
      this.initialWidth = this.width;

      this.progressBar.resize(this.initialWidth);
      this.score.resize(this.initialWidth);
    }

    this.gameField.gameView.position.y = this.score.height + 50;
    this.progressBar.position.y = this.gameField.gameView.height + this.gameField.gameView.position.y + 70;

    if (this.initialHeight === 0) {
      this.initialHeight = this.height;
    }

    let scale = 0;

    if (height > width) {
      scale = width / (this.initialWidth + this.initialWidth * 0.2);
    } else {
      scale = height / (this.initialHeight + this.initialHeight * 0.1);
    }

    this.scale.set(scale);

    this.position.x = width / 2 - this.width / 2;
    this.position.y = height / 2 - this.height / 2;
  };
}
