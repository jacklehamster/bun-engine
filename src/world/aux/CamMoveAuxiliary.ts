import { Keyboard } from "controls/Keyboard";
import { ActivateProps } from "core/Active";
import { Camera } from "gl/camera/Camera";
import { UpdatePayload } from "updates/Refresh";
import { Auxliary } from "./Auxiliary";

export class CamMoveAuxiliary implements Auxliary {
  private keyboard?: Keyboard;

  constructor(private camera: Camera) {
  }
  activate({ core }: ActivateProps): () => void {
    this.keyboard = core.keyboard;
    const deregister = core.motor.loop(this);
    return () => {
      deregister();
    };
  }

  refresh(update: UpdatePayload): void {
    if (!this.keyboard) {
      return;
    }
    const { keys } = this.keyboard;
    const { deltaTime } = update;
    const speed = deltaTime / 80;
    const turnspeed = deltaTime / 400;
    if (keys.KeyW || keys.ArrowUp && !keys.ShiftRight) {
      this.camera.moveCam(0, 0, speed);
    }
    if (keys.KeyS || keys.ArrowDown && !keys.ShiftRight) {
      this.camera.moveCam(0, 0, -speed);
    }
    if (keys.KeyA || (keys.ArrowLeft && !keys.ShiftRight)) {
      this.camera.moveCam(-speed, 0, 0);
    }
    if (keys.KeyD || (keys.ArrowRight && !keys.ShiftRight)) {
      this.camera.moveCam(speed, 0, 0);
    }
    if (keys.KeyQ || (keys.ArrowLeft && keys.ShiftRight)) {
      this.camera.turnCam(-turnspeed);
    }
    if (keys.KeyE || (keys.ArrowRight && keys.ShiftRight)) {
      this.camera.turnCam(turnspeed);
    }
    if (keys.ArrowUp && keys.ShiftRight) {
      this.camera.tilt(-turnspeed);
    }
    if (keys.ArrowDown && keys.ShiftRight) {
      this.camera.tilt(turnspeed);
    }
  }
}
