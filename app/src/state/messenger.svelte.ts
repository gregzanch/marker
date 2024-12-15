export interface EventMap {
  "cursor-change": {
    from: string;
    type: "cursor-change";
    data: {
      x: number;
      y: number;
    };
  };
  "draw-ellipse": {
    from: string;
    type: "draw-ellipse";
    data: { x: number; y: number; rx: number; ry: number; color: string };
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
  eventListeners: EventListenerMap;
  constructor() {
    if (!window["WebSocket"]) {
      throw new Error("Your browser does not support WebSockets.");
    }
    this.connection = new WebSocket("ws://" + document.location.host + "/ws");
    this.connection.addEventListener("open", this.open.bind(this));
    this.connection.addEventListener("close", this.close.bind(this));
    this.connection.addEventListener("message", this.onMessage.bind(this));
    this.connection.addEventListener("error", this.onError.bind(this));
    this.connection.removeEventListener;
    this.eventListeners = {
      "cursor-change": [],
      "draw-ellipse": [],
    };
  }
  onError(event: Event) {
    console.error(event);
  }
  close() {
    this.status = "closed";
  }
  open() {
    this.status = "open";
  }
  onMessage(e: MessageEvent<string>) {
    const data = JSON.parse(e.data) as EventMap[keyof EventMap];
    switch (data.type) {
      case "cursor-change":
        this.onCursorChange(data);
        break;
      case "draw-ellipse":
        this.onDrawEllipse(data);
      default:
        break;
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
}
