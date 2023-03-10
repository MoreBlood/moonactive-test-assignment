import { EventEmitter } from "@pixi/utils";
import { Settings } from "../config";
import { GameModel } from "../model/GameModel";
import { GameService, GameServiceEvents } from "../services/GameService";
import { GameView } from "../view/GameView";
import { TileView } from "../view/TileView";
import { TileController, TileControllerEvents } from "./TileController";

export enum GameControllerEvents {
  proccessing = "proccessing",
}

export class GameController extends EventEmitter {
  private inProgress = false;

  private gameModel: GameModel;

  private gameService: GameService;

  gameView: GameView;

  tileControllers = new Map<string, TileController>();

  constructor() {
    super();

    this.gameModel = new GameModel(Settings.gamefield.width, Settings.gamefield.height, Settings.gamefield.inArow);
    this.gameView = new GameView(this.gameModel);

    this.gameView.tileViews.forEach((tileView) => {
      const startPosition = this.gameView.layout[tileView.tileModel.row][tileView.tileModel.column];
      const tileController = new TileController(tileView.tileModel, tileView, startPosition);

      tileController.on(TileControllerEvents.swap, this.swap);
      tileController.on(TileControllerEvents["swap-cancel"], this.swapCancel);
      tileController.on(TileControllerEvents["swap-complete"], this.swapComplete);

      this.tileControllers.set(tileView.tileModel.id, tileController);
    });

    this.gameService = new GameService(this.gameModel);

    this.gameService.on(GameServiceEvents["tile-destroyed"], this.tileDestroyed);
    this.gameService.on(GameServiceEvents["tile-spawned"], this.tileSpawned);
    this.gameService.on(GameServiceEvents["tile-gravity"], this.tileGravity);
  }

  private get gameField() {
    return this.gameModel.gameField;
  }

  /**
   * When swap is avalible and user holds pointer
   *
   * @param {string} initiatorId from tile
   * @param {string} opponentId to tile
   * @param {number} x current state
   * @param {number} y current state
   */
  private swap = (initiatorId: string, opponentId: string, x: number, y: number) => {
    const opponent = this.tileControllers.get(opponentId);

    if (opponent) {
      opponent.shift(x, y);
    }
  };

  /**
   * When user passes threshold
   * Swaps elements with animation and mutates gamefield
   *
   * @param {string} initiatorId from tile
   * @param {string} opponentId to tile
   */
  private swapComplete = (initiatorId: string, opponentId: string) => {
    const opponent = this.tileControllers.get(opponentId);
    const initiator = this.tileControllers.get(initiatorId);

    this.gameService.swap(initiatorId, opponentId);

    if (opponent && initiator) {
      const temp = initiator.startPosition;

      initiator.translate(opponent.startPosition);
      opponent.translate(temp);
    }

    this.gameCycle();
  };

  /**
   * When user releases pointer not passing swap threshold
   *
   * @param {string} initiatorId from tile
   * @param {string} opponentId to tile
   */
  private swapCancel = (initiatorId: string, opponentId: string) => {
    const opponent = this.tileControllers.get(opponentId);
    const initiator = this.tileControllers.get(initiatorId);

    if (opponent && initiator) {
      opponent.translateToStartPosition();
      initiator.translateToStartPosition();
    }
  };

  private tileDestroyed = (initiatorId: string, prerun: boolean) => {
    const initiator = this.tileControllers.get(initiatorId);

    if (initiator) {
      initiator.kill(prerun);
      this.tileControllers.delete(initiatorId);
    }
  };

  private tileSpawned = (initiatorId: string, prerun: boolean) => {
    // tile is already in gamefield
    const tileModel = this.gameModel.tilesMap.get(initiatorId);

    if (!tileModel) {
      return;
    }

    // we need to create view for it
    const tileView = new TileView(tileModel);
    // place with layout
    const startPosition = this.gameView.layout[tileView.tileModel.row][tileView.tileModel.column];

    tileView.position.x = startPosition.x;
    tileView.position.y = startPosition.y;

    // create controller
    const tileController = new TileController(tileView.tileModel, tileView, startPosition);
    // attach listners
    tileController.on(TileControllerEvents.swap, this.swap);
    tileController.on(TileControllerEvents["swap-cancel"], this.swapCancel);
    tileController.on(TileControllerEvents["swap-complete"], this.swapComplete);

    // set to local map
    this.tileControllers.set(initiatorId, tileController);

    tileController.spawnAnimation(prerun);

    this.gameView.addChild(tileView);
  };

  private tileGravity = (initiatorId: string, prerun: boolean) => {
    const initiator = this.tileControllers.get(initiatorId);
    const initiatorModel = this.gameModel.tilesMap.get(initiatorId);

    if (initiator && initiatorModel) {
      const emptyPosition = this.gameView.layout[initiatorModel.row][initiatorModel.column];

      initiator.translate(emptyPosition, prerun);
    }
  };

  public releaseTiles() {
    this.tileControllers.forEach((tileController) => {
      tileController.swapCancel();
      tileController.out();
    });
  }

  /**
   * Game cycle with animation
   * Constantly tries to find tiles to destroy, calss gravity and spawn new tiles
   *
   * @async
   */
  async gameCycle() {
    const { destroyGroups } = this.gameService.checkLines();

    this.emit(GameControllerEvents.proccessing, false);

    this.tileControllers.forEach((tile) => {
      tile.inProgress = true;
    });

    await this.gameService.destroyLines(destroyGroups);

    const gravityWorking = await this.gameService.gravity();

    if (gravityWorking) {
      await this.gameCycle();

      return;
    }

    const spawnWorking = await this.gameService.spawnToEmpty();

    if (spawnWorking) {
      await this.gameCycle();
    }

    this.emit(GameControllerEvents.proccessing, true);

    this.tileControllers.forEach((tile) => {
      tile.inProgress = false;
    });
  }

  async prerun() {
    const { destroyGroups } = this.gameService.checkLines();

    await this.gameService.destroyLines(destroyGroups, true);

    const gravityWorking = await this.gameService.gravity(true);

    if (gravityWorking) {
      await this.prerun();

      return true;
    }

    const spawnWorking = await this.gameService.spawnToEmpty(true);

    if (spawnWorking) {
      await this.prerun();

      return true;
    }

    return false;
  }
}
