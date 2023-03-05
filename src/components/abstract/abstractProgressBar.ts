import { Container } from "../../pixi";

export abstract class AbstractProgressBar extends Container {
  abstract max: number;

  abstract current: number;

  abstract setValue(value: number): void;

  abstract resize(value: number): void;
}
