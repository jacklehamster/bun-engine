export interface PopupData {
  uid?: string;
  type?: "menu" | "dialog";
  position?: [number | undefined, number | undefined];
  size?: [number | undefined, number | undefined];
  positionFromRight?: boolean;
  positionFromBottom?: boolean;
  fontSize?: number;
  zIndex?: number;
}
