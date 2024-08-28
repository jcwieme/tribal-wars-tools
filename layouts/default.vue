<template>
  <Header />
  <main>
    <slot />
  </main>
</template>

<style>
body {
  background-color: #d2c09e;
  font-family: Verdana, Arial, Helvetica, sans-serif;
  font-size: 12px;
  line-height: 14px;
  margin: 0;
  height: 100vh;
}

main {
  margin: 25px;
}
</style>
