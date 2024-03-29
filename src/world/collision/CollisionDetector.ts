import { ICollisionDetector } from "dok-matrix";
import { IBox, NULLBOX } from "./IBox";
import { CollisionBox } from "./CollisionBox";
import { Vector } from "dok-types";

interface Config {
  shouldBlock: boolean;
}

export interface Listener {
  onBlockChange?: (blocked: boolean) => void;
  onEnter?: () => void;
  onLeave?: () => void;
}

interface Props {
  blockerBox: IBox;
  blockerPosition: Vector;
  heroBox?: IBox;
  listener?: Listener;
}

export class CollisionDetector implements ICollisionDetector {
  readonly #collisionBox: CollisionBox;
  readonly #heroCollisionBox: CollisionBox;
  readonly #config: Config;
  readonly #listener: Listener;
  #collide = false;
  #disabled?: boolean;

  constructor({ blockerBox, blockerPosition, heroBox = NULLBOX, listener = {} }: Props,
    config: Partial<Config> = {}) {
    this.#collisionBox = new CollisionBox(blockerBox, blockerPosition);
    this.#heroCollisionBox = new CollisionBox(heroBox, [0, 0, 0]);
    this.#listener = listener;
    this.#config = { shouldBlock: config.shouldBlock ?? false };
    this.#disabled = blockerBox.disabled;
  }

  isBlocked(to: Vector): boolean {
    if (this.#disabled) {
      return false;
    }
    this.#heroCollisionBox.gotoPosition(to);
    const collide = this.#heroCollisionBox.collideWith(this.#collisionBox);
    if (collide !== this.#collide) {
      this.#collide = collide;
      this.#listener.onBlockChange?.(this.#collide);
      if (this.#collide) {
        this.#listener.onEnter?.();
      } else {
        this.#listener.onLeave?.();
      }
    }
    return this.#config.shouldBlock ? collide : false;
  }
}
