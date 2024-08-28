<template>
  <header>
    <h1>Tribal Wars Tools</h1>
    <ul class="menu">
      <li>
        <nuxt-link to="/">Home</nuxt-link>
      </li>
    </ul>
  </header>
</template>

<style>
header {
  background: linear-gradient(to bottom, #e2c07c 0%, #dab874 44%, #c1a264 100%);
  padding: 10px 25px;
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.menu {
  display: flex;
  list-style: none;
  padding: 0;
}

.menu li {
  height: 100%;
  font-size: 15px;
  font-weight: 700;
}

.menu li a {
  color: #000;
  text-decoration: none;
}

.menu li a:hover {
  color: #0082be;
}
</style>
