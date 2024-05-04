import { UpdateRegistry } from "updates/UpdateRegistry";
import { IUpdatableList, IUpdateListener } from "list-accumulator";
import { Active } from "dok-types";

interface Props {
  updateRegistry: UpdateRegistry;
  elems: IUpdatableList<any>;
}

export class Updater implements Active, IUpdateListener {
  private readonly elems: IUpdatableList<any>;
  private readonly updateRegistry: UpdateRegistry;

  constructor({ updateRegistry, elems }: Props) {
    this.updateRegistry = updateRegistry;
    this.elems = elems;
  }

  onUpdate(id: number, type?: number | undefined): void {
    this.updateRegistry.informUpdate(id, type);
  }

  activate(): void {
    this.elems.addUpdateListener?.(this);
  }

  deactivate(): void {
    this.elems.removeUpdateListener?.(this);
  }
}
