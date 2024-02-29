import { Accumulator, IPotentiallyUpdatableList, IUpdatableList } from "list-accumulator";
import { Sprite } from "../Sprite";
import { ICollisionDetector, IMatrix, Matrix } from "dok-matrix";
import { IBodyModel } from "./IBodyModel";
import { IdType } from "dok-types";

interface Props {
  sprites: IPotentiallyUpdatableList<Sprite>;
  colliders: IPotentiallyUpdatableList<ICollisionDetector>;
  bodies: IPotentiallyUpdatableList<IBodyModel>;
}

export class BodyModel implements IBodyModel {
  readonly sprites = new Accumulator<Sprite>();
  readonly colliders = new Accumulator<ICollisionDetector>();
  readonly #bodies = new Accumulator<IBodyModel>();
  readonly #spritesPerId: Record<IdType, IPotentiallyUpdatableList<Sprite>> = {};
  readonly #collidersPerId: Record<IdType, IPotentiallyUpdatableList<ICollisionDetector>> = {};

  constructor({ sprites, colliders, bodies }: Partial<Props> = {}) {
    this.#bodies.addUpdateListener({
      onUpdate: (bodyId: IdType): void => {
        const body = this.#bodies.at(bodyId);
        updateBodyRecord(this.#spritesPerId, this.sprites, bodyId, body?.sprites);
        updateBodyRecord(this.#collidersPerId, this.colliders, bodyId, body?.colliders);
      }
    });
    if (sprites) {
      this.sprites.add(sprites);
    }
    if (colliders) {
      this.colliders.add(colliders);
    }
    if (bodies) {
      this.#bodies.add(bodies);
    }
  }

  addSprites(sprites: IPotentiallyUpdatableList<Sprite>): void {
    this.sprites.add(sprites);
  }

  addColliders(colliders: IPotentiallyUpdatableList<ICollisionDetector>): void {
    this.colliders.add(colliders);
  }

  addBodies(bodies: IPotentiallyUpdatableList<IBodyModel>): void {
    this.#bodies.add(bodies);
  }

  removeSprites(sprites: IPotentiallyUpdatableList<Sprite>): void {
    this.sprites.remove(sprites);
  }

  removeColliders(colliders: IPotentiallyUpdatableList<ICollisionDetector>): void {
    this.colliders.remove(colliders);
  }

  removeBodies(bodies: IPotentiallyUpdatableList<IBodyModel>): void {
    this.#bodies.remove(bodies);
  }

  updateFully(): void {
    this.sprites.updateFully();
    this.colliders.updateFully();
    this.#bodies.updateFully();
  }
}

function updateBodyRecord<T>(record: Record<IdType, IPotentiallyUpdatableList<T>>, accumulator: Accumulator<T>, id: IdType, elems: IPotentiallyUpdatableList<T> | undefined): void {
  if (!elems) {
    if (record[id]) {
      accumulator.remove(record[id]);
      delete record[id];
    }
  } else {
    if (!record[id]) {
      accumulator.add(elems);
      record[id] = elems;
    }
  }
}
