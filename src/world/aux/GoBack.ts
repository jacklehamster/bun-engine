export interface GoBack {
  goBack?(): void;
}

export function goBackAction(elem: any): GoBack["goBack"] {
  return () => (elem as GoBack).goBack?.();
}
