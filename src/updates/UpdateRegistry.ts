import { UpdatePayload, IMotor, Cycle } from "motor-loop";
import { UpdateType } from "./IUpdateNotifier";
import { IdType } from "dok-types";
import { UpdateNotifier } from "./UpdateNotifier";

export class UpdateRegistry<T extends IdType = IdType> extends UpdateNotifier implements Cycle {
  private readonly updatedIds: Set<T> = new Set();
  constructor(private applyUpdate: (ids: Set<T>, update: UpdatePayload) => void, private motor: IMotor) {
    super();
  }

  informUpdate(id: T, type?: UpdateType): void {
    super.informUpdate(id, type);
    if (!this.updatedIds.has(id)) {
      this.updatedIds.add(id);
    }
    this.motor.scheduleUpdate(this);
  }

  refresh(update: UpdatePayload): void {
    this.applyUpdate(this.updatedIds, update);
    if (this.updatedIds.size) { //  re-register if some updates are remaining
      this.motor.scheduleUpdate(this, undefined, undefined, true);
    }
  }
}
