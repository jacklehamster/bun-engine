import { PositionMatrix } from "gl/transform/PositionMatrix";
import { ChangeListener } from "gl/transform/IPositionMatrix";
import { Auxiliary } from "./Auxiliary";
import { Looper } from "motor/Looper";
import { IMotor } from "motor/IMotor";

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

export class FollowAuxiliary extends Looper implements Auxiliary {
  private readonly followee;
  private readonly follower;
  private readonly config: Config;
  private listener: ChangeListener = (dx, dy, dz) => {
    if (dx && this.config.followX || dy && this.config.followY || dz && this.config.followZ) {
      this.start();
    }
  }

  constructor({ followee, follower, motor }: Props, config?: Partial<Config>) {
    super(motor, false);
    this.followee = followee;
    this.follower = follower;
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

  refresh(): void {
    const { followX, followY, followZ, speed } = this.config;
    const x = followX ? this.followee.position[0] : this.follower.position[0];
    const y = followY ? this.followee.position[1] : this.follower.position[1];
    const z = followZ ? this.followee.position[2] : this.follower.position[2];
    this.follower.gotoPos(x, y, z, speed);
    if (this.followee.position[0] === this.follower.position[0]
      && this.followee.position[1] === this.follower.position[1]
      && this.followee.position[2] === this.follower.position[2]) {
      this.stop();
    }
  }
}
