export abstract class AbstractProgressBar {
  abstract max: number;

  abstract current: number;

  abstract setValue(value: number): void;
}
