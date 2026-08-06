import { atom } from "nanostores";

export type NotificationType = "success" | "error" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

export const notifications = atom<Notification[]>([]);

const MAX_NOTIFICATIONS = 5;
let _counter = 0;

export function pushNotification(type: NotificationType, message: string, durationMs = 5000): void {
  const id = String(++_counter);
  notifications.update((list) => {
    const next = [...list, { id, type, message }];
    return next.length > MAX_NOTIFICATIONS ? next.slice(-MAX_NOTIFICATIONS) : next;
  });
  setTimeout(() => {
    notifications.update((list) => list.filter((n) => n.id !== id));
  }, durationMs);
}

export function dismissNotification(id: string): void {
  notifications.update((list) => list.filter((n) => n.id !== id));
}
