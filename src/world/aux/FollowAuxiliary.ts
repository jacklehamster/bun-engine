import { PositionMatrix } from "gl/transform/PositionMatrix";
import { ChangeListener } from "gl/transform/IPositionMatrix";
import { Auxiliary } from "./Auxiliary";
import { Looper } from "motor/Looper";
import { IMotor } from "motor/IMotor";
import { UpdatePayload } from "updates/Refresh";

interface Props {
  followee: PositionMatrix;
  follower: PositionMatrix;
  motor: IMotor;
}

interface Config {
  followX: boolean;
  followY: boolean;
  followZ: boolean;
  speed: number;
}

interface Data {
  followee: PositionMatrix;
  follower: PositionMatrix;
}

export class FollowAuxiliary extends Looper<Data> implements Auxiliary {
  private readonly followee;
  private readonly config: Config;
  private listener: ChangeListener = (dx, dy, dz) => {
    if (dx && this.config.followX || dy && this.config.followY || dz && this.config.followZ) {
      this.start();
    }
  }

  constructor({ followee, follower, motor }: Props, config?: Partial<Config>) {
    super(motor, false, { follower, followee });
    this.followee = followee;
    this.config = {
      followX: config?.followX ?? true,
      followY: config?.followY ?? true,
      followZ: config?.followZ ?? true,
      speed: config?.speed ?? 1,
    };
  }

  activate(): void {
    super.activate();
    this.followee.onChange(this.listener);
  }

  deactivate(): void {
    this.followee.removeChangeListener(this.listener);
    super.deactivate();
  }

  refresh({ data }: UpdatePayload<Data>): void {
    const { followX, followY, followZ, speed } = this.config;
    const x = followX ? data.followee.position[0] : data.follower.position[0];
    const y = followY ? data.followee.position[1] : data.follower.position[1];
    const z = followZ ? data.followee.position[2] : data.follower.position[2];
    data.follower.gotoPos(x, y, z, speed);
    if (data.followee.position[0] === data.follower.position[0]
      && data.followee.position[1] === data.follower.position[1]
      && data.followee.position[2] === data.follower.position[2]) {
      this.stop();
    }
  }
}
