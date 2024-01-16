import { Refresh, UpdatePayload } from "./Refresh";
import { UpdateNotifier } from "./UpdateNotifier";
import { IMotor } from "motor/IMotor";
import { IdType } from "core/IdType";

export class UpdateRegistry<T extends IdType = IdType> implements Refresh, UpdateNotifier {
  private readonly updatedIds: Set<T> = new Set();
  constructor(private applyUpdate: (ids: Set<T>, update: UpdatePayload) => void, private motor: IMotor) {
  }

  informUpdate(id: T): void {
    if (!this.updatedIds.has(id)) {
      this.updatedIds.add(id);
    }
    this.motor.registerUpdate(this);
  }

  refresh(update: UpdatePayload): void {
    this.applyUpdate(this.updatedIds, update);
    if (this.updatedIds.size) { //  re-register if some updates are remaining
      this.motor.registerUpdate(this);
    }
  }
}
