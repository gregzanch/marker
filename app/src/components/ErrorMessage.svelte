<script lang="ts">
  type ErrorMessageProps = {
    errorMessage: string;
  }

  let { errorMessage }: ErrorMessageProps = $props();
</script>

<b>{errorMessage}</b>

<style>
  
</style>