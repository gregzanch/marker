<div class="page-container">
  <nav>
    <span class="marker-logo">marker</span>
  </nav>
  <div class="center">
      <slot></slot>
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
  .center {
    display: flex;
    justify-content: center;
  }

  nav {
    position: absolute;
    top: 0px;
    left: 0px;
    padding: var(--spacing-200) var(--spacing-600);
  }
</style>
