import { appState } from "./appState.svelte";

export type From = {
  id: string;
  name: string;
};

export interface EventMap {
  "user-joined": {
    from: From;
    type: "user-joined";
    data: {};
  };
  "user-left": {
    from: From;
    type: "user-left";
    data: {};
  };
  "cursor-change": {
    from: From;
    type: "cursor-change";
    data: {
      x: number;
      y: number;
    };
  };
  "draw-ellipse": {
    from: From;
    type: "draw-ellipse";
    data: {
      x: number;
      y: number;
      rx: number;
      ry: number;
      color: string;
    };
  };
  "create-new-line": {
    from: From;
    type: "create-new-line";
    data: {
      id: string;
      color: string;
      vertices: Array<{
        x: number;
        y: number;
      }>;
    };
  };
  "add-points-to-line": {
    from: From;
    type: "add-points-to-line";
    data: {
      id: string;
      vertices: Array<{
        x: number;
        y: number;
      }>;
    };
  };
}

type EventListenerMap = {
  [T in keyof EventMap]: Array<(event: EventMap[T]) => void>;
};

export function constructMessage<T extends keyof EventMap>(
  type: T,
  data: Omit<EventMap[T], "type">
) {
  return JSON.stringify({
    type,
    ...data,
  });
}

export class Messenger {
  /** Websocket Connection */
  connection?: WebSocket = $state();
  status = $state<"open" | "closed">("closed");
  eventListeners: EventListenerMap = {
    "cursor-change": [],
    "draw-ellipse": [],
    "user-joined": [],
    "create-new-line": [],
    "add-points-to-line": [],
    "user-left": [],
  };
  constructor(public id: string) {
    if (!window["WebSocket"]) {
      throw new Error("Your browser does not support WebSockets.");
    }
    this.initiateConnection().catch(console.error);
  }

  async initiateConnection() {
    let scheme = "ws";
    var location = document.location;

    if (location.protocol === "https:") {
      scheme += "s";
    }
    try {
      this.connection = new WebSocket(
        `${scheme}://${document.location.host}/ws/${
          this.id
        }/${appState.name!}/${appState.id}`
      );
      this.connection.addEventListener("open", this.open.bind(this));
      this.connection.addEventListener("close", this.close.bind(this));
      this.connection.addEventListener("message", this.onMessage.bind(this));
      this.connection.addEventListener("error", this.onError.bind(this));
    } catch {
      this.close();
    }
  }

  onError(event: Event) {
    console.error(event);
  }
  close() {
    this.status = "closed";
  }
  open() {
    this.status = "open";
    this.connection?.send(
      constructMessage("user-joined", {
        from: { name: appState.name!, id: appState.id },
        data: {},
      })
    );
  }
  onMessage(e: MessageEvent<string>) {
    const lines = e.data.split("\n");
    for (const line of lines) {
      const data = JSON.parse(line) as EventMap[keyof EventMap];
      switch (data.type) {
        case "user-joined":
          this.onUserJoined(data);
          break;
        case "user-left":
          this.onUserLeft(data);
          break;
        case "cursor-change":
          this.onCursorChange(data);
          break;
        case "draw-ellipse":
          this.onDrawEllipse(data);
          break;
        case "create-new-line":
          this.onCreateNewLine(data);
          break;
        case "add-points-to-line":
          this.onAddPointToLine(data);
          break;
        default:
          break;
      }
    }
  }
  addEventListener<T extends keyof EventMap>(
    type: T,
    listener: (data: EventMap[T]) => void
  ) {
    this.eventListeners[type].push(listener);
  }
  removeEventListener<T extends keyof EventMap>(
    type: T,
    listener: (data: EventMap[T]) => void
  ) {
    const index = this.eventListeners[type].findIndex(
      (func) => func === listener
    );
    if (index === -1) return;
    this.eventListeners[type].splice(index, 1);
  }
  onCursorChange(event: EventMap["cursor-change"]) {
    for (const listener of this.eventListeners["cursor-change"]) {
      listener(event);
    }
  }
  onDrawEllipse(event: EventMap["draw-ellipse"]) {
    for (const listener of this.eventListeners["draw-ellipse"]) {
      listener(event);
    }
  }
  onUserJoined(event: EventMap["user-joined"]) {
    for (const listener of this.eventListeners["user-joined"]) {
      listener(event);
    }
  }
  onUserLeft(event: EventMap["user-left"]) {
    for (const listener of this.eventListeners["user-left"]) {
      listener(event);
    }
  }
  onCreateNewLine(event: EventMap["create-new-line"]) {
    for (const listener of this.eventListeners["create-new-line"]) {
      listener(event);
    }
  }
  onAddPointToLine(event: EventMap["add-points-to-line"]) {
    for (const listener of this.eventListeners["add-points-to-line"]) {
      listener(event);
    }
  }
}
