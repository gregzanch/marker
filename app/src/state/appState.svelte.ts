import { Messenger } from "./messenger.svelte";

class AppState {
  /** Messenger to handle communication with server */
  messenger: Messenger | null = $state(null);
  /** Error message that is at the root level of the application */
  globalErrorMessage: string | null = $state(null);
  /** identifies the name of the user */
  user: string = $state("anonymous");
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
