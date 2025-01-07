<script lang="ts">
  import { appState } from "../state/appState.svelte";
  import Layout from "./Layout.svelte";
  import Logo from "./Logo.svelte";
</script>

<Layout>
  <div class="vertical">
  <Logo animate={true} />
  <a href="/create" class="button primary" role="button" tabindex="0">Create Room</a>
</div>
</Layout>

<style>
    a {
      width: 100%;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
      border-top-left-radius: 0px;
      border-top-right-radius: 0px;
      border-width: 1px;
      border-top-width: 0px;
      border-color: var(--mono-darkest) !important;
    }
    
    .vertical {
    display: flex;
    flex-direction: column;
    justify-content: end;
    align-items: center;
  }
</style>