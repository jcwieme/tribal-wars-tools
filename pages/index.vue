<template>
  <div class="def">
    <Box title="Inputs">
      <div class="input">
        <label for="cibles"> Coordonnées des cibles: </label>
        <textarea id="cibles" name="cibles" rows="4" cols="50" v-model="textAreaInput" />
      </div>
      <div class="input">
        <div class="unit" v-for="(_, key) in units" :key="key">
          <label :for="key">
            <img :src="`/units/unit_${key}.png`" :alt="key" />
          </label>
          <input type="number" :name="key" :id="key" v-model="units[key]" />
        </div>
      </div>
    </Box>
    <Box title="Result" :button="button" @clicked="copyBBCode">
      <div v-if="results">
        <div v-for="result in results" :key="result.cible">
          <h3>{{ result.cible }}</h3>
          <div v-for="(value, key) in result.units" :key="key">
            <img :src="`/units/unit_${key}.png`" :alt="key" />
            <span>{{ value }}</span>
          </div>
        </div>
      </div>
    </Box>
  </div>
</template>

<script setup>
const isCopied = ref(false)
const textAreaInput = ref('')
const units = ref({
  spear: 0,
  sword: 0,
  archer: 0,
  spy: 0,
  marcher: 0,
  heavy: 0,
})
const results = computed(() => {
  const allUnitsZero = Object.values(units.value).every((value) => value === 0)
  if (allUnitsZero) return null

  const cibles = textAreaInput.value.match(/\d{3}\|\d{3}/g)
  if (!cibles) return null

  const totalCibles = cibles.length

  const unitsPerCible = Object.fromEntries(
    Object.entries(units.value).map(([key, value]) => [key, Math.floor(value / totalCibles)])
  )

  const remainder = Object.fromEntries(Object.entries(units.value).map(([key, value]) => [key, value % totalCibles]))

  return cibles.map((cible, index) => {
    const filteredUnits = Object.fromEntries(
      Object.entries(unitsPerCible)
        .map(([key, value]) => [key, value + (index === 0 ? remainder[key] : 0)])
        .filter(([, value]) => value > 0)
    )

    return {
      cible,
      units: filteredUnits,
    }
  })
})
const button = computed(() => (results.value ? (isCopied.value ? 'BBCode copié!' : 'Copier le BBCode') : null))

const copyBBCode = () => {
  const bbCode = results.value
    .map((result) => {
      const units = Object.entries(result.units)
        .map(([key, value]) => `[unit]${key}[/unit] ${value}`)
        .join(' - ')
      return `${result.cible}\n${units}`
    })
    .join('\n\n')

  navigator.clipboard.writeText(bbCode)
  isCopied.value = true
  setTimeout(() => {
    isCopied.value = false
  }, 2000)
}
// player ID + name
// How to get player id ?
// https://fr89.guerretribale.fr/game.php?screen=mail&mode=new&player=1760165&name=Palou1983
// https://fr89.guerretribale.fr/map/player.txt
</script>

<style>
.def {
  display: flex;
  gap: 25px;
  width: 100%;
}
.input {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.unit {
  display: flex;
  align-items: center;
  gap: 5px;
}
img {
  height: 100%;
  width: auto;
}
</style>
