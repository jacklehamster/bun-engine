import { Animation } from "animation/Animation";
import { UpdateRegistry } from "updates/UpdateRegistry";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor-loop";
import { Updater } from "../../../updates/Updater";
import { UpdatableList } from "../UpdatableList";

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
  animations: UpdatableList<Animation>;
}

export class AnimationUpdater extends Updater<Animation> {
  constructor({ engine, motor, animations }: Props) {
    super({
      updateRegistry: new UpdateRegistry(ids => {
        engine.updateAnimationDefinitions(ids, animations);
      }, motor),
      elems: animations,
    });
  }
}
