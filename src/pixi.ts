import { extensions, ExtensionType } from "@pixi/core";
import { BatchRenderer } from "@pixi/core";
import { InteractionManager } from "@pixi/interaction";
import { TilingSpriteRenderer } from "@pixi/sprite-tiling";
import { AppLoaderPlugin } from "@pixi/loaders";
import { TickerPlugin } from "@pixi/ticker";

// Renderer plugins
extensions.add({
  name: "batch",
  type: ExtensionType.RendererPlugin,
  ref: BatchRenderer,
});
extensions.add({
  name: "interaction",
  type: ExtensionType.RendererPlugin,
  ref: InteractionManager,
});
extensions.add({
  name: "tilingSprite",
  type: ExtensionType.RendererPlugin,
  ref: TilingSpriteRenderer,
});

// Application plugins
extensions.add({
  type: ExtensionType.Application,
  ref: TickerPlugin,
});
extensions.add({
  type: ExtensionType.Application,
  ref: AppLoaderPlugin,
});

export * from "@pixi/constants";

export * from "@pixi/math";

export * from "@pixi/runner";

export * from "@pixi/settings";

export * from "@pixi/ticker";

import * as utils from "@pixi/utils";

export { utils };

export * from "@pixi/display";

export * from "@pixi/core";

export * from "@pixi/events";

export * from "@pixi/assets";

export * from "@pixi/sprite";

export * from "@pixi/app";

export * from "@pixi/graphics";

export * from "@pixi/sprite-tiling";

export * from "@pixi/text";

export * from "@pixi/interaction";

export declare interface IHitArea {
  contains(x: number, y: number): boolean;
}
