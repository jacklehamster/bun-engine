import { MediaId } from "gl-texture-manager";
import { Box } from "./Box";
import Matrix from "gl/transform/Matrix";
import { Sprite } from "world/sprite/Sprite";
import { Sprites } from "world/sprite/Sprites";
import { List } from "abstract-list";

interface Props {
  box: Box;
  imageId: MediaId;
  insideImageId?: MediaId;
}

export class DisplayBox implements Sprites {
  private readonly sprites: List<Sprite>;
  constructor({ box, imageId, insideImageId }: Props) {
    if (!box.disabled) {
      const cX = (box.left + box.right) / 2;
      const cY = (box.top + box.bottom) / 2;
      const cZ = (box.near + box.far) / 2;
      const groundScale: [number, number, number] = [box.right - box.left, 2, box.near - box.far];
      const sideScale: [number, number, number] = [2, box.top - box.bottom, box.near - box.far];
      const faceScale: [number, number, number] = [box.right - box.left, box.top - box.bottom, 2];

      const outside = [
        Matrix.create().translate(cX, box.bottom, cZ).scale(...groundScale).scale(1 / 2).rotateX(Math.PI / 2),
        Matrix.create().translate(cX, box.top, cZ).scale(...groundScale).scale(1 / 2).rotateX(-Math.PI / 2),
        Matrix.create().translate(box.left, cY, cZ).scale(...sideScale).scale(1 / 2).rotateY(-Math.PI / 2),
        Matrix.create().translate(box.right, cY, cZ).scale(...sideScale).scale(1 / 2).rotateY(Math.PI / 2),
        Matrix.create().translate(cX, cY, box.near).scale(...faceScale).scale(1 / 2).rotateY(0),
        Matrix.create().translate(cX, cY, box.far).scale(...faceScale).scale(1 / 2).rotateY(Math.PI),
      ].map(transform => ({ imageId, transform }));

      const inside = !insideImageId ? [] : [
        Matrix.create().translate(cX, box.bottom, cZ).scale(...groundScale).scale(1 / 2).rotateX(-Math.PI / 2),
        Matrix.create().translate(cX, box.top, cZ).scale(...groundScale).scale(1 / 2).rotateX(+Math.PI / 2),
        Matrix.create().translate(box.left, cY, cZ).scale(...sideScale).scale(1 / 2).rotateY(+Math.PI / 2),
        Matrix.create().translate(box.right, cY, cZ).scale(...sideScale).scale(1 / 2).rotateY(-Math.PI / 2),
        Matrix.create().translate(cX, cY, box.near).scale(...faceScale).scale(1 / 2).rotateY(Math.PI),
        Matrix.create().translate(cX, cY, box.far).scale(...faceScale).scale(1 / 2).rotateY(0),
      ].map(transform => ({ imageId: insideImageId, transform }));
      this.sprites = [...inside, ...outside];
    } else {
      this.sprites = [];
    }
  }

  get length(): number {
    return this.sprites.length;
  }

  at(index: number): Sprite | undefined {
    return this.sprites.at(index);
  }

  informUpdate(_id: number, _type: number | undefined): void {
  }
}
