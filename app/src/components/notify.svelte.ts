import { mount, unmount } from "svelte";
import Notification from "./Notification.svelte";

/**
 *
 * @param message The message to display
 * @param duration duration of the notification in seconds. Defaults to 4
 * @returns
 */
export function notify(message: string, duration: number = 4) {
  const notifications = document.getElementById("notifications");
  if (!notifications) {
    console.warn("#notifications element could not be found");
    return;
  }
  let component: {};
  component = mount(Notification, {
    props: {
      message: message,
      ondismiss: () => {
        unmount(component, { outro: true });
      },
    },
    intro: true,
    target: notifications,
  });
  setTimeout(() => {
    try {
      unmount(component, { outro: true });
    } catch (e) {
      console.warn(e);
    }
  }, duration * 1000);
}
