import { nanoid } from "nanoid";
import { Messenger } from "./messenger.svelte";

class AppState {
  /** Messenger to handle communication with server */
  messenger: Messenger | null = $state(null);
  /** Error message that is at the root level of the application */
  globalErrorMessage: string | null = $state(null);
  /** name of the user */
  name: string = $state("anonymous");
  /** id */
  id: string = nanoid();
  constructor() {
    try {
      this.messenger = new Messenger();
    } catch (e) {
      const error = e as Error;
      this.globalErrorMessage = error.message;
      return;
    }
  }
}

export const appState = new AppState();
