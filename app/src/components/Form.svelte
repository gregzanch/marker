<script lang="ts">
  import { nanoid } from "nanoid";
  import { appState } from "../state/appState.svelte";
  import { constructMessage } from "../state/messenger.svelte";
  import app from "../main";

  type RoomFormData = {
    roomName: string;
    userName: string;
  };

  type FormProps = {
    oncancel: () => void;
    type: "create" | "join";
  };

  let { oncancel, type }: FormProps = $props();

  async function createNewRoom(data: RoomFormData) {
    const res = await fetch("/new", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      method: "POST",
    });
    const json = await res.json();
    localStorage.setItem("userName", json.userName);
    appState.messenger?.connection?.send(constructMessage("user-joined", {
      from: {
        name: json.userName,
        id: appState.id,
      },
      data: {},
    }))
    window.location.assign(`/${json.id}`)
  }

</script>

<form
  onsubmit={(e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData) as RoomFormData;

    createNewRoom(data).catch(console.error);
  }}
>
  <h1>{type === "create" ? "New Room" : "Join Room"}</h1>
  <div>
    <label for="room-name">Room Name</label>
    <input type="text" id="room-name" name="roomName" />
  </div>
  <div>
    <label for="user-name">User Name</label>
    <input type="text" id="user-name" name="userName" />
  </div>
  <div class="actions">
    <button type="button" onclick={oncancel}>Cancel</button>
    <button type="submit" class="primary">Create Room</button>
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
