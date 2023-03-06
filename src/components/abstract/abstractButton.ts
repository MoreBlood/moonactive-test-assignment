import { Container } from "../../pixi";
import { ScalableText } from "../scalableText";

export abstract class AbstractButton extends Container {
  abstract text: string;

  abstract buttonText: ScalableText;

  abstract onClick(): void;
}
