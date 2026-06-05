<script setup>
import { ref, onMounted } from 'vue'
import { watch } from 'vue'
import axios from 'axios'

const imageFile = ref(null)
const plats = ref([])
const editingId = ref(null)
const ingredients = ref([
    { id_ingredient: 1, qte_ingredient: 1 },
    { id_ingredient: 3, qte_ingredient: 2 }
])
const selectedIngredients = ref([])
const types = ref([])
const form = ref({
    libel_plat: '',
    prix_plat: '',
    description: '',
    image: '',
    id_type: ''
})

onMounted(async () => {
    loadPlats()
    loadIngredients()
    loadTypes()
})

async function loadPlats() {
    const res = await axios.get('https://roskosznoah.alwaysdata.net/plats', {
        headers: getAuthHeaders()
    })

    plats.value = res.data
}

async function addPlat() {

    await axios.post(
        'https://roskosznoah.alwaysdata.net/admin/plats',
        {
            ...form.value,
            ingredients: selectedIngredients.value
        },
        {
            headers: getAuthHeaders()
        }
    )

    // reset propre
    form.value = {
        libel_plat: '',
        prix_plat: '',
        description: '',
        image: '',
        id_type: ''
    }

    selectedIngredients.value = []

    loadPlats()
}

async function deletePlat(id) {

    if (!confirm("Supprimer ce plat ?")) return

    await axios.delete(`https://roskosznoah.alwaysdata.net/admin/plats/${id}`, {
        headers: getAuthHeaders()
    })

    loadPlats()
}

async function editPlat(plat) {

    editingId.value = plat.id_plat

    form.value = {
        libel_plat: plat.libel_plat,
        prix_plat: plat.prix_plat,
        description: plat.description,
        image: plat.image,
        id_type: plat.id_type
    }

    const res = await axios.get(
        `https://roskosznoah.alwaysdata.net/admin/plats/${plat.id_plat}/ingredients`,
        {
            headers: getAuthHeaders()
        }
    )

    selectedIngredients.value = res.data.map(i => ({
        id_ingredient: i.id_ingredient,
        qte_ingredient: i.qte_ingredient
    }))

}

async function updatePlat() {
    console.log("1 - updatePlat appelé")

    await axios.put(
        `https://roskosznoah.alwaysdata.net/admin/plats/${editingId.value}`,
        {
            libel_plat: form.value.libel_plat,
            prix_plat: form.value.prix_plat,
            description: form.value.description,
            image: form.value.image,
            ingredients: selectedIngredients.value,
            id_type: form.value.id_type
        },
        {
            headers: getAuthHeaders()
        }
    )
    console.log("2 - axios terminé")

    editingId.value = null
    selectedIngredients.value = []

    form.value = {
        libel_plat: '',
        prix_plat: '',
        description: '',
        image: '',
        id_type: ''
    }

    loadPlats()
}

async function loadIngredients() {

    const response = await axios.get(
        'https://roskosznoah.alwaysdata.net/ingredients'
    )

    ingredients.value = response.data

}
watch(selectedIngredients, () => {
    console.log(selectedIngredients.value)
})

async function handleImage(event) {

    const file = event.target.files[0]

    imageFile.value = file

    const formData = new FormData()

    formData.append('image', file)

    const response = await axios.post(
        'https://roskosznoah.alwaysdata.net/upload',
        formData
    )

    form.value.image = response.data.imageUrl
}
function isIngredientSelected(id) {
    return selectedIngredients.value.some(
        i => i.id_ingredient === id
    )
}

function toggleIngredient(id) {
    const index = selectedIngredients.value.findIndex(
        i => i.id_ingredient === id
    )

    if (index === -1) {
        selectedIngredients.value.push({
            id_ingredient: id,
            qte_ingredient: 1
        })
    } else {
        selectedIngredients.value.splice(index, 1)
    }
}

function getIngredientQuantity(id) {
    const item = selectedIngredients.value.find(
        i => i.id_ingredient === id
    )

    return item ? item.qte_ingredient : 1
}

function updateIngredientQuantity(id, value) {
    const item = selectedIngredients.value.find(
        i => i.id_ingredient === id
    )

    if (item) {
        item.qte_ingredient = Number(value)
    }
}

function getAuthHeaders() {
    const token = localStorage.getItem('token')

    return {
        Authorization: `Bearer ${token}`
    }
}

