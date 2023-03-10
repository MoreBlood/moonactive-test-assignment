import { Container } from "../../pixi";

export abstract class AbstractScoreBar extends Container {
  abstract current: number;

  abstract setValue(value: number): void;

  abstract addValue(value: number): void;

  abstract resize(value: number): void;
}
