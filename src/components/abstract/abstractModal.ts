export abstract class AbstractModal {
  abstract closeText: string;

  abstract hide(): void;

  abstract resize(width: number, height: number): void;
}
