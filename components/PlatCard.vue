<script setup>
import { defineProps, defineEmits } from 'vue'
defineProps({
  plat: Object
})

defineEmits(['add-to-cart'])
</script>

<template>
  <div class="card">

    <img :src="plat.image" alt="plat" />

    <h3>{{ plat.libel_plat }} <strong>{{ plat.prix_plat }} €</strong></h3>

    <div class="allergenes-zone">
      <p v-if="plat.allergenes && plat.allergenes.length">
        <span v-for="allergene in plat.allergenes" :key="allergene">
          {{ allergene }}
        </span>
      </p>
    </div>

    <p>{{ plat.description }}</p>

    <button v-if="plat.disponible" @click="$emit('add-to-cart', plat)">
      Ajouter
    </button>

    <button v-else disabled>
      Indisponible
    </button>

  </div>
</template>

<style scoped>
.card {
  height: 100%;
  background: #fffdf9;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(80, 60, 40, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 35px rgba(80, 60, 40, 0.14);
}

img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

h3 {
  padding: 16px 16px 6px;
  margin: 0;
  font-size: 18px;
  color: #2f2a25;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

h3 strong {
  color: #9a6b45;
  white-space: nowrap;
}

.card > p {
  padding: 0 16px;
  margin: 8px 0 18px;
  font-size: 14px;
  line-height: 1.5;
  color: #6f655d;
}

.allergenes-zone {
  min-height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.allergenes-zone p {
  margin: 0;
  font-size: 12px;
  color: #9b6a3f;
  background: #f6ede3;
  padding: 7px 10px;
  border-radius: 999px;
}

.allergenes-zone span:not(:last-child)::after {
  content: ", ";
}

button {
  margin: auto 16px 16px;
  padding: 11px 14px;
  border: none;
  border-radius: 14px;
  background: #b8794c;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

button:hover:not(:disabled) {
  background: #9f633c;
  transform: translateY(-1px);
}

button:disabled {
  background: #d8d0c8;
  color: #8a8179;
  cursor: not-allowed;
}
</style>