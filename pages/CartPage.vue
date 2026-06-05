<script setup>
import {
  cart,
  removeFromCart,
  decreaseQuantity,
  addToCart,
  getTotal
} from '../store/cart'

async function payer() {
  const token = localStorage.getItem('token')

  if (!token) {
    alert('Veuillez vous connecter pour payer')
    return
  }

  try {
    const response = await fetch(
      'https://roskosznoah.alwaysdata.net/api/create-checkout-session',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cart: cart.items
        })
      }
    )

    const data = await response.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      alert(data.message || 'Erreur paiement')
    }

  } catch (error) {
    console.log('ERREUR FETCH STRIPE:', error)
    alert('Impossible de contacter le serveur de paiement')
  }
}

</script>

<template>
  <div class="page">

    <h1>🛒 Panier</h1>

    <div v-if="cart.items.length === 0">
      Panier vide
    </div>

    <div v-else>

      <div v-for="item in cart.items" :key="item.id_plat" class="item">

        <h3>{{ item.libel_plat }}</h3>

        <div class="qty">

          <button @click="decreaseQuantity(item.id_plat)">➖</button>

          <span>{{ item.quantity }}</span>

          <button @click="addToCart(item)">➕</button>

        </div>

        <p>{{ item.prix_plat }} €</p>

        <button @click="removeFromCart(item.id_plat)">
          Supprimer
        </button>

      </div>

      <hr>

      <h2>Total : {{ getTotal() }} €</h2>
      <button class="order-btn" @click="payer">
        Payer la commande
      </button>

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

.page>div {
  max-width: 850px;
  margin: 0 auto;
}

.page>div:first-of-type {
  text-align: center;
  color: #7a7068;
  font-size: 18px;
}

.item {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 18px;
  align-items: center;
  margin-bottom: 16px;
  padding: 20px 22px;
  border-radius: 22px;
  background: #fffdf9;
  box-shadow: 0 10px 25px rgba(80, 60, 40, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.item:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 35px rgba(80, 60, 40, 0.13);
}

.item h3 {
  margin: 0;
  font-size: 18px;
  color: #2f2a25;
}

.item p {
  margin: 0;
  font-weight: 700;
  color: #9a6b45;
  white-space: nowrap;
}

.qty {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f6ede3;
  padding: 6px;
  border-radius: 999px;
}

.qty span {
  min-width: 24px;
  text-align: center;
  font-weight: 800;
  color: #2f2a25;
}

button {
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 700;
  transition: background 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}

.qty button {
  width: 34px;
  height: 34px;
  background: #fffdf9;
  color: #7a5540;
}

.qty button:hover {
  background: #ead8c8;
  transform: scale(1.05);
}

.item>button {
  padding: 10px 14px;
  background: #f3dfd8;
  color: #a64f3d;
}

.item>button:hover {
  background: #ebc8bd;
  transform: translateY(-1px);
}

hr {
  border: none;
  height: 1px;
  background: linear-gradient(to right, transparent, #d8cfc5, transparent);
  margin: 32px 0 24px;
}

h2 {
  text-align: right;
  font-size: 28px;
  color: #2f2a25;
  margin-bottom: 18px;
}

.order-btn {
  display: block;
  margin-left: auto;
  padding: 14px 24px;
  border-radius: 16px;
  background: #b8794c;
  color: white;
  font-size: 16px;
}

.order-btn:hover {
  background: #9f633c;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(159, 99, 60, 0.22);
}

@media (max-width: 700px) {
  .item {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .qty {
    justify-content: center;
    width: fit-content;
    margin: 0 auto;
  }

  h2 {
    text-align: center;
  }

  .order-btn {
    margin: 0 auto;
    width: 100%;
  }
}
</style>