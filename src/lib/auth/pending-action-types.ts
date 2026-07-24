export const PendingActionType = {
  Like: "like",
} as const;

export type PendingActionType =
  (typeof PendingActionType)[keyof typeof PendingActionType];

export type PendingActionPayloadMap = {
  [PendingActionType.Like]: { path: string };
};

export type PendingAction<T extends PendingActionType = PendingActionType> = {
  type: T;
  payload: PendingActionPayloadMap[T];
};

export type PendingIntent<T extends PendingActionType = PendingActionType> = {
  returnTo: string;
  action?: PendingAction<T>;
  createdAt: number;
};
