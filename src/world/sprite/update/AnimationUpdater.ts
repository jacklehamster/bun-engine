import { Animation } from "animation/Animation";
import { UpdateRegistry } from "updates/UpdateRegistry";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor-loop";
import { Updater } from "../../../updates/Updater";
import { IUpdatableList } from "list-accumulator";

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
  animations: IUpdatableList<Animation>;
}

export class AnimationUpdater extends Updater {
  constructor({ engine, motor, animations }: Props) {
    super({
      updateRegistry: new UpdateRegistry(ids => {
        engine.updateAnimationDefinitions(ids, animations);
      }, motor),
      elems: animations,
    });
  }
}
