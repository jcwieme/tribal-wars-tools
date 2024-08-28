<template>
  <div class="box">
    <h2 v-if="title">{{ title }}</h2>
    <div class="slot">
      <slot />
    </div>
  </div>
</template>

<script setup>
const { title } = defineProps(['title'])
</script>

<style>
.box {
  border: 2px solid #804000;
  color: #0b0b0b;
  position: relative;
  background-color: #f1ebdd;
  width: 100%;
  box-shadow: 1px 1px 2px 1px rgba(60, 30, 0, 0.2);
}

h2 {
  background: #e2c07c;
  font-size: 13px;
  font-weight: 700;
  margin: 0;
  padding: 3px;
  border-bottom: 1px solid #d2b487;
  padding: 5px 10px;
}

.slot {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
