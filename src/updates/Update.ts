export interface UpdatePayload {
  deltaTime: number;
}

export type Update = {
  update(updatePayload: UpdatePayload): void;
}
