<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const commandes = ref([])
const details = ref([])
const selected = ref(null)
const stats = ref(null)
const searchId = ref('')
const selectedStatut = ref('tous')

onMounted(async () => {
  loadCommandes()
})

async function loadCommandes() {

  const res = await axios.get('https://roskosznoah.alwaysdata.net/admin/commandes', {
    headers: getAuthHeaders()
  })
  const statsResponse = await axios.get('https://roskosznoah.alwaysdata.net/admin/stats', {
    headers: getAuthHeaders()
  })

  stats.value = statsResponse.data

  commandes.value = res.data
}

async function voirCommande(id) {

  const res = await axios.get(`https://roskosznoah.alwaysdata.net/admin/commande/${id}`, {
    headers: getAuthHeaders()
  })

  details.value = res.data
  selected.value = id
}

async function updateStatut(id, statut) {

  await axios.put(
    `https://roskosznoah.alwaysdata.net/admin/commande/${id}/statut`,
    { statut },
    {
      headers: getAuthHeaders()
    }
  )

  alert('Statut mis à jour')
}

function getAuthHeaders() {
  const token = localStorage.getItem('token')

  return {
    Authorization: `Bearer ${token}`
  }
}

const filteredCommandes = computed(() => {

  return commandes.value.filter(cmd => {

    const matchId =
      searchId.value === '' ||
      String(cmd.id_commande).includes(searchId.value)

    const matchStatut =
      selectedStatut.value === 'tous' ||
      cmd.statut === selectedStatut.value

    return matchId && matchStatut
  })

})
</script>

<template>

  <div class="page">

    <h1>📦 Admin - Commandes</h1>

    <div class="filters">

      <input v-model="searchId" placeholder="Rechercher commande #" type="text">

      <select v-model="selectedStatut">
        <option value="tous">Tous les statuts</option>
        <option value="en cours">En cours</option>
        <option value="préparée">Préparée</option>
        <option value="livrée">Livrée</option>
        <option value="annulée">Annulée</option>
      </select>

    </div>

    <div v-if="stats" class="dashboard">

      <div class="stat">
        📦 {{ stats.total_commandes }}
        <small>commandes</small>
      </div>

      <div class="stat">
        🟠 {{ stats.en_cours }}
        <small>en cours</small>
      </div>

      <div class="stat">
        🔵 {{ stats.preparees }}
        <small>préparées</small>
      </div>

      <div class="stat">
        🟢 {{ stats.livrees }}
        <small>livrées</small>
      </div>

      <div class="stat">
        🔴 {{ stats.annulees }}
        <small>annulées</small>
      </div>

    </div>

    <!-- LISTE -->
    <div v-if="!selected">

      <div v-for="cmd in filteredCommandes" :key="cmd.id_commande" class="card">

        <div class="header">

          <b>Commande #{{ cmd.id_commande }}</b>

          <div class="status-actions">

            <span class="badge" :class="cmd.statut.replace(' ', '-')">
              {{ cmd.statut.toUpperCase() }}
            </span>
            |
            <div class="actions">

              <button v-if="cmd.statut === 'en cours'" class="btn-preparee"
                @click="updateStatut(cmd.id_commande, 'préparée')">
                Préparée
              </button>

              <button v-if="cmd.statut === 'préparée'" class="btn-livree"
                @click="updateStatut(cmd.id_commande, 'livrée')">
                Livrée
              </button>

              <button v-if="cmd.statut !== 'livrée' && cmd.statut !== 'annulée'" class="btn-annulee"
                @click="updateStatut(cmd.id_commande, 'annulée')">
                Annuler
              </button>

            </div>

          </div>

        </div>

        <p>
          👤 {{ cmd.prenom }} {{ cmd.nom }}
        </p>

        <p>
          📞 {{ cmd.num_tel_utilisateur }}
        </p>

        <p>
          ✉️ {{ cmd.adr_mail }}
        </p>

        <p>
          🏠 {{ cmd.adr_postale }}
        </p>

        <p>
          📅 {{ cmd.date_commande }}
        </p>

        <button @click="voirCommande(cmd.id_commande)">
          Voir détail
        </button>

      </div>

    </div>

    <!-- DETAIL -->
    <div v-else>

      <button @click="selected = null">
        ← retour
      </button>

      <h2>Commande #{{ selected }}</h2>

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
  min-height: 100vh;
  padding: 40px 6%;
  background: #f7f3ee;
  color: #2f2a25;
}

h1 {
  text-align: center;
  font-size: 40px;
  margin-bottom: 35px;
}

/* FILTRES */

.filters {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.filters input,
.filters select {
  padding: 14px 16px;
  border: 1px solid #ddd3c9;
  border-radius: 14px;
  background: #fffdf9;
  font-size: 15px;
  outline: none;
  transition: 0.25s;
}

.filters input:focus,
.filters select:focus {
  border-color: #b8794c;
  box-shadow: 0 0 0 4px rgba(184, 121, 76, 0.15);
}

/* DASHBOARD */

.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 20px;
  margin-bottom: 35px;
}

.stat {
  background: #fffdf9;
  border-radius: 22px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(80, 60, 40, 0.08);
  transition: 0.25s;
}

.stat:hover {
  transform: translateY(-3px);
}

.stat {
  font-size: 28px;
  font-weight: 800;
}

.stat small {
  display: block;
  margin-top: 8px;
  color: #7a7068;
  font-size: 13px;
}

/* COMMANDES */

.card {
  background: #fffdf9;
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 18px;
  box-shadow: 0 10px 25px rgba(80, 60, 40, 0.08);
  transition: 0.25s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 35px rgba(80, 60, 40, 0.12);
}

.commande-line {
  margin: 0;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.commande-line b {
  font-size: 18px;
}

/* BADGES */

.badge {
  padding: 7px 13px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .5px;
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

/* INFOS CLIENT */

.card p {
  margin: 8px 0;
  color: #5f554e;
}

/* ACTIONS */

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.actions button {
  border: none;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s;
}

.actions button:hover {
  transform: translateY(-1px);
}

/* .actions button:first-child {
  background: #e8f0ff;
  color: #365f9c;
}

.actions button:nth-child(2) {
  background: #e6f4ea;
  color: #3f7a4b;
}

.actions button:last-child {
  background: #fde8e3;
  color: #aa4a37;
} */

.btn-preparee {
  background: #e8f0ff;
  color: #365f9c;
}

.btn-livree {
  background: #e6f4ea;
  color: #3f7a4b;
}

.btn-annulee {
  background: #fde8e3;
  color: #aa4a37;
}

/* VOIR DETAIL */

.card>button {
  margin-top: 15px;
  border: none;
  border-radius: 14px;
  padding: 12px 16px;
  background: #b8794c;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s;
}

.card>button:hover {
  background: #9f633c;
}

/* PAGE DETAIL */

h2 {
  margin: 25px 0;
}

.page>div:last-child>button {
  border: none;
  background: #efe7df;
  color: #5f554e;
  padding: 12px 16px;
  border-radius: 14px;
  cursor: pointer;
}

.page>div:last-child>div {
  background: #fffdf9;
  padding: 18px;
  margin-bottom: 12px;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(80, 60, 40, 0.07);
}

@media (max-width: 768px) {
  .commande-line {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions {
    width: 100%;
  }

  .actions button,
  .card>button {
    width: 100%;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.status-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
</style>