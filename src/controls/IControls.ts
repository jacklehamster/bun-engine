export interface ControlsListener {
  onQuickAction?(): void;
  onQuickTiltReset?(): void;
}

export interface IControls {
  get forward(): boolean;
  get backward(): boolean;
  get left(): boolean;
  get right(): boolean;
  get up(): boolean;
  get down(): boolean;
  get turnLeft(): boolean;
  get turnRight(): boolean;
  get action(): boolean;
  addListener(listener: ControlsListener): () => void;
}
