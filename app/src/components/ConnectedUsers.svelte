<script lang="ts">
  import { appState } from "../state/appState.svelte";
  const users = appState.users
  $inspect(appState.users)
</script>

<div class="avatar-container">
  {#each users as u}
    <div class="avatar" style:background-color={`var(--color-participant-${u.color})`}>{u.name[0].toUpperCase()}</div>
  {/each}
</div>

<style>
  .avatar-container {
    display: flex;
    flex-direction: row;
  }
  .avatar-container:hover {
    --gap-amount: 0.5em;
  }
  .avatar-container > .avatar {
    width: 2em;
    height: 2em;
    border-radius: 1em;

    align-content: center;
    text-align: center;
    background-color: red;
    outline: 1px solid black;
  }

  .avatar-container :not(:last-child) {
    margin-right: var(--gap-amount, -0.5em);
    transition: 250ms all;
  }
</style>
