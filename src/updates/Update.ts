import { Motor } from "../core/Motor";

export type Update = {
  update(motor: Motor, deltaTime: number): void;
}

export type Updates = Update | Update[];
