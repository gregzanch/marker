<script lang="ts">
  import Layout from "./Layout.svelte";

  type ErrorPageProps = {
    errorMessage: string;
  }

  let { errorMessage }: ErrorPageProps = $props();
</script>

<Layout>
  <b>{errorMessage}</b>
</Layout>

<style>
  
</style>