<script setup>
import { useRoute } from 'vue-router'
import { addToCart } from '../store/cart'

const props = defineProps({
  plat: Object
})
</script>

<template>
  <div class="page">

    <img :src="plat.image" />

    <h1>{{ plat.nom }}</h1>

    <p>{{ plat.description }}</p>

    <h2>{{ plat.prix }} €</h2>

    <button @click="addToCart(plat)">
      Ajouter au panier
    </button>

  </div>
</template>

<style scoped>
.page {
  min-height: calc(100vh - 80px);
  background: #f7f3ee;
  padding: 50px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

img {
  width: 100%;
  max-width: 650px;
  height: 380px;
  object-fit: cover;
  border-radius: 24px;
  box-shadow: 0 12px 30px rgba(80, 60, 40, 0.12);
}

h1 {
  margin-top: 30px;
  margin-bottom: 15px;
  font-size: 38px;
  color: #2f2a25;
  text-align: center;
}

p {
  max-width: 700px;
  text-align: center;
  color: #6f655d;
  font-size: 17px;
  line-height: 1.8;
  margin-bottom: 25px;
}

h2 {
  color: #b8794c;
  font-size: 32px;
  margin-bottom: 30px;
}

button {
  padding: 15px 35px;
  border: none;
  border-radius: 18px;
  background: #b8794c;
  color: white;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s ease;
}

button:hover {
  background: #9f633c;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(159, 99, 60, 0.25);
}
</style>