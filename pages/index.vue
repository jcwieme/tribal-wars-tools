<template>
  <div class="def">
    <Box title="Inputs">
      <div class="input">
        <label for="cibles"> Tribu tag: </label>
        <input type="text" id="tribu" name="tribu" v-model="searchAlly" />
        <ul class="propositions" v-if="searchList.length">
          <li v-for="ally in searchList" :key="ally.id" @click="selectAlly(ally)">
            {{ ally.tag }}
          </li>
        </ul>
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
          <input type="number" :name="key" :id="key" v-model.number="units[key]" />
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
/* Player logic */
const players = ref([])
const selectedPlayer = ref('')
const filteredPlayers = computed(() => {
  return selectedAlly.value ? players.value.filter((player) => player.tribe_id === selectedAlly.value.id) : []
})

/* Tribe logic */
const selectedAllyCookie = useCookie('selected_ally')
const allies = ref([])
const selectedAlly = ref(selectedAllyCookie.value || null)
const searchAlly = ref(selectedAllyCookie.value.tag || '')
const searchList = computed(() =>
  searchAlly.value.length >= 2 && (!selectedAlly.value || selectedAlly.value.tag !== searchAlly.value)
    ? allies.value.filter((ally) => ally.tag.toLowerCase().includes(searchAlly.value.toLowerCase())).slice(0, 3)
    : []
)

const selectAlly = (ally) => {
  searchAlly.value = ally.tag
  selectedAlly.value = ally
  selectedAllyCookie.value = ally
}

watch(searchAlly, () => {
  if (selectedAlly.value && selectedAlly.value.tag !== searchAlly.value) {
    selectedAlly.value = null
  }
})

/* Calculator logic */
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
  if (Object.values(units.value).every((value) => value === 0)) return null

  const cibles = textAreaInput.value.match(/\d{3}\|\d{3}/g)
  if (!cibles) return null

  const totalCibles = cibles.length

  const unitsPerCible = Object.fromEntries(
    Object.entries(units.value).map(([key, value]) => [key, Math.floor(value / totalCibles)])
  )

  const remainder = Object.fromEntries(Object.entries(units.value).map(([key, value]) => [key, value % totalCibles]))

  return cibles.map((cible, index) => ({
    cible,
    units: Object.fromEntries(
      Object.entries(unitsPerCible)
        .map(([key, value]) => [key, value + (index === 0 ? remainder[key] : 0)])
        .filter(([, value]) => value > 0)
    ),
  }))
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

/* Fetch and convert the ally and player data */
onMounted(async () => {
  try {
    const [ally, playersList] = await Promise.all([
      fetch('/web-api/fetch-data', {
        method: 'POST',
        credentials: 'omit',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: 'https://fr89.guerretribale.fr/map/ally.txt', type: 'ally' }),
      }).then((res) => res.json()),
      fetch('/web-api/fetch-data', {
        method: 'POST',
        credentials: 'omit',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: 'https://fr89.guerretribale.fr/map/player.txt', type: 'player' }),
      }).then((res) => res.json()),
    ])

    if (!ally || !playersList) return

    allies.value = ally.sort((a, b) => a.tag.localeCompare(b.tag))
    players.value = playersList
  } catch (error) {
    console.error(error)
  }
})
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
  position: relative;
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
.propositions {
  position: absolute;
  border: 1px solid #aaa;
  background: #fbf3df;
  border-radius: 4px;
  overflow-y: auto;
  width: 100%;
  z-index: 1;
  bottom: 0;
  transform: translateY(calc(100% + 18px));
  list-style: none;
  padding: 5px;
}
.propositions li {
  cursor: pointer;
  padding: 10px 5px;
  font-size: 10px;
  line-height: 12px;
  border: 1px solid transparent;
}
.propositions li:hover {
  border: 1px solid #999;
  background: #f0d69a;
  border-radius: 4px;
}
</style>
