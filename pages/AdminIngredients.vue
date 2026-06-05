<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const ingredients = ref([])
const editingId = ref(null)
const allergenes = ref([])
const selectedAllergenes = ref([])

const form = ref({
  libel_ingredient: '',
  stock: 0
})

function getAuthHeaders() {
  const token = localStorage.getItem('token')

  return {
    Authorization: `Bearer ${token}`
  }
}

onMounted(() => {
  loadIngredients()
  loadAllergenes()
})

async function loadAllergenes() {
  const res = await axios.get('https://roskosznoah.alwaysdata.net/admin/allergenes', {
    headers: getAuthHeaders()
  })

  allergenes.value = res.data
}

async function loadIngredients() {
  const res = await axios.get(
    'https://roskosznoah.alwaysdata.net/admin/ingredients',
    {
      headers: getAuthHeaders()
    }
  )

  ingredients.value = res.data
}

async function addIngredient() {
  await axios.post(
    'https://roskosznoah.alwaysdata.net/admin/ingredients',
    {
      ...form.value,
      allergenes: selectedAllergenes.value
    },
    {
      headers: getAuthHeaders()
    }
  )

  resetForm()
  loadIngredients()
}

async function editIngredient(ingredient) {
  editingId.value = ingredient.id_ingredient

  form.value = {
    libel_ingredient: ingredient.libel_ingredient,
    stock: ingredient.stock
  }

  const res = await axios.get(
    `https://roskosznoah.alwaysdata.net/admin/ingredients/${ingredient.id_ingredient}/allergenes`,
    {
      headers: getAuthHeaders()
    }
  )

  selectedAllergenes.value = res.data.map(a => a.id_allergene)
}

async function updateIngredient() {
  await axios.put(
    `https://roskosznoah.alwaysdata.net/admin/ingredients/${editingId.value}`,
    form.value,
    {
      ...form.value,
      allergenes: selectedAllergenes.value
    },
    {
      headers: getAuthHeaders()
    }
  )

  resetForm()
  loadIngredients()
}

async function deleteIngredient(id) {
  if (!confirm('Supprimer cet ingrédient ?')) return

  await axios.delete(
    `https://roskosznoah.alwaysdata.net/admin/ingredients/${id}`,
    {
      headers: getAuthHeaders()
    }
  )

  loadIngredients()
}

function resetForm() {
  editingId.value = null
  selectedAllergenes.value = []

  form.value = {
    libel_ingredient: '',
    stock: 0,
  }
}
</script>

<template>
  <div class="page">
    <h1>🥬 Admin - Ingrédients</h1>

    <div class="form">
      <input v-model="form.libel_ingredient" placeholder="Nom ingrédient">

      <input v-model="form.stock" type="number" min="0" placeholder="Stock">

      <h3 class="allergenes-title">Allergènes</h3>

      <div class="allergenes-grid">
        <label v-for="allergene in allergenes" :key="allergene.id_allergene" class="allergene-card">
          <input type="checkbox" :value="allergene.id_allergene" v-model="selectedAllergenes">

          <span>{{ allergene.libel_allergene }}</span>
        </label>
      </div>

      <button v-if="editingId === null" @click="addIngredient">
        Ajouter
      </button>

      <button v-else @click="updateIngredient">
        Modifier
      </button>

      <button v-if="editingId !== null" @click="resetForm">
        Annuler
      </button>
    </div>

    <hr>

    <div v-for="ingredient in ingredients" :key="ingredient.id_ingredient" class="card">
      <h3>{{ ingredient.libel_ingredient }}</h3>

      <p>
        Stock :
        <strong :class="{ low: ingredient.stock <= 5 }">
          {{ ingredient.stock }}g
        </strong>
      </p>

      <p v-if="ingredient.stock <= 5" class="warning">
        ⚠ Stock faible
      </p>

      <button @click="editIngredient(ingredient)">
        ✏️ Modifier
      </button>

      <button @click="deleteIngredient(ingredient.id_ingredient)">
        🗑️ Supprimer
      </button>
    </div>
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
  font-size: 38px;
  margin-bottom: 35px;
}

/* FORMULAIRE */

.form {
  max-width: 900px;
  margin: 0 auto 35px;
  padding: 28px;
  background: #fffdf9;
  border-radius: 24px;
  box-shadow: 0 12px 30px rgba(80, 60, 40, 0.08);

  display: grid;
  grid-template-columns: 1fr 160px auto auto;
  gap: 14px;
  align-items: center;
}

.form input {
  padding: 14px 16px;
  border: 1px solid #ddd3c9;
  border-radius: 14px;
  background: white;
  color: #2f2a25;
  font-size: 15px;
  outline: none;
  transition: 0.25s ease;
}

.form input:focus {
  border-color: #b8794c;
  box-shadow: 0 0 0 4px rgba(184, 121, 76, 0.15);
}

.form input::placeholder {
  color: #9a8f86;
}

/* BOUTONS */

button {
  border: none;
  border-radius: 14px;
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 700;
  transition: 0.25s ease;
}

button:hover {
  transform: translateY(-1px);
}

.form button {
  background: #b8794c;
  color: white;
}

.form button:hover {
  background: #9f633c;
}

.form button:last-child {
  background: #efe7df;
  color: #6f655d;
}

/* SEPARATEUR */

hr {
  max-width: 900px;
  border: none;
  height: 1px;
  background: linear-gradient(to right, transparent, #d8cfc5, transparent);
  margin: 35px auto;
}

/* CARTES INGREDIENTS */

.card {
  max-width: 900px;
  margin: 0 auto 16px;
  padding: 20px 24px;
  background: #fffdf9;
  border-radius: 22px;
  box-shadow: 0 10px 25px rgba(80, 60, 40, 0.08);

  display: grid;
  grid-template-columns: 1fr 140px 150px auto auto;
  gap: 16px;
  align-items: center;

  transition: 0.25s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 35px rgba(80, 60, 40, 0.12);
}

.card h3 {
  margin: 0;
  font-size: 18px;
}

.card p {
  margin: 0;
  color: #6f655d;
}

.card strong {
  color: #2f2a25;
}

.low {
  color: #a94e3c !important;
}

.warning {
  width: fit-content;
  padding: 7px 11px;
  border-radius: 999px;
  background: #fde8e3;
  color: #a94e3c !important;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

/* BOUTON MODIFIER */

.card button:first-of-type {
  background: #e8f0ff;
  color: #3f5f95;
}

/* BOUTON SUPPRIMER */

.card button:last-of-type {
  background: #fde7e2;
  color: #a54d3f;
}

.allergenes-title {
  grid-column: 1 / -1;
  margin: 18px 0 4px;
  color: #2f2a25;
}

.allergenes-grid {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.allergene-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: #faf7f3;
  border: 1px solid #eadfd4;
  color: #5f554e;
  cursor: pointer;
  transition: 0.25s ease;
}

.allergene-card:hover {
  background: #f6ede3;
  transform: translateY(-1px);
}

.allergene-card input {
  accent-color: #b8794c;
}

.allergene-card span {
  font-size: 14px;
  font-weight: 600;
}

/* RESPONSIVE */

@media (max-width: 850px) {
  .form {
    grid-template-columns: 1fr;
  }

  .card {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .warning {
    margin: 0 auto;
  }

  .card button {
    width: 100%;
  }
}

@media (max-width: 850px) {
  .allergenes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 500px) {
  .allergenes-grid {
    grid-template-columns: 1fr;
  }
}
</style>