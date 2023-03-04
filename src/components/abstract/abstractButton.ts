import { Container, Text } from "pixi.js";

export abstract class AbstractButton extends Container {
  abstract text: string;
  abstract buttonText: Text;

  abstract onClick(): void;
}
