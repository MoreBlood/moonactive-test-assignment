import { Container, Point } from "../pixi";
import { GameModel } from "../model/GameModel";
import { TileView } from "./TileView";
import { TileModel, TileType } from "../model/TileModel";

export class GameView extends Container {
  initialWidth = 0;

  initialHeight = 0;

  layout: Point[][] = [];

  tileViews = new Map<string, TileView>();

  constructor(private gameModel: GameModel) {
    super();

    this.sortableChildren = true;

    const dummyTile = new TileView(new TileModel(TileType.tileGreen, "id", []));

    for (let i = 0; i < this.gameModel.fieldHeight; i += 1) {
      for (let u = 0; u < this.gameModel.fieldWidth; u += 1) {
        const tileModel = this.gameModel.gameField[i][u]!;

        if (!this.layout[i]) {
          this.layout[i] = [];
        }

        const point = new Point();

        point.x = u * dummyTile.width + dummyTile.width * 0.1 * u;
        point.y = i * dummyTile.height + dummyTile.height * 0.1 * i;

        this.layout[i][u] = point;

        const tileView = new TileView(tileModel);

        tileView.position.x = point.x;
        tileView.position.y = point.y;

        this.addChild(tileView);

        this.tileViews.set(tileModel.id, tileView);
      }
    }
  }
}
