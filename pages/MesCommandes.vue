<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const commandes = ref([])

const selectedCommande = ref(null)
const details = ref([])

onMounted(async () => {
  const res = await axios.get(
    'https://roskosznoah.alwaysdata.net/mes-commandes',
    {
      headers: getAuthHeaders()
    }
  )

  console.log(res.data)
  commandes.value = res.data
})

async function voirCommande(id) {
  const res = await axios.get(
    `https://roskosznoah.alwaysdata.net/mes-commandes/${id}`,
    {
      headers: getAuthHeaders()
    }
  )

  details.value = res.data
  selectedCommande.value = id
}

function getAuthHeaders() {
  const token = localStorage.getItem('token')

  return {
    Authorization: `Bearer ${token}`
  }
}

</script>

<template>

  <div class="page">

    <h1>📦 Mes commandes</h1>

    <!-- LISTE -->
    <div v-if="!selectedCommande">

      <div v-for="cmd in commandes" :key="cmd.id_commande" class="card">

        <p class="commande-line">Commande #{{ cmd.id_commande }}
          <span class="badge" :class="cmd.statut.replace(' ', '-')">{{ cmd.statut.toUpperCase() }}</span>
        </p>
        <p>{{ cmd.date_commande }}</p>

        <button @click="voirCommande(cmd.id_commande)">
          Voir détail
        </button>

      </div>

    </div>

    <!-- DETAILS -->
    <div v-else>

      <button @click="selectedCommande = null">
        ← Retour
      </button>

      <h2>Détail commande #{{ selectedCommande }}</h2>

      <div v-for="item in details" :key="item.libel_plat">

        <p>
          {{ item.libel_plat }} | {{ item.prix_plat }} € × {{ item.qte }}
          | {{ item.total_ligne }} €
        </p>

      </div>

    </div>

  </div>

</template>

<style scoped>
.page {
  min-height: calc(100vh - 80px);
  padding: 40px 6%;
  background: #f7f3ee;
  color: #2f2a25;
}

h1 {
  text-align: center;
  font-size: 36px;
  margin-bottom: 36px;
}

h2 {
  margin: 28px 0 20px;
  color: #2f2a25;
}

.card {
  max-width: 760px;
  margin: 0 auto 18px;
  padding: 22px 24px;
  border-radius: 22px;
  background: #fffdf9;
  box-shadow: 0 10px 25px rgba(80, 60, 40, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 35px rgba(80, 60, 40, 0.13);
}

.commande-line {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin: 0 0 10px;
  font-size: 17px;
  font-weight: 700;
}

.card p:nth-child(2) {
  margin: 0 0 18px;
  color: #7a7068;
  font-size: 14px;
}

.badge {
  padding: 7px 13px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.en-cours {
  background: #fff2d8;
  color: #a96a00;
}

.préparée {
  background: #e7efff;
  color: #365f9c;
}

.livrée {
  background: #e6f4ea;
  color: #3f7a4b;
}

.annulée {
  background: #fde8e3;
  color: #aa4a37;
}

button {
  padding: 11px 18px;
  border: none;
  border-radius: 14px;
  background: #b8794c;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

button:hover {
  background: #9f633c;
  transform: translateY(-1px);
}

.page > div {
  max-width: 800px;
  margin: 0 auto;
}

.page > div[v-else] {
  background: #fffdf9;
}

div[v-else] > div {
  padding: 16px 18px;
  margin-bottom: 12px;
  border-radius: 16px;
  background: #fffdf9;
  box-shadow: 0 8px 20px rgba(80, 60, 40, 0.07);
}

div[v-else] p {
  margin: 0;
  color: #5f554e;
  font-size: 15px;
}
</style>