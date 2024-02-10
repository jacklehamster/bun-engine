import { Sprite } from "../Sprite";
import { SpriteUpdateType } from "../update/SpriteUpdateType";
import { forEach } from "abstract-list";
import { UpdatableList } from "../UpdatableList";
import { Matrix } from "dok-matrix";

export function copySprite(sprite: Sprite, dest?: Sprite): Sprite {
  if (!dest) {
    return {
      transform: Matrix.create().copy(sprite.transform),
      imageId: sprite.imageId,
      spriteType: sprite.spriteType,
      orientation: sprite.orientation,
      animationId: sprite.animationId,
      hidden: sprite.hidden,
    };
  }
  dest.imageId = sprite.imageId;
  dest.spriteType = sprite.spriteType;
  dest.transform.copy(sprite.transform);
  dest.orientation = sprite.orientation;
  dest.animationId = sprite.animationId;
  dest.hidden = sprite.hidden;
  return dest;
}

export function informFullUpdate(sprites: UpdatableList<any>, type: SpriteUpdateType = SpriteUpdateType.ALL) {
  forEach(sprites, (_, index) => sprites.informUpdate?.(index, type));
}
