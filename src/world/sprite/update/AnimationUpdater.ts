import { Animation } from "animation/Animation";
import { UpdateRegistry } from "updates/UpdateRegistry";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor-loop";
import { Updater } from "./Updater";

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
}

export class AnimationUpdater extends Updater<Animation> {
  constructor({ engine, motor }: Props) {
    super(new UpdateRegistry(ids => {
      if (this.elems) {
        engine.updateAnimationDefinitions(ids, this.elems);
      }
    }, motor));
  }
}
