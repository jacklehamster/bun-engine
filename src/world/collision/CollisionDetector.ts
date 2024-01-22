import { Vector } from "core/types/Vector";
import { ICollisionDetector } from "./ICollisionDetector";
import { Box, NULLBOX } from "./Box";
import { CollisionBox } from "./CollisionBox";

interface Config {
  shouldBlock: boolean;
}

export interface Listener {
  onBlockChange?: (blocked: boolean) => void;
  onEnter?: () => void;
  onLeave?: () => void;
}

interface Props {
  blockerBox: Box;
  blockerPosition: Vector;
  heroBox?: Box;
  listener?: Listener;
}

export class CollisionDetector implements ICollisionDetector {
  private collisionBox: CollisionBox;
  private heroCollisionBox: CollisionBox;
  private collide = false;
  private config: Config;
  private listener: Listener;

  constructor({ blockerBox, blockerPosition, heroBox = NULLBOX, listener = {} }: Props,
    config: Partial<Config> = {}) {
    this.collisionBox = new CollisionBox(blockerBox, blockerPosition);
    this.heroCollisionBox = new CollisionBox(heroBox, [0, 0, 0]);
    this.listener = listener;
    this.config = { shouldBlock: config.shouldBlock ?? false };
  }

  isBlocked(to: Vector): boolean {
    this.heroCollisionBox.gotoPosition(to);
    const collide = this.heroCollisionBox.collideWith(this.collisionBox);
    if (collide !== this.collide) {
      this.collide = collide;
      this.listener.onBlockChange?.(this.collide);
      if (this.collide) {
        this.listener.onEnter?.();
      } else {
        this.listener.onLeave?.();
      }
    }
    return this.config.shouldBlock ? collide : false;
  }
}
