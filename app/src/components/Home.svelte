<script lang="ts">
  import Logo from "./Logo.svelte";
  import Form from "./Form.svelte";
  let page = $state<"home" | "create" | "join">("home");

  function oncancel() {
    page = "home";
  }
</script>

<div class="page-container">
  <nav>
    <span class="marker-logo">marker</span></nav>
  <div class="vertical">
    {#if page === "home"}
      <Logo />
      <button class="primary" onclick={() => (page = "create")}>Create Room</button>
    {:else}
      <Form {oncancel} type={page}  />
    {/if}
  </div>
</div>

<style>

  .marker-logo {
    font-size: 36px;
    font-family: marker;
  }
  .page-container {
    width: 100vw;
    height: 100vh;
    align-content: center;
  }
  .vertical {
    display: flex;
    flex-direction: column;
    justify-content: end;
    align-items: center;
    gap: var(--spacing-600);
  }
  nav {
    position: absolute;
    top: 0px;
    left: 0px;
    padding: var(--spacing-200) var(--spacing-600);
  }
</style>
