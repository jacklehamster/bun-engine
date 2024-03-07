import { UIControlListener } from "./UIControlListener";

export interface UIControl {
  addListener(listener: UIControlListener): void;
  removeListener(listener: UIControlListener): void;
}
