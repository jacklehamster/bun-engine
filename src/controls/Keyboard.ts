import { ActivateProps, Active } from "core/Active";

const QUICK_TAP_TIME = 200;

export class Keyboard implements Active {
  readonly keys: Record<string, number> = {};
  readonly keysUp: Record<string, number> = {};

  public activate(activateProps: ActivateProps): () => void {
    const { core } = activateProps;
    const keyDown = (e: KeyboardEvent) => {
      if (!this.keys[e.code]) {
        this.keys[e.code] = core.motor.time;
      }
    };
    const keyUp = (e: KeyboardEvent) => {
      if (core.motor.time - this.keys[e.code] < QUICK_TAP_TIME) {
        this.keysUp[e.code] = this.keysUp[e.code] ? 0 : core.motor.time;
      } else {
        this.keysUp[e.code] = 0;
      }
      this.keys[e.code] = 0;
    };
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
    return () => {
      document.removeEventListener('keydown', keyDown);
      document.removeEventListener('keyup', keyUp);
    };
  }
}
