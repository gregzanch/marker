import type { AppState, Client } from "../state/appState.svelte";
import type { Line } from "./entities/line";
export async function getClients(id: string) {
  const res = await fetch("/getClients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  const { clients } = await res.json();
  return clients as Client[];
}

export async function getCurrentBoardState(id: string) {
  const res = await fetch("/getCurrentBoardState", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  return (await res.json()) as { clients: Client[]; lines: Line[] };
}
