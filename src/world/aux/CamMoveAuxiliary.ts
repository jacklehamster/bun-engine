import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { IKeyboard } from "controls/IKeyboard";
import { ICamera } from "gl/camera/ICamera";

interface Props {
  keyboard: IKeyboard;
  camera: ICamera;
}

export class CamMoveAuxiliary implements Auxiliary {
  private readonly keyboard: IKeyboard;
  private readonly camera: ICamera;

  constructor(props: Props) {
    this.keyboard = props.keyboard;
    this.camera = props.camera;
  }

  refresh(update: UpdatePayload): void {
    const { keys } = this.keyboard;
    const { deltaTime } = update;
    const speed = deltaTime / 80;
    const turnspeed = deltaTime / 400;
    if (keys.KeyW || keys.ArrowUp && !keys.ShiftRight) {
      this.camera.moveCam(0, 0, -speed);
    }
    if (keys.KeyS || keys.ArrowDown && !keys.ShiftRight) {
      this.camera.moveCam(0, 0, speed);
    }
    if (keys.KeyA || (keys.ArrowLeft && !keys.ShiftRight)) {
      this.camera.moveCam(-speed, 0, 0);
    }
    if (keys.KeyD || (keys.ArrowRight && !keys.ShiftRight)) {
      this.camera.moveCam(speed, 0, 0);
    }
    if (keys.KeyQ || (keys.ArrowLeft && keys.ShiftRight)) {
      this.camera.turn(-turnspeed);
    }
    if (keys.KeyE || (keys.ArrowRight && keys.ShiftRight)) {
      this.camera.turn(turnspeed);
    }
    if (keys.ArrowUp && keys.ShiftRight) {
      this.camera.tilt(-turnspeed);
    }
    if (keys.ArrowDown && keys.ShiftRight) {
      this.camera.tilt(turnspeed);
    }
  }
}
