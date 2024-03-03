export interface PopupInterface {
  close(): void;
}

export type PopupAction = (ui: PopupInterface) => Promise<void> | void;

export function popupActions(...actions: (PopupAction | undefined)[]) {
  return async (ui: PopupInterface) => {
    for (const action of actions) {
      await action?.(ui);
    }
  };
}

export function closePopupAction(): PopupAction {
  return (ui: PopupInterface) => ui.close();
}
