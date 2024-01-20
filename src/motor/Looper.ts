import { Refresh, UpdatePayload } from "updates/Refresh";
import { IMotor } from "./IMotor";
import { Active } from "core/Active";

export class Looper<T = undefined> implements Refresh<T>, Active {
  constructor(private motor: IMotor, private autoStart: boolean, private data?: T, private refresher?: Refresh<T>) {
  }

  refresh(updatePayload: UpdatePayload<T>): void {
    this.refresher?.refresh(updatePayload);
  }

  activate(): void {
    if (this.autoStart) {
      this.start();
    }
  }

  deactivate(): void {
    this.stop();
  }

  protected start() {
    this.motor.loop(this, undefined, this.data);
  }

  protected stop() {
    this.motor.deregisterUpdate(this);
  }
}
