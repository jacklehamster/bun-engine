import { MediaId } from "gl-texture-manager";
import { IBox } from "./IBox";
import { Sprite } from "world/sprite/Sprite";
import { List } from "abstract-list";
import { Matrix } from "dok-matrix";

export enum Face {
  LEFT, RIGHT,
  FAR, NEAR,
  TOP, BOTTOM,
}

interface Props {
  box: IBox;
  imageId?: MediaId;
  insideImageId?: MediaId;
  faces?: Face[];
}

export class DisplayBox implements List<Sprite> {
  readonly #sprites: List<Sprite>;
  constructor({ box, imageId, insideImageId, faces = [
    Face.BOTTOM, Face.TOP, Face.LEFT, Face.RIGHT, Face.FAR, Face.NEAR,
  ] }: Props) {
    const faceSet = new Set(faces);
    if (!box.disabled) {
      const cX = (box.left + box.right) / 2;
      const cY = (box.top + box.bottom) / 2;
      const cZ = (box.near + box.far) / 2;
      const groundScale: [number, number, number] = [box.right - box.left, 2, box.near - box.far];
      const sideScale: [number, number, number] = [2, box.top - box.bottom, box.near - box.far];
      const faceScale: [number, number, number] = [box.right - box.left, box.top - box.bottom, 2];

      const outside = !imageId ? [] : [
        faceSet.has(Face.BOTTOM) && Matrix.create().translate(cX, box.bottom, cZ).scale(...groundScale).scale(1 / 2).rotateX(Math.PI / 2),
        faceSet.has(Face.TOP) && Matrix.create().translate(cX, box.top, cZ).scale(...groundScale).scale(1 / 2).rotateX(-Math.PI / 2),
        faceSet.has(Face.LEFT) && Matrix.create().translate(box.left, cY, cZ).scale(...sideScale).scale(1 / 2).rotateY(-Math.PI / 2),
        faceSet.has(Face.RIGHT) && Matrix.create().translate(box.right, cY, cZ).scale(...sideScale).scale(1 / 2).rotateY(Math.PI / 2),
        faceSet.has(Face.NEAR) && Matrix.create().translate(cX, cY, box.near).scale(...faceScale).scale(1 / 2).rotateY(0),
        faceSet.has(Face.FAR) && Matrix.create().translate(cX, cY, box.far).scale(...faceScale).scale(1 / 2).rotateY(Math.PI),
      ].filter((a): a is Matrix => !!a).map(transform => ({ imageId, transform }));

      const inside = !insideImageId ? [] : [
        faceSet.has(Face.BOTTOM) && Matrix.create().translate(cX, box.bottom, cZ).scale(...groundScale).scale(1 / 2).rotateX(-Math.PI / 2),
        faceSet.has(Face.TOP) && Matrix.create().translate(cX, box.top, cZ).scale(...groundScale).scale(1 / 2).rotateX(+Math.PI / 2),
        faceSet.has(Face.LEFT) && Matrix.create().translate(box.left, cY, cZ).scale(...sideScale).scale(1 / 2).rotateY(+Math.PI / 2),
        faceSet.has(Face.RIGHT) && Matrix.create().translate(box.right, cY, cZ).scale(...sideScale).scale(1 / 2).rotateY(-Math.PI / 2),
        faceSet.has(Face.NEAR) && Matrix.create().translate(cX, cY, box.near).scale(...faceScale).scale(1 / 2).rotateY(Math.PI),
        faceSet.has(Face.FAR) && Matrix.create().translate(cX, cY, box.far).scale(...faceScale).scale(1 / 2).rotateY(0),
      ].filter((a): a is Matrix => !!a).map(transform => ({ imageId: insideImageId, transform }));
      this.#sprites = [...inside, ...outside];
    } else {
      this.#sprites = [];
    }
  }

  get length(): List<Sprite>["length"] {
    return this.#sprites.length;
  }

  at(index: number): Sprite | undefined {
    return this.#sprites.at(index);
  }
}
