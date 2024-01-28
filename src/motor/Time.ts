export type Time = number;
export type Duration = number;

export interface ITimeProvider {
  readonly time: Time;
}
