<script lang="ts">
  import { appState } from "../state/appState.svelte";
  import Layout from "./Layout.svelte";
  import Logo from "./Logo.svelte";
</script>

<Layout>
  <div class="vertical">
  <Logo animate={true} />
  <a href="/create"><button class="primary">Create Room</button></a>
</div>
</Layout>

<style>
    a {
      width: 100%;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
    button {
      width: 100%;
      border-top-left-radius: 0px;
      border-top-right-radius: 0px;
      border-width: 1px;
      border-top-width: 0px;
      border-color: var(--mono-darkest);
    }
    .vertical {
    display: flex;
    flex-direction: column;
    justify-content: end;
    align-items: center;
  }
</style>