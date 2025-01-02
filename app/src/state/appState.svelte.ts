import { nanoid } from "nanoid";
import { Messenger, type EventMap } from "./messenger.svelte";
import type { Component } from "svelte";
import Home from "../components/Home.svelte";
import Board from "../components/Board.svelte";
import Create from "../components/Create.svelte";
import Join from "../components/Join.svelte";
import ErrorPage from "../components/ErrorPage.svelte";
import { colors } from "../lib/colors";

export type Client = EventMap["user-joined"]["from"] & {
  color: (typeof colors)[number];
  position: {
    x: number;
    y: number;
  };
  visible: boolean;
};

export class AppState {
  /** Messenger to handle communication with server */
  messenger: Messenger | null = $state(null);
  /** Error message that is at the root level of the application */
  globalErrorMessage: string | null = $state(null);
  /** name of the user */
  name: string | null = $state(null);
  /** id */
  id: string = nanoid();
  /** board id */
  boardId: string | null = $state(null);
  /** Connected Users */
  users: Client[] = $state([]);
  /** Our routes for the app */
  routes = {
    home: Home,
    board: Board,
    create: Create,
    join: Join,
    error: ErrorPage,
  };
  /** the current page */
  currentPage: keyof typeof this.routes | "" = $state("");
  constructor() {
    this.parseURL();
  }
  parseURL() {
    const location = new URL(window.location.toString());
    const path = location.pathname;
    switch (path.slice(1).toLowerCase()) {
      case "":
      case "home":
        this.currentPage = "home";
        break;
      case "board":
        this.currentPage = "board";
        for (const entry of location.searchParams.entries()) {
          if (entry[0].toLowerCase() === "id") {
            this.boardId = entry[1];
          }
        }
        break;
      case "create":
        this.currentPage = "create";
        break;
      case "join":
        this.currentPage = "join";
        for (const entry of location.searchParams.entries()) {
          if (entry[0].toLowerCase() === "id") {
            this.boardId = entry[1];
          }
        }
        break;
      default:
        this.currentPage = "error";
        break;
    }
  }
  navigate(
    page: keyof typeof this.routes | "",
    queryParams: Record<string, string> = {},
    override = true
  ) {
    const url = new URL(
      override ? window.location.origin : window.location.toString()
    );
    url.pathname = "/" + page;

    for (const param of Object.keys(queryParams)) {
      url.searchParams.set(param, queryParams[param]);
    }
    history.pushState(undefined, "", url);
    this.currentPage = page;
  }
  fatalError(message: string) {
    this.globalErrorMessage = message;
    this.navigate("error");
  }
}

export const appState = new AppState();
