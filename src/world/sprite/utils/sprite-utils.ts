import { Sprite } from "../Sprite";
import { forEach } from "abstract-list";
import { UpdatableList } from "../../../core/UpdatableList";
import { Matrix } from "dok-matrix";
import { FULL_UPDATE, UpdateType } from "updates/IUpdateNotifier";

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

export function informFullUpdate(elems: UpdatableList<any>, type: UpdateType = FULL_UPDATE) {
  forEach(elems, (_, index) => elems.informUpdate?.(index, type));
}
