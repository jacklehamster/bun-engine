import { IdType } from "dok-types";
import { IUpdateListener, IUpdateNotifier, UpdateType } from "./IUpdateNotifier";

export class UpdateNotifier implements IUpdateNotifier {
  #listeners = new Set<IUpdateListener>();
  informUpdate(id: IdType, type?: UpdateType | undefined): void {
    this.#listeners.forEach(listener => listener.onUpdate(id, type));
  }

  addUpdateListener(listener: IUpdateListener): void {
    this.#listeners.add(listener);
  }

  removeUpdateListener(listener: IUpdateListener): void {
    this.#listeners.delete(listener);
  }
}
