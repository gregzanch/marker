<script lang="ts">
  import { onMount } from "svelte";
  import { appState } from "../state/appState.svelte";
  import { constructMessage } from "../state/messenger.svelte";
  import app from "../main";

  type RoomFormData = {
    roomName: string;
    userName: string;
  };

  type FormProps = {
    type: "create" | "join";
  };

  let { type }: FormProps = $props();

  let isLoading = $state(true);

  async function createNewRoom(data: RoomFormData) {
    const res = await fetch("/new", {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
      method: "POST",
    });
    const json = await res.json();
    appState.name = data.userName;
    appState.messenger?.connection?.send(constructMessage("user-joined", {
      from: {
        name: json.userName,
        id: appState.id,
      },
      data: {},
    }))
    appState.navigate("board", {
      id: json.id
    })
  }

  async function getRoomName(id: string): Promise<string> {
    const res = await fetch("/getRoomName", {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id }),
      method: "POST"
    });
    const json = await res.json();
    return json.name
  }

  onMount(() => {
    const roomNameElement = document.getElementById("room-name")!;
    if(type==="join") {
      let id = appState.boardId || (new URL(window.location.toString())).searchParams.get("id");
      if(!id){
        alert("No room found!")
        appState.navigate("");
        return;
      }

      getRoomName(id).then(name => roomNameElement.setAttribute("value", name)).catch(() => {
        alert("Room does not exist!")
        appState.navigate("");
      });
    }
  });

</script>

<form
  onsubmit={(e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData) as RoomFormData;
    if(type==="create") {
      createNewRoom(data).catch(console.error);
    } else {
      appState.name = data.userName;
      const id = appState.boardId!;
      appState.navigate("board", { id })
    }
  }}
>
  <h1>{type === "create" ? "New Room" : "Join Room"}</h1>
  <div>
    <label for="room-name">Room Name</label>
    <input type="text" id="room-name" name="roomName" disabled={type === "join"} />
  </div>
  <div>
    <label for="user-name">User Name</label>
    <input type="text" id="user-name" name="userName" />
  </div>
  <div class="actions">
    <a href="/"><button type="button">Cancel</button></a>
    <button type="submit" class="primary">{type==="create"?"Create Room":"Join Room"}</button>
  </div>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-600);
  }
  h1 {
    font-size: var(--font-size-largest);
    font-weight: var(--font-weight-light);
    margin: 0px;
  }
  label {
    font-size: var(--font-size-smaller);
    font-weight: var(--font-weight-light);
    display: block;
    margin-bottom: var(--spacing-100);
  }
  input[type="text"]{
    width: calc(100% - (2 * var(--input-padding-horizontal) + 2px));
  }
  .actions {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: var(--spacing-400);
  }
  button[type="submit"] {
    width: 100%;
  }
</style>
