<script lang="ts">
  import { nanoid } from "nanoid";

  type RoomFormData = {
    roomName: string;
    userName: string;
  };

  type FormProps = {
    oncancel: () => void;
    type: "create" | "join";
  };

  let { oncancel, type }: FormProps = $props();
</script>

<form
  onsubmit={(e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData) as RoomFormData;
    localStorage.setItem("marker-user-name", data.userName);
    window.location.assign(`/new/${data.roomName}`)
  }}
>
  <h1>{type === "create" ? "New Room" : "Join Room"}</h1>
  <div>
    <label for="room-name">Room Name</label>
    <input type="text" id="room-name" name="room-name" />
  </div>
  <div>
    <label for="user-name">User Name</label>
    <input type="text" id="user-name" name="user-name" />
  </div>
  <div class="actions">
    <button onclick={oncancel}>Cancel</button>
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
