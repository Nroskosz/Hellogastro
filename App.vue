<script setup>
import { ref, computed } from 'vue'
import { cart } from './store/cart'
import { user, logout } from './store/user'

import HomePage from './pages/HomePage.vue'
import MenuPage from './pages/MenuPage.vue'
import CartPage from './pages/CartPage.vue'
import RegisterPage from './pages/RegisterPage.vue'
import LoginPage from './pages/LoginPage.vue'
import MesCommandes from './pages/MesCommandes.vue'
import AdminPage from './pages/AdminPage.vue'
import AdminCommandes from './pages/AdminCommandes.vue'
import AdminIngredients from './pages/AdminIngredients.vue'
import SuccessPage from './pages/SuccessPage.vue'


const urlParams = new URLSearchParams(window.location.search)
const initialPage = urlParams.get('page') || 'home'

const page = ref(initialPage)
const toast = ref('')
const showToast = ref(false)



function triggerToast(message) {
  toast.value = message
  showToast.value = true

  setTimeout(() => {
    showToast.value = false
  }, 2000)
}
function logoutUser() {
  logout()
  page.value = 'home'
}

const cartCount = computed(() => {
  return cart.items.reduce((total, item) => total + item.quantity, 0)
})
</script>

<template>

  <nav class="navbar">

    <div class="logo">
      HelloGastro
    </div>
    <div class="user" v-if="user.data">👤 {{ user.data.nom }}</div>
    <div v-else>👤 Invité</div>
    <div class="admin-links" v-if="user.data?.role === 'admin'">

      <button @click="page = 'admin'">
        ⚙️ Plats
      </button>

      <button @click="page = 'adminOrders'">
        📦 Commandes
      </button>

      <button @click="page = 'adminIngredients'">
        🥬 Ingrédients
      </button>

    </div>

    <div class="links">

      <button @click="page = 'home'">Accueil</button>
      <button @click="page = 'menu'">Menu</button>
      <button v-if="user.data" @click="logoutUser">Déconnexion</button>
      <button v-if="!user.data" @click="page = 'register'">Inscription</button>
      <button v-if="!user.data" @click="page = 'login'">Connexion</button>
      <button v-if="user.data" @click="page = 'cart'">🛒 Panier ({{ cartCount }})</button>
      <button v-if="user.data" @click="page = 'orders'">📦 Mes commandes</button>


    </div>

  </nav>

  <HomePage v-if="page === 'home'" />
  <MenuPage v-if="page === 'menu'" @toast="triggerToast" />
  <CartPage v-if="page === 'cart'" />
  <div v-if="showToast" class="toast">{{ toast }}</div>
  <RegisterPage v-if="page === 'register'" />
  <LoginPage v-if="page === 'login'" />
  <MesCommandes v-if="page === 'orders'" />
  <AdminPage v-if="page === 'admin'" />
  <AdminCommandes v-if="page === 'adminOrders'" />
  <AdminIngredients v-if="page === 'adminIngredients'" />
  <SuccessPage v-if="page === 'success'" />

</template>

<style>
body {
  margin: 0;
  background: #f7f3ee;
  font-family: Inter, Arial, sans-serif;
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;

  padding: 16px 30px;

  background: #fffdf9;
  border-bottom: 1px solid #ece3d8;

  box-shadow: 0 4px 20px rgba(80, 60, 40, 0.05);
}

.logo {
  font-size: 24px;
  font-weight: 800;
  color: #b8794c;
  cursor: pointer;
}

.user {
  padding: 8px 14px;
  border-radius: 999px;
  background: #f6ede3;
  color: #7a5540;
  font-weight: 600;
}

.links {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.navbar button {
  border: none;
  border-radius: 14px;
  padding: 10px 14px;

  background: transparent;

  color: #4f4741;
  font-weight: 600;

  cursor: pointer;
  transition: 0.25s;
}

.navbar button:hover {
  background: #f6ede3;
  color: #b8794c;
}

/* Bouton panier */

.links button:nth-last-child(2) {
  background: #b8794c;
  color: white;
}

.links button:nth-last-child(2):hover {
  background: #9f633c;
}

/* Boutons admin */

.navbar button:has(+ .links),
.navbar>button {
  background: #efe7df;
}

/* Toast */

.toast {
  position: fixed;
  right: 25px;
  bottom: 25px;

  background: #4caf50;
  color: white;

  padding: 14px 20px;
  border-radius: 16px;

  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);

  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 900px) {

  .navbar {
    flex-direction: column;
    align-items: stretch;
  }

  .logo {
    text-align: center;
  }

  .user {
    text-align: center;
  }

  .links {
    justify-content: center;
  }

  .navbar button {
    width: 100%;
  }
}

.admin-links {
  display: flex;
  gap: 10px;
}
</style>