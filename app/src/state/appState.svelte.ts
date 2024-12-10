class AppState {
  connection?: WebSocket = $state();
}

export const appState = new AppState();
