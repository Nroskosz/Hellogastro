<script setup>
import { ref } from 'vue'
import axios from 'axios'

const id = ref('')
const email = ref('')
const postale = ref('')
const password = ref('')
const tel = ref('')
const nom = ref('')
const prenom = ref('')

async function register() {

  try {

    const response = await axios.post(
      'https://roskosznoah.alwaysdata.net/register',
      {
        id: id.value,
        email: email.value,
        postal: postale.value,
        password: password.value,
        tel: tel.value,
        nom: nom.value,
        prenom: prenom.value
      }
    )

    alert(response.data.message)

  } catch (error) {
    console.log(error)
  }

}
</script>

<template>

  <div class="page">

    <div class="register-card">

      <h1>📝 Inscription</h1>

      <input v-model="id" placeholder="Identifiant">

      <input v-model="nom" placeholder="Nom">

      <input v-model="prenom" placeholder="Prenom">

      <input v-model="email" placeholder="Email">

      <input v-model="postale" placeholder="Adresse">

      <input v-model="password" type="password" placeholder="Mot de passe">

      <input v-model="tel" placeholder="Numéro de téléphone">

      <button @click="register">
        S'inscrire
      </button>

    </div>

  </div>

</template>

<style scoped>
.page {
  min-height: calc(100vh - 80px);
  padding: 40px 20px;
  background: #f7f3ee;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  margin-bottom: 28px;
  font-size: 34px;
  color: #2f2a25;
}

input {
  width: 100%;
  max-width: 420px;
  padding: 14px 16px;
  margin-bottom: 14px;
  border: 1px solid #ded3c8;
  border-radius: 14px;
  background: #fffdf9;
  color: #2f2a25;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input::placeholder {
  color: #9a8f86;
}

input:focus {
  border-color: #b8794c;
  box-shadow: 0 0 0 4px rgba(184, 121, 76, 0.15);
}

button {
  width: 100%;
  max-width: 420px;
  margin-top: 8px;
  padding: 14px 18px;
  border: none;
  border-radius: 16px;
  background: #b8794c;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

button:hover {
  background: #9f633c;
  transform: translateY(-1px);
}

.register-card {
  width: 100%;
  max-width: 500px;
  background: #fffdf9;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 12px 30px rgba(80, 60, 40, 0.08);
}
</style>