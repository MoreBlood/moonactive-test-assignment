export abstract class AbstractModal {
  // abstract text: string;

  abstract closeText: string;

  abstract hide(): void;

  abstract resize(width: number, height: number): void;
}
