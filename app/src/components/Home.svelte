<script lang="ts">
import Logo from "./Logo.svelte";

</script>

<div class="page-container">
  <nav>
    marker
  </nav>
  <div class="vertical">
    <Logo />
    <button><a href="/new/abcdefg">Create Room</a></button>
  </div>
</div>

<style>
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
    top: var(--spacing-100);
    left: var(--spacing-100);
  }
</style>