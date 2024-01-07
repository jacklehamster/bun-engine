export interface Active {
  activate(): (() => void) | void;
  deactivate(): void;
}
