import { Cell, ICellTrigger } from "cell-tracker";
import { IBox } from "world/collision/IBox";
import { Vector } from "dok-types";
import { CollisionDetector } from "world/collision/CollisionDetector";
import { ICollisionDetector, Matrix, PositionMatrix } from "dok-matrix";
import { SpriteGroup } from "world/sprite/aux/SpriteGroup";
import { SpriteType } from "world/sprite/SpriteType";
import { MediaId } from "gl-texture-manager";
import { DisplayBox, Face } from "world/collision/DisplayBox";
import { Accumulator } from "list-accumulator";
import { Sprite } from "world/sprite/Sprite";
import { List, forEach } from "abstract-list";

interface Props {
  cells: List<Cell> | Cell[];
  blockerBox?: IBox;
  displayBox?: IBox;
  blockShift?: Vector;
  displayShift?: Vector;
  triggerBox?: IBox;
  heroBox: IBox;
  onCollide?(collided: boolean): void;
  onEnter?(): void;
  onLeave?(): void;
  spriteImageId?: MediaId;
  wireframeImageId?: MediaId;
  boxImage?: {
    outside?: MediaId;
    inside?: MediaId;
    faces?: Face[];
  };
  worldColliders: Accumulator<ICollisionDetector>;
  spritesAccumulator: Accumulator<Sprite>;
}

export class CellTrigger implements ICellTrigger {
  readonly cells: List<Cell>;
  readonly activate: () => void;
  readonly deactivate: () => void;

  constructor({
    cells, triggerBox, blockerBox, displayBox, heroBox,
    onCollide, onEnter, onLeave,
    spriteImageId, wireframeImageId,
    worldColliders, spritesAccumulator,
    boxImage,
    blockShift = [0, 0, 0],
    displayShift = [0, 0, 0],
  }: Props) {
    this.cells = cells;
    const colliders: ICollisionDetector[] = [];
    const sprites = new Accumulator<Sprite>();

    forEach(this.cells, cell => {
      if (!cell) {
        return;
      }
      const position = cell.worldPosition;
      const blockerPosition: Vector = [
        position[0] + blockShift[0], position[1] + blockShift[1], position[2] + blockShift[2],
      ];
      const posMatrix = new PositionMatrix().movedTo(
        position[0] + displayShift[0],
        position[1] + displayShift[1],
        position[2] + displayShift[2]);
      if (blockerBox) {
        colliders.push(new CollisionDetector({
          blockerBox, blockerPosition, heroBox,
          listener: {
            onBlockChange: onCollide ? (blocked) => onCollide?.(blocked) : undefined,
          }
        }, { shouldBlock: true }));
      }
      if (triggerBox) {
        colliders.push(new CollisionDetector({
          blockerBox: triggerBox, blockerPosition: position, heroBox,
          listener: { onEnter, onLeave }
        }, { shouldBlock: false }));
      }
      if (spriteImageId !== undefined) {
        sprites.add(new SpriteGroup([{
          imageId: spriteImageId,
          spriteType: SpriteType.SPRITE,
          transform: Matrix.create().translate(0, -.3, -1),
        }], posMatrix));
      }

      const boxToDisplay = displayBox ?? blockerBox;
      if (boxImage && boxToDisplay) {
        sprites.add(new SpriteGroup(new DisplayBox({
          box: boxToDisplay,
          imageId: boxImage.outside, insideImageId: boxImage.inside,
          faces: boxImage.faces,
        }), posMatrix));
      }
      if (triggerBox)
        if (triggerBox && wireframeImageId !== undefined) {
          sprites.add(new SpriteGroup(
            new DisplayBox({ box: triggerBox, imageId: wireframeImageId, insideImageId: wireframeImageId }),
            posMatrix,
          ));
        }
      if (blockerBox && wireframeImageId !== undefined) {
        sprites.add(new SpriteGroup(
          new DisplayBox({ box: blockerBox, imageId: wireframeImageId, insideImageId: wireframeImageId }),
          new PositionMatrix().movedTo(blockerPosition[0], blockerPosition[1], blockerPosition[2]),
        ));
      }
    });

    this.activate = () => {
      spritesAccumulator.add(sprites);
      worldColliders.add(colliders);
    }

    this.deactivate = () => {
      spritesAccumulator.remove(sprites);
      worldColliders.remove(colliders);
    };
  }
}
