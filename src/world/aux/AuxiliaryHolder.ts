import { Refresh, UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";

export class AuxiliaryHolder implements Refresh {
  constructor(private auxiliaries: Auxiliary[]) {
  }

  refresh(updatePayload: UpdatePayload): void {
    for (const aux of this.auxiliaries) {
      aux.refresh(updatePayload);
    }
  }

  addAuxiliary(...aux: Auxiliary[]) {
    this.auxiliaries.push(...aux);
  }
}
