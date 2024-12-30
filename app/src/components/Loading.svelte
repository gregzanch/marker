<script lang="ts">
  type LoadingProps = {
    size?: string;
  }
  let { size = "36px" } : LoadingProps = $props();
</script>

<div class="loader"></div>

<style>
  .loader {
    border: 16px solid var(--mono-lighter);
    border-top: 16px solid var(--color-primary);
    border-radius: 50%;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>