async function loadTypes() {

    const res = await axios.get(
        'https://roskosznoah.alwaysdata.net/types-plat'
    )

    types.value = res.data

}
</script>
<template>
    <div class="page">

        <h1>⚙️ Admin - Plats</h1>

        <!-- FORM -->
        <div class="form">

            <input v-model="form.libel_plat" placeholder="Nom" />
            <input v-model="form.prix_plat" placeholder="Prix" />
            <input v-model="form.description" placeholder="Description" />
            <input type="file" @change="handleImage" />
            <img v-if="form.image" :src="form.image" class="preview" />
            <h3>Ingrédients</h3>

            <div class="ingredients-grid">

                <div v-for="ingredient in ingredients" :key="ingredient.id_ingredient" class="ingredient-line">
                    <label>
                        <input type="checkbox" :checked="isIngredientSelected(ingredient.id_ingredient)"
                            @change="toggleIngredient(ingredient.id_ingredient)">

                        {{ ingredient.libel_ingredient }}
                    </label>

                    <input v-if="isIngredientSelected(ingredient.id_ingredient)" type="number" min="1"
                        :value="getIngredientQuantity(ingredient.id_ingredient)" @input="updateIngredientQuantity(
                            ingredient.id_ingredient,
                            $event.target.value
                        )" class="qty-input">

                </div>

            </div>

            <select v-model="form.id_type">
                <option value="">Choisir un type</option>

                <option v-for="type in types" :key="type.id_type" :value="type.id_type">
                    {{ type.libel_type }}
                </option>
            </select>

            <button v-if="editingId === null" @click="addPlat">
                Ajouter
            </button>

            <button type="button" v-else @click="updatePlat">
                Sauvegarder
            </button>

        </div>

        <hr />

        <!-- LISTE -->
        <div v-for="plat in plats" :key="plat.id_plat" class="card">

            <h3>{{ plat.libel_plat }}</h3>

            <p>{{ plat.prix_plat }} €</p>


            <button @click="editPlat(plat)">
                ✏️ Modifier
            </button>

            <button @click="deletePlat(plat.id_plat)">
                🗑️ Supprimer
            </button>

        </div>

    </div>
</template>
<style scoped>
.page {
    min-height: 100vh;
    background: #f7f3ee;
    padding: 40px 6%;
}

h1 {
    text-align: center;
    color: #2f2a25;
    margin-bottom: 35px;
    font-size: 38px;
}

/* FORMULAIRE */

.form {
    background: #fffdf9;
    border-radius: 24px;
    padding: 30px;
    box-shadow: 0 12px 30px rgba(80, 60, 40, 0.08);
    margin-bottom: 40px;

    display: flex;
    flex-direction: column;
    gap: 14px;
}

.form input,
.form select {
    padding: 14px;
    border: 1px solid #ddd3c9;
    border-radius: 14px;
    background: white;
    font-size: 15px;
    outline: none;
    transition: 0.25s;
}

.form input:focus,
.form select:focus {
    border-color: #b8794c;
    box-shadow: 0 0 0 4px rgba(184, 121, 76, 0.15);
}

.form h3 {
    margin-top: 15px;
    color: #2f2a25;
}

/* INGREDIENTS */

.ingredient-line {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 10px 12px;

    background: #faf7f3;
    border-radius: 12px;
}

.ingredients-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
}

.qty-input {
    width: 80px;
    padding: 8px;
}

/* IMAGE */

.preview {
    width: 200px;
    height: 140px;
    object-fit: cover;
    border-radius: 18px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

/* BOUTONS */

.form button {
    padding: 14px;
    border: none;
    border-radius: 16px;
    background: #b8794c;
    color: white;
    font-weight: 700;
    cursor: pointer;
    transition: 0.25s;
}

.form button:hover {
    background: #9f633c;
}

/* SEPARATEUR */

hr {
    border: none;
    height: 1px;
    background: linear-gradient(to right,
            transparent,
            #d8cfc5,
            transparent);
    margin: 35px 0;
}

/* LISTE DES PLATS */

.card {
    background: #fffdf9;
    border-radius: 22px;
    padding: 20px 25px;
    margin-bottom: 18px;

    display: flex;
    align-items: center;
    gap: 20px;

    box-shadow: 0 10px 25px rgba(80, 60, 40, 0.08);

    transition: 0.25s;
}

.card:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 35px rgba(80, 60, 40, 0.12);
}

.card h3 {
    flex: 1;
    margin: 0;
    color: #2f2a25;
}

.card p {
    margin: 0;
    font-weight: bold;
    color: #9a6b45;
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

.card button {
    border: none;
    border-radius: 14px;
    padding: 10px 14px;
    cursor: pointer;
    font-weight: 600;
    transition: 0.25s;
}

.card button:hover {
    transform: translateY(-1px);
}

@media (max-width: 768px) {

    .card {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
    }

    .card h3,
    .card p {
        text-align: center;
    }

    .card button {
        width: 100%;
    }

    .preview {
        width: 100%;
        height: 220px;
    }
}

@media (max-width: 1200px) {
  .ingredients-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 800px) {
  .ingredients-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 500px) {
  .ingredients-grid {
    grid-template-columns: 1fr;
  }
}
</style>