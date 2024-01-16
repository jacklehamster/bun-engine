import { PositionMatrix } from "gl/transform/PositionMatrix";
import { Auxiliary } from "./Auxiliary";

interface Props {
  followee: PositionMatrix;
  follower: PositionMatrix;
}

export interface Config {
  speed: number;
}

export class SmoothFollowAuxiliary implements Auxiliary {
  private followee;
  private follower;
  private speed: number;
  constructor({ followee, follower }: Props, config?: Partial<Config>) {
    this.followee = followee;
    this.follower = follower;
    this.speed = config?.speed ?? 1;
  }

  refresh(): void {
    const [x, y, z] = this.followee.position;
    const [fx, fy, fz] = this.follower.position;
    const dx = x - fx, dy = y - fy, dz = z - fz;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < .1) {
      this.follower.moveTo(x, y, z);
    } else {
      const speed = Math.min(dist, this.speed * dist);
      this.follower.moveBy(dx / dist * speed, dy / dist * speed, dz / dist * speed);
    }
  }
}
