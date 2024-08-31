<template>
  <div class="def">
    <Box title="Inputs">
      <div class="input">
        <label for="cibles"> Tribu: </label>
        <select id="tribu" name="tribu" v-model="selectedAlly">
          <option value="">Choisir une tribu</option>
          <option v-for="ally in allies" :key="ally.id" :value="ally.id">{{ ally.tag }}</option>
        </select>
      </div>
      <div class="input" v-if="filteredPlayers.length">
        <label for="cibles"> Joueur: </label>
        <select id="joueur" name="joueur" v-model="selectedPlayer">
          <option value="">Choisir un joueur</option>
          <option v-for="player in filteredPlayers" :key="player.id" :value="player.id">{{ player.name }}</option>
        </select>
      </div>
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
import { onMounted, watch } from 'vue'

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
const players = ref([])
const allies = ref([])
const selectedAlly = ref('')
const selectedPlayer = ref('')
const filteredPlayers = computed(() => {
  return players.value.filter((player) => player.tribe_id === selectedAlly.value)
})

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
  // https://fr89.guerretribale.fr/game.php?screen=mail&mode=new&player=1760165&name=Palou1983
  // open the mail page with the player id and name
  if (selectedPlayer.value) {
    const name = players.value.find((player) => player.id === selectedPlayer.value).name
    window.open(
      `https://fr89.guerretribale.fr/game.php?screen=mail&mode=new&player=${selectedPlayer.value}&name=${name}`
    )
  }

  isCopied.value = true
  setTimeout(() => {
    isCopied.value = false
  }, 2000)
}

// Fetch and convert the ally and player data
onMounted(async () => {
  const ally = await fetchAndConvertToJSON('https://fr89.guerretribale.fr/map/ally.txt', 'ally')
  const player = await fetchAndConvertToJSON('https://fr89.guerretribale.fr/map/player.txt', 'player')
  allies.value = ally.sort(function (a, b) {
    return a.tag.localeCompare(b.tag)
  })
  players.value = player
})
async function fetchAndConvertToJSON(url, type) {
  try {
    // Fetch the text file from the URL
    const response = await fetch(url)
    const textData = await response.text()

    // Split the text into lines
    const lines = textData.trim().split('\n')

    // Convert lines to JSON
    const jsonArray = type === 'ally' ? mapAlly(lines) : mapPlayer(lines)

    // Log the JSON result to the console
    return jsonArray
  } catch (error) {
    console.error('Error fetching or processing the file:', error)
  }
}

const mapAlly = (lines) => {
  return lines.map((line) => {
    const [id, name, tag] = line.split(',')

    return {
      id: parseInt(id),
      name: decodeURIComponent(name.replace(/\+/g, ' ')),
      tag: decodeURIComponent(tag.replace(/\+/g, ' ')),
    }
  })
}

const mapPlayer = (lines) => {
  return lines.map((line) => {
    const [id, name, tribe_id] = line.split(',')

    return {
      id: parseInt(id),
      name: decodeURIComponent(name.replace(/\+/g, ' ')),
      tribe_id: parseInt(tribe_id),
    }
  })
}

// player ID + name
// How to get player id ?
// https://fr89.guerretribale.fr/game.php?screen=mail&mode=new&player=1760165&name=Palou1983
// https://fr89.guerretribale.fr/map/player.txt
// https://fr89.guerretribale.fr/map/ally.txt
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
