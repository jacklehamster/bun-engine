export interface Message {
  text?: string;
  action?(): void;
  next?: boolean;
}
