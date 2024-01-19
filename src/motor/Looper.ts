import { Refresh, UpdatePayload } from "updates/Refresh";
import { IMotor } from "./IMotor";
import { Active } from "core/Active";

export class Looper implements Refresh, Active {
  constructor(private motor: IMotor, private autoStart: boolean, private refresher?: Refresh) {
  }

  refresh(updatePayload: UpdatePayload): void {
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
    this.motor.loop(this);
  }

  protected stop() {
    this.motor.deregisterUpdate(this);
  }
}
