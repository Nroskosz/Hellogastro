<script setup>
import { defineEmits } from 'vue'
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import PlatCard from '../components/PlatCard.vue'
import { addToCart } from '../store/cart'

const plats = ref([])
const emit = defineEmits(['toast'])
const types = ref([])


function handleAdd(plat) {
  addToCart(plat)
  emit('toast', 'Ajouté au panier ✔')
}

onMounted(async () => {

  try {

    const response = await axios.get(
      'https://roskosznoah.alwaysdata.net/plats-with-allergenes'
    )


    plats.value = response.data

  } catch (error) {
    console.log(error)
  }

  loadTypes()
})

const platsParType = computed(() => {
  return {
    Entree: plats.value.filter(p => p.libel_type === 'Entrée'),
    Plat: plats.value.filter(p => p.libel_type === 'Plat'),
    Dessert: plats.value.filter(p => p.libel_type === 'Dessert')
  }
})

async function loadTypes() {

  const res = await axios.get(
    'https://roskosznoah.alwaysdata.net/types-plat'
  )

  types.value = res.data

}
</script>

<template>
  <div class="page">

    <h1>🍽️ Menu</h1>

    <section>
      <h2>🥗 Entrées</h2>
      <hr>

      <div class="grid">
        <PlatCard v-for="plat in platsParType.Entree" :key="plat.id_plat" :plat="plat" @add-to-cart="handleAdd" />
      </div>
    </section>

    <section>
      <h2>🍔 Plats</h2>
      <hr>

      <div class="grid">
        <PlatCard v-for="plat in platsParType.Plat" :key="plat.id_plat" :plat="plat" @add-to-cart="handleAdd" />
      </div>
    </section>

    <section>
      <h2>🍰 Desserts</h2>
      <hr>

      <div class="grid">
        <PlatCard v-for="plat in platsParType.Dessert" :key="plat.id_plat" :plat="plat" @add-to-cart="handleAdd" />
      </div>
    </section>

  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 40px 6%;
  background: #f7f3ee;
  color: #2f2a25;
}

h1 {
  text-align: center;
  font-size: 42px;
  margin-bottom: 50px;
  font-weight: 800;
  color: #2d2926;
}

section {
  margin-bottom: 60px;
}

section h2 {
  font-size: 26px;
  margin-bottom: 12px;
  color: #3b342f;
}

hr {
  border: none;
  height: 1px;
  background: linear-gradient(to right, #d8cfc5, transparent);
  margin-bottom: 28px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 28px;
}
</style